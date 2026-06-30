//! One-off CLI for bootstrapping an admin account. There is no public admin self-registration
//! endpoint by design (see `admin_auth.rs`) — this is the only way to create one, run by
//! whoever already has shell/DB access to the deployment.
//!
//! Usage: `cargo run --bin create_admin -- --email you@example.com --password <pw> --name "Your Name"`

use api::admin_auth;
use sqlx::postgres::PgPoolOptions;

fn parse_arg(args: &[String], flag: &str) -> Option<String> {
    args.iter()
        .position(|a| a == flag)
        .and_then(|i| args.get(i + 1))
        .cloned()
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    let args: Vec<String> = std::env::args().collect();

    let email = parse_arg(&args, "--email")
        .ok_or_else(|| anyhow::anyhow!("missing required --email <address>"))?;
    let password = parse_arg(&args, "--password")
        .ok_or_else(|| anyhow::anyhow!("missing required --password <password>"))?;
    let display_name = parse_arg(&args, "--name").unwrap_or_else(|| email.clone());

    if password.len() < 12 {
        return Err(anyhow::anyhow!(
            "password must be at least 12 characters for an admin account"
        ));
    }

    let database_url = std::env::var("DATABASE_URL")
        .map_err(|_| anyhow::anyhow!("DATABASE_URL must be set"))?;
    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&database_url)
        .await?;
    sqlx::migrate!("./migrations").run(&pool).await?;

    let password_hash = admin_auth::hash_password(&password)?;

    sqlx::query(
        "insert into admins (email, password_hash, display_name) values ($1, $2, $3) \
         on conflict (email) do update set password_hash = excluded.password_hash, \
                                            display_name = excluded.display_name",
    )
    .bind(&email)
    .bind(&password_hash)
    .bind(&display_name)
    .execute(&pool)
    .await?;

    println!("admin account ready: {email}");
    Ok(())
}
