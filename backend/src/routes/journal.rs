use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::Row;
use uuid::Uuid;

use crate::auth::AuthedUser;
use crate::config::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/journal/entries", get(list_entries).post(create_entry))
        .route(
            "/journal/entries/{id}",
            axum::routing::patch(update_entry).delete(delete_entry),
        )
        .route("/agent/checkin", post(checkin))
}

fn db_unavailable() -> Response {
    (StatusCode::SERVICE_UNAVAILABLE, "database unavailable").into_response()
}

fn internal_error(err: impl std::fmt::Display) -> Response {
    tracing::error!(%err, "internal error");
    (StatusCode::INTERNAL_SERVER_ERROR, "internal error").into_response()
}

#[derive(Serialize)]
struct JournalEntryResponse {
    id: Uuid,
    content: String,
    mood_score: Option<i16>,
    entry_type: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Deserialize)]
struct CreateEntryRequest {
    content: String,
    mood_score: Option<i16>,
    #[serde(default = "default_entry_type")]
    entry_type: String,
}

fn default_entry_type() -> String {
    "free-text".to_string()
}

const VALID_ENTRY_TYPES: &[&str] = &["free-text", "structured-incident", "check-in-response"];

/// `POST /api/v1/journal/entries` — FR-3.1. Content is envelope-encrypted with the
/// caller's own per-user key before it touches the database (PRD §8.5, §10.4) — plaintext
/// never reaches Postgres.
async fn create_entry(
    State(state): State<AppState>,
    user: AuthedUser,
    Json(body): Json<CreateEntryRequest>,
) -> Response {
    if !VALID_ENTRY_TYPES.contains(&body.entry_type.as_str()) {
        return (StatusCode::BAD_REQUEST, "unknown entry_type").into_response();
    }
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let content_encrypted = match user.key.encrypt(&body.content) {
        Ok(blob) => blob,
        Err(err) => return internal_error(err),
    };

    let row = sqlx::query(
        "insert into journal_entries (user_id, mood_score, content_encrypted, entry_type) \
         values ($1, $2, $3, $4) \
         returning id, mood_score, entry_type, created_at, updated_at",
    )
    .bind(user.user_id)
    .bind(body.mood_score)
    .bind(&content_encrypted)
    .bind(&body.entry_type)
    .fetch_one(pool)
    .await;

    let row = match row {
        Ok(row) => row,
        Err(err) => return internal_error(err),
    };

    Json(JournalEntryResponse {
        id: row.get("id"),
        content: body.content,
        mood_score: row.get("mood_score"),
        entry_type: row.get("entry_type"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    })
    .into_response()
}

/// `GET /api/v1/journal/entries` — FR-3.1. Decryption happens server-side, only for the
/// authenticated owner, and only because this is that owner reading their own content
/// (PRD §10.1's `journal_entries` sensitivity note) — never expose this decrypted blob to
/// anyone other than the entry's own user.
async fn list_entries(State(state): State<AppState>, user: AuthedUser) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let rows = sqlx::query(
        "select id, mood_score, content_encrypted, entry_type, created_at, updated_at \
         from journal_entries where user_id = $1 order by created_at desc limit 200",
    )
    .bind(user.user_id)
    .fetch_all(pool)
    .await;

    let rows = match rows {
        Ok(rows) => rows,
        Err(err) => return internal_error(err),
    };

    let mut entries = Vec::with_capacity(rows.len());
    for row in rows {
        let encrypted: Vec<u8> = row.get("content_encrypted");
        let content = match user.key.decrypt(&encrypted) {
            Ok(content) => content,
            Err(err) => return internal_error(err),
        };
        entries.push(JournalEntryResponse {
            id: row.get("id"),
            content,
            mood_score: row.get("mood_score"),
            entry_type: row.get("entry_type"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    Json(entries).into_response()
}

#[derive(Deserialize)]
struct UpdateEntryRequest {
    content: Option<String>,
    mood_score: Option<i16>,
}

/// `PATCH /api/v1/journal/entries/{id}` — scoped to the caller's own records only; updating
/// content re-encrypts under the caller's key rather than ever touching ciphertext in place.
async fn update_entry(
    State(state): State<AppState>,
    user: AuthedUser,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateEntryRequest>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    if let Some(content) = &body.content {
        let content_encrypted = match user.key.encrypt(content) {
            Ok(blob) => blob,
            Err(err) => return internal_error(err),
        };
        let result = sqlx::query(
            "update journal_entries set content_encrypted = $1, updated_at = now() \
             where id = $2 and user_id = $3",
        )
        .bind(&content_encrypted)
        .bind(id)
        .bind(user.user_id)
        .execute(pool)
        .await;
        if let Err(err) = result {
            return internal_error(err);
        }
    }

    if let Some(mood_score) = body.mood_score {
        let result = sqlx::query(
            "update journal_entries set mood_score = $1, updated_at = now() \
             where id = $2 and user_id = $3",
        )
        .bind(mood_score)
        .bind(id)
        .bind(user.user_id)
        .execute(pool)
        .await;
        if let Err(err) = result {
            return internal_error(err);
        }
    }

    StatusCode::NO_CONTENT.into_response()
}

/// `DELETE /api/v1/journal/entries/{id}` — FR-3.1. Real deletion, not soft-delete, per the
/// retention policy in PRD §10.5.
async fn delete_entry(
    State(state): State<AppState>,
    user: AuthedUser,
    Path(id): Path<Uuid>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    let result = sqlx::query("delete from journal_entries where id = $1 and user_id = $2")
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

#[derive(Deserialize)]
struct CheckinRequest {
    mood_score: i16,
    note: Option<String>,
}

/// `POST /api/v1/agent/checkin` — FR-1.4. Stored as a `journal_entries` row
/// (`entry_type = 'check-in-response'`) so mood history is queryable as one signal feeding
/// the (placeholder) crisis-detection heuristic in `crisis.rs`, per PRD §9.4.2's
/// multi-signal requirement — mood data is one input among several, never the sole trigger.
async fn checkin(
    State(state): State<AppState>,
    user: AuthedUser,
    Json(body): Json<CheckinRequest>,
) -> Response {
    if !(1..=5).contains(&body.mood_score) {
        return (
            StatusCode::BAD_REQUEST,
            "mood_score must be between 1 and 5",
        )
            .into_response();
    }
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let content_encrypted = match user.key.encrypt(body.note.as_deref().unwrap_or("")) {
        Ok(blob) => blob,
        Err(err) => return internal_error(err),
    };

    let result = sqlx::query(
        "insert into journal_entries (user_id, mood_score, content_encrypted, entry_type) \
         values ($1, $2, $3, 'check-in-response')",
    )
    .bind(user.user_id)
    .bind(body.mood_score)
    .bind(&content_encrypted)
    .execute(pool)
    .await;

    match result {
        Ok(_) => StatusCode::CREATED.into_response(),
        Err(err) => internal_error(err),
    }
}
