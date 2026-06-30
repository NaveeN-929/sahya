use axum::extract::State;
use axum::routing::get;
use axum::{Json, Router};
use serde::Serialize;

use crate::config::AppState;

pub fn router() -> Router<AppState> {
    Router::new().route("/healthz", get(healthz))
}

#[derive(Serialize)]
struct HealthStatus {
    status: &'static str,
    database: &'static str,
}

async fn healthz(State(state): State<AppState>) -> Json<HealthStatus> {
    let database = if state.db.is_some() {
        "connected"
    } else {
        "unavailable"
    };
    Json(HealthStatus {
        status: "ok",
        database,
    })
}
