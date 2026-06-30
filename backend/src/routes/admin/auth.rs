use axum::extract::State;
use axum::response::{IntoResponse, Response};
use axum::routing::post;
use axum::{Json, Router};
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::Row;

use crate::admin_auth::{verify_password, AdminUser, ADMIN_SESSION_TTL_HOURS};
use crate::auth::{generate_token, hash_token};
use crate::config::AppState;

use super::{db_unavailable, internal_error};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/admin/auth/login", post(login))
        .route("/admin/auth/logout", post(logout))
}

#[derive(Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Serialize)]
struct LoginResponse {
    session_token: String,
    display_name: String,
}

/// `POST /api/v1/admin/auth/login` — the only public route under `/admin`. There is no
/// admin self-registration endpoint; accounts are created via `cargo run --bin create_admin`
/// by whoever already has deployment access.
async fn login(State(state): State<AppState>, Json(body): Json<LoginRequest>) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let row = sqlx::query("select id, password_hash, display_name from admins where email = $1")
        .bind(&body.email)
        .fetch_optional(pool)
        .await;

    let row = match row {
        Ok(Some(row)) => row,
        Ok(None) => {
            // Same response shape as a bad password, so login can't be used to enumerate
            // admin email addresses.
            return (
                axum::http::StatusCode::UNAUTHORIZED,
                "invalid email or password",
            )
                .into_response();
        }
        Err(err) => return internal_error(err),
    };

    let password_hash: String = row.get("password_hash");
    if !verify_password(&body.password, &password_hash) {
        return (
            axum::http::StatusCode::UNAUTHORIZED,
            "invalid email or password",
        )
            .into_response();
    }

    let admin_id: uuid::Uuid = row.get("id");
    let display_name: String = row.get("display_name");

    let token = generate_token();
    let token_hash = hash_token(&token);
    let expires_at = Utc::now() + Duration::hours(ADMIN_SESSION_TTL_HOURS);

    let insert = sqlx::query(
        "insert into admin_sessions (admin_id, token_hash, expires_at) values ($1, $2, $3)",
    )
    .bind(admin_id)
    .bind(&token_hash)
    .bind(expires_at)
    .execute(pool)
    .await;
    if let Err(err) = insert {
        return internal_error(err);
    }

    let _ = sqlx::query("update admins set last_login_at = now() where id = $1")
        .bind(admin_id)
        .execute(pool)
        .await;

    Json(LoginResponse {
        session_token: token,
        display_name,
    })
    .into_response()
}

async fn logout(State(state): State<AppState>, admin: AdminUser) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    let _ = sqlx::query("delete from admin_sessions where admin_id = $1")
        .bind(admin.admin_id)
        .execute(pool)
        .await;
    axum::http::StatusCode::NO_CONTENT.into_response()
}
