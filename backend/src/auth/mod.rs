//! Anonymous-session authentication (PRD §8.5, FR-1.1).
//!
//! No name/phone/email is required to use the AI Companion, Journal, or Knowledge
//! Platform — a session is a pseudonymous, system-generated identity. Phone/email upgrade
//! (PRD §11.2 `/auth/upgrade`) is intentionally not implemented yet: it's opt-in,
//! consent-gated, and only needed once a feature that requires it (paid professional
//! booking) ships, which is past current MVP scope (PRD §16.1).

use axum::extract::FromRequestParts;
use axum::http::StatusCode;
use axum::http::request::Parts;
use axum::response::{IntoResponse, Response};
use base64::Engine;
use rand::Rng;
use sha2::{Digest, Sha256};
use sqlx::Row;
use uuid::Uuid;

use crate::config::AppState;
use crate::crypto::UserKey;

pub const SESSION_TTL_DAYS: i64 = 180;

/// A fresh, unguessable bearer token. Only its hash is ever persisted (see `hash_token`).
pub fn generate_token() -> String {
    let mut bytes = [0u8; 32];
    rand::rng().fill_bytes(&mut bytes);
    base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(bytes)
}

pub fn hash_token(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    hex_lower(&hasher.finalize())
}

/// Generates a pseudonymous handle that carries no identifying information (PRD §8.5 —
/// system-generated, never user-chosen, to avoid accidental self-doxxing).
pub fn generate_pseudonymous_handle() -> String {
    let mut bytes = [0u8; 6];
    rand::rng().fill_bytes(&mut bytes);
    format!("guest-{}", hex_lower(&bytes))
}

fn hex_lower(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

/// Per-request authenticated identity, extracted from the `Authorization: Bearer <token>`
/// header. `key` is the user's unwrapped data-encryption key (see `crypto.rs`) — it lives
/// only for the duration of the request and is never logged or persisted.
pub struct AuthedUser {
    pub user_id: Uuid,
    pub pseudonymous_handle: String,
    pub key: UserKey,
}

pub enum AuthError {
    MissingToken,
    InvalidToken,
    DatabaseUnavailable,
    Internal,
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AuthError::MissingToken => (StatusCode::UNAUTHORIZED, "missing bearer token"),
            AuthError::InvalidToken => (StatusCode::UNAUTHORIZED, "invalid or expired session"),
            AuthError::DatabaseUnavailable => {
                (StatusCode::SERVICE_UNAVAILABLE, "database unavailable")
            }
            AuthError::Internal => (StatusCode::INTERNAL_SERVER_ERROR, "internal error"),
        };
        (status, message).into_response()
    }
}

impl FromRequestParts<AppState> for AuthedUser {
    type Rejection = AuthError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let header = parts
            .headers
            .get(axum::http::header::AUTHORIZATION)
            .ok_or(AuthError::MissingToken)?;
        let header_str = header.to_str().map_err(|_| AuthError::MissingToken)?;
        let token = header_str
            .strip_prefix("Bearer ")
            .ok_or(AuthError::MissingToken)?;
        let token_hash = hash_token(token);

        let pool = state.db.as_ref().ok_or(AuthError::DatabaseUnavailable)?;

        let row = sqlx::query(
            "select s.user_id, u.pseudonymous_handle, u.wrapped_dek \
             from sessions s join users u on u.id = s.user_id \
             where s.token_hash = $1 and s.expires_at > now()",
        )
        .bind(&token_hash)
        .fetch_optional(pool)
        .await
        .map_err(|err| {
            tracing::error!(%err, "session lookup failed");
            AuthError::Internal
        })?
        .ok_or(AuthError::InvalidToken)?;

        let user_id: Uuid = row.try_get("user_id").map_err(|_| AuthError::Internal)?;
        let pseudonymous_handle: String = row
            .try_get("pseudonymous_handle")
            .map_err(|_| AuthError::Internal)?;
        let wrapped_dek: Vec<u8> = row
            .try_get("wrapped_dek")
            .map_err(|_| AuthError::Internal)?;

        let key = state
            .master_key
            .unwrap_dek(&wrapped_dek)
            .map_err(|_| AuthError::Internal)?;

        let _ = sqlx::query("update sessions set last_seen_at = now() where token_hash = $1")
            .bind(&token_hash)
            .execute(pool)
            .await;

        Ok(AuthedUser {
            user_id,
            pseudonymous_handle,
            key,
        })
    }
}
