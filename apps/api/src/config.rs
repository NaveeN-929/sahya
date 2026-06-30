use sqlx::PgPool;
use sqlx::postgres::PgPoolOptions;

/// Shared application state.
///
/// `db` is intentionally `Option<PgPool>` rather than a bare `PgPool`: per PRD §11.6,
/// `/api/v1/directory/crisis-resources` must keep working even if Postgres is unreachable,
/// so the whole process must not refuse to start just because the database is down at
/// boot. Routes that need the database should reject clearly when it's `None`, not panic.
#[derive(Clone)]
pub struct AppState {
    pub db: Option<PgPool>,
}

impl AppState {
    pub async fn connect() -> Self {
        let Ok(database_url) = std::env::var("DATABASE_URL") else {
            tracing::warn!("DATABASE_URL not set — starting without a database connection");
            return Self { db: None };
        };

        match PgPoolOptions::new()
            .max_connections(10)
            .connect(&database_url)
            .await
        {
            Ok(pool) => Self { db: Some(pool) },
            Err(err) => {
                tracing::error!(
                    %err,
                    "failed to connect to Postgres — starting without a database connection"
                );
                Self { db: None }
            }
        }
    }
}
