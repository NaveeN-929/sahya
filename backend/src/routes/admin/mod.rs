//! Admin panel route tree, nested under `/api/v1/admin`. Fully separate from the end-user
//! API surface — see `admin_auth.rs` and migration `0005_admin_panel.sql` for why this is a
//! distinct auth system rather than a role check bolted onto existing routes.

pub mod audit;
mod auth;
mod crisis;
mod knowledge;
mod professionals;
mod users;

use axum::Router;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

use crate::config::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .merge(auth::router())
        .merge(knowledge::router())
        .merge(professionals::router())
        .merge(crisis::router())
        .merge(users::router())
        .merge(audit::router())
}

fn db_unavailable() -> Response {
    (StatusCode::SERVICE_UNAVAILABLE, "database unavailable").into_response()
}

fn internal_error(err: impl std::fmt::Display) -> Response {
    tracing::error!(%err, "internal error");
    (StatusCode::INTERNAL_SERVER_ERROR, "internal error").into_response()
}
