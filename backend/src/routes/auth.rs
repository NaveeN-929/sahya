use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::Row;
use uuid::Uuid;

use crate::auth::{self, AuthedUser};
use crate::config::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/auth/anonymous-session", post(create_anonymous_session))
        .route("/auth/session", get(get_session))
        .route("/auth/logout", post(logout))
        .route("/auth/consents", get(list_consents).post(grant_consent))
        .route("/auth/consents/{id}/revoke", post(revoke_consent))
}

fn db_unavailable() -> Response {
    (StatusCode::SERVICE_UNAVAILABLE, "database unavailable").into_response()
}

fn internal_error(err: impl std::fmt::Display) -> Response {
    tracing::error!(%err, "internal error");
    (StatusCode::INTERNAL_SERVER_ERROR, "internal error").into_response()
}

#[derive(Serialize)]
struct SessionResponse {
    session_token: String,
    pseudonymous_handle: String,
}

/// `POST /api/v1/auth/anonymous-session` — FR-1.1. No input required beyond the request
/// itself; creates a pseudonymous user, a fresh per-user data-encryption key (PRD §8.5),
/// and a session. The raw bearer token is returned exactly once — only its hash is stored.
async fn create_anonymous_session(State(state): State<AppState>) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let wrapped_dek = match state.master_key.generate_wrapped_dek() {
        Ok(dek) => dek,
        Err(err) => return internal_error(err),
    };
    let handle = auth::generate_pseudonymous_handle();

    let user_row = match sqlx::query(
        "insert into users (pseudonymous_handle, wrapped_dek) values ($1, $2) returning id",
    )
    .bind(&handle)
    .bind(&wrapped_dek)
    .fetch_one(pool)
    .await
    {
        Ok(row) => row,
        Err(err) => return internal_error(err),
    };
    let user_id: Uuid = match user_row.try_get("id") {
        Ok(id) => id,
        Err(err) => return internal_error(err),
    };

    let token = auth::generate_token();
    let token_hash = auth::hash_token(&token);
    let expires_at = Utc::now() + chrono::Duration::days(auth::SESSION_TTL_DAYS);

    if let Err(err) =
        sqlx::query("insert into sessions (user_id, token_hash, expires_at) values ($1, $2, $3)")
            .bind(user_id)
            .bind(&token_hash)
            .bind(expires_at)
            .execute(pool)
            .await
    {
        return internal_error(err);
    }

    Json(SessionResponse {
        session_token: token,
        pseudonymous_handle: handle,
    })
    .into_response()
}

/// `GET /api/v1/auth/session` — validates the current session and returns its identity.
async fn get_session(user: AuthedUser) -> Response {
    Json(SessionResponse {
        session_token: String::new(),
        pseudonymous_handle: user.pseudonymous_handle,
    })
    .into_response()
}

async fn logout(State(state): State<AppState>, user: AuthedUser) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    if let Err(err) = sqlx::query("delete from sessions where user_id = $1")
        .bind(user.user_id)
        .execute(pool)
        .await
    {
        return internal_error(err);
    }
    StatusCode::NO_CONTENT.into_response()
}

#[derive(Serialize, sqlx::FromRow)]
struct ConsentRecord {
    id: Uuid,
    consent_type: String,
    granted_at: DateTime<Utc>,
    revoked_at: Option<DateTime<Utc>>,
    policy_version_at_consent: String,
}

/// `GET /api/v1/auth/consents` — FR-5.1.
async fn list_consents(State(state): State<AppState>, user: AuthedUser) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    let rows = sqlx::query_as::<_, ConsentRecord>(
        "select id, consent_type, granted_at, revoked_at, policy_version_at_consent \
         from consent_records where user_id = $1 order by granted_at desc",
    )
    .bind(user.user_id)
    .fetch_all(pool)
    .await;
    match rows {
        Ok(rows) => Json(rows).into_response(),
        Err(err) => internal_error(err),
    }
}

#[derive(Deserialize)]
struct GrantConsentRequest {
    consent_type: String,
    policy_version: String,
}

const VALID_CONSENT_TYPES: &[&str] = &[
    "data-processing",
    "phone-collection",
    "evidence-storage",
    "professional-referral-share",
];

/// `POST /api/v1/auth/consents` — FR-5.1, DPDPA consent architecture (PRD §10.1, §15.3).
async fn grant_consent(
    State(state): State<AppState>,
    user: AuthedUser,
    Json(body): Json<GrantConsentRequest>,
) -> Response {
    if !VALID_CONSENT_TYPES.contains(&body.consent_type.as_str()) {
        return (StatusCode::BAD_REQUEST, "unknown consent_type").into_response();
    }
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    let row = sqlx::query_as::<_, ConsentRecord>(
        "insert into consent_records (user_id, consent_type, policy_version_at_consent) \
         values ($1, $2, $3) \
         returning id, consent_type, granted_at, revoked_at, policy_version_at_consent",
    )
    .bind(user.user_id)
    .bind(&body.consent_type)
    .bind(&body.policy_version)
    .fetch_one(pool)
    .await;
    match row {
        Ok(row) => (StatusCode::CREATED, Json(row)).into_response(),
        Err(err) => internal_error(err),
    }
}

/// `POST /api/v1/auth/consents/{id}/revoke` — revocation is a new timestamp, never an
/// overwrite of the original grant row, preserving the audit trail (PRD §10.1).
async fn revoke_consent(
    State(state): State<AppState>,
    user: AuthedUser,
    Path(id): Path<Uuid>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    let result = sqlx::query(
        "update consent_records set revoked_at = now() \
         where id = $1 and user_id = $2 and revoked_at is null",
    )
    .bind(id)
    .bind(user.user_id)
    .execute(pool)
    .await;
    match result {
        Ok(result) if result.rows_affected() == 0 => StatusCode::NOT_FOUND.into_response(),
        Ok(_) => StatusCode::NO_CONTENT.into_response(),
        Err(err) => internal_error(err),
    }
}
