mod crisis_resources;
mod health;

use axum::Router;

use crate::config::AppState;

pub fn router(state: AppState) -> Router {
    Router::new()
        .merge(health::router())
        .nest("/api/v1", api_v1_router())
        .with_state(state)
}

fn api_v1_router() -> Router<AppState> {
    Router::new().merge(crisis_resources::router())
}
