//! Admin-panel authentication — deliberately separate from `auth.rs`'s anonymous-session
//! system (see migration `0005_admin_panel.sql`). Reuses `auth::generate_token`/
//! `auth::hash_token` (the bearer-token scheme is identical) but checks a wholly separate
//! `admin_sessions`/`admins` table, so a bug or compromise in one auth system can never
//! grant access to the other.

use argon2::password_hash::{
    PasswordHash, PasswordHashString, PasswordHasher, PasswordVerifier, SaltString,
    rand_core::OsRng,
};
use argon2::Argon2;
use axum::extract::FromRequestParts;
use axum::http::StatusCode;
use axum::http::request::Parts;
use axum::response::{IntoResponse, Response};
use sqlx::Row;
use uuid::Uuid;

use crate::auth::hash_token;
use crate::config::AppState;

/// Privileged surface — shorter-lived than the 180-day end-user session.
pub const ADMIN_SESSION_TTL_HOURS: i64 = 12;

pub fn hash_password(password: &str) -> anyhow::Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    let hash: PasswordHashString = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|err| anyhow::anyhow!("password hashing failed: {err}"))?
        .into();
    Ok(hash.to_string())
}

pub fn verify_password(password: &str, hash: &str) -> bool {
    let Ok(parsed) = PasswordHash::new(hash) else {
        return false;
    };
    Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok()
}

/// Per-request authenticated admin identity, extracted from the `Authorization: Bearer
/// <token>` header against `admin_sessions`/`admins` — never the end-user `sessions` table.
pub struct AdminUser {
    pub admin_id: Uuid,
    pub email: String,
}

pub enum AdminAuthError {
    MissingToken,
    InvalidToken,
    DatabaseUnavailable,
    Internal,
}

impl IntoResponse for AdminAuthError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AdminAuthError::MissingToken => (StatusCode::UNAUTHORIZED, "missing bearer token"),
            AdminAuthError::InvalidToken => {
                (StatusCode::UNAUTHORIZED, "invalid or expired admin session")
            }
            AdminAuthError::DatabaseUnavailable => {
                (StatusCode::SERVICE_UNAVAILABLE, "database unavailable")
            }
            AdminAuthError::Internal => (StatusCode::INTERNAL_SERVER_ERROR, "internal error"),
        };
        (status, message).into_response()
    }
}

impl FromRequestParts<AppState> for AdminUser {
    type Rejection = AdminAuthError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let header = parts
            .headers
            .get(axum::http::header::AUTHORIZATION)
            .ok_or(AdminAuthError::MissingToken)?;
        let header_str = header.to_str().map_err(|_| AdminAuthError::MissingToken)?;
        let token = header_str
            .strip_prefix("Bearer ")
            .ok_or(AdminAuthError::MissingToken)?;
        let token_hash = hash_token(token);

        let pool = state
            .db
            .as_ref()
            .ok_or(AdminAuthError::DatabaseUnavailable)?;

        let row = sqlx::query(
            "select a.id, a.email from admin_sessions s join admins a on a.id = s.admin_id \
             where s.token_hash = $1 and s.expires_at > now()",
        )
        .bind(&token_hash)
        .fetch_optional(pool)
        .await
        .map_err(|err| {
            tracing::error!(%err, "admin session lookup failed");
            AdminAuthError::Internal
        })?
        .ok_or(AdminAuthError::InvalidToken)?;

        let admin_id: Uuid = row.try_get("id").map_err(|_| AdminAuthError::Internal)?;
        let email: String = row.try_get("email").map_err(|_| AdminAuthError::Internal)?;

        let _ = sqlx::query("update admin_sessions set last_seen_at = now() where token_hash = $1")
            .bind(&token_hash)
            .execute(pool)
            .await;

        Ok(AdminUser { admin_id, email })
    }
}
