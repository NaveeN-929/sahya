mod account;
mod agent;
mod auth;
mod crisis_resources;
mod directory;
mod health;
mod journal;
mod knowledge;

use axum::Router;

use crate::config::AppState;

pub fn router(state: AppState) -> Router {
    Router::new()
        .merge(health::router())
        .nest("/api/v1", api_v1_router())
        .with_state(state)
}

fn api_v1_router() -> Router<AppState> {
    Router::new()
        .merge(auth::router())
        .merge(journal::router())
        .merge(agent::router())
        .merge(knowledge::router())
        .merge(directory::router())
        .merge(crisis_resources::router())
        .merge(account::router())
}
