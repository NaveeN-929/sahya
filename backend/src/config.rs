use std::sync::Arc;

use sqlx::PgPool;
use sqlx::postgres::PgPoolOptions;

use crate::crypto::MasterKey;
use crate::llm::{LlmProvider, OllamaProvider};

/// Shared application state.
///
/// `db` is intentionally `Option<PgPool>` rather than a bare `PgPool`: per PRD §11.6,
/// `/api/v1/directory/crisis-resources` must keep working even if Postgres is unreachable,
/// so the whole process must not refuse to start just because the database is down at
/// boot. Routes that need the database should reject clearly when it's `None`, not panic.
#[derive(Clone)]
pub struct AppState {
    pub db: Option<PgPool>,
    pub master_key: MasterKey,
    pub llm: Arc<dyn LlmProvider>,
}

impl AppState {
    pub async fn connect() -> anyhow::Result<Self> {
        let db = match std::env::var("DATABASE_URL") {
            Err(_) => {
                tracing::warn!("DATABASE_URL not set — starting without a database connection");
                None
            }
            Ok(database_url) => match PgPoolOptions::new()
                .max_connections(10)
                .connect(&database_url)
                .await
            {
                Ok(pool) => match sqlx::migrate!("./migrations").run(&pool).await {
                    Ok(()) => Some(pool),
                    Err(err) => {
                        tracing::error!(
                            %err,
                            "failed to run database migrations — starting without a database connection"
                        );
                        None
                    }
                },
                Err(err) => {
                    tracing::error!(
                        %err,
                        "failed to connect to Postgres — starting without a database connection"
                    );
                    None
                }
            },
        };

        Ok(Self {
            db,
            master_key: MasterKey::from_env()?,
            llm: Arc::new(OllamaProvider::from_env()),
        })
    }
}
