use axum::extract::State;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::Serialize;
use serde_json::json;
use sqlx::Row;
use uuid::Uuid;

use crate::auth::AuthedUser;
use crate::config::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/account/export", get(export_account))
        .route("/account", axum::routing::delete(delete_account))
}

fn db_unavailable() -> Response {
    (StatusCode::SERVICE_UNAVAILABLE, "database unavailable").into_response()
}

fn internal_error(err: impl std::fmt::Display) -> Response {
    tracing::error!(%err, "internal error");
    (StatusCode::INTERNAL_SERVER_ERROR, "internal error").into_response()
}

#[derive(Serialize)]
struct JournalEntryExport {
    id: Uuid,
    content: String,
    mood_score: Option<i16>,
    entry_type: String,
    created_at: DateTime<Utc>,
}

#[derive(Serialize)]
struct MessageExport {
    role: String,
    content: String,
    created_at: DateTime<Utc>,
}

#[derive(Serialize)]
struct ConversationExport {
    id: Uuid,
    agent_type: String,
    created_at: DateTime<Utc>,
    messages: Vec<MessageExport>,
}

/// `GET /api/v1/account/export` — FR-5.2, DPDPA data-portability alignment (PRD §15.3).
/// Returns everything this user has disclosed, decrypted, in one portable JSON document —
/// journal entries, AI conversations, and consent history. Professionals/knowledge content
/// are platform data, not user data, and are intentionally excluded.
async fn export_account(State(state): State<AppState>, user: AuthedUser) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let journal_rows = match sqlx::query(
        "select id, content_encrypted, mood_score, entry_type, created_at \
         from journal_entries where user_id = $1 order by created_at",
    )
    .bind(user.user_id)
    .fetch_all(pool)
    .await
    {
        Ok(rows) => rows,
        Err(err) => return internal_error(err),
    };

    let mut journal_entries = Vec::with_capacity(journal_rows.len());
    for row in journal_rows {
        let encrypted: Vec<u8> = row.get("content_encrypted");
        let content = match user.key.decrypt(&encrypted) {
            Ok(content) => content,
            Err(err) => return internal_error(err),
        };
        journal_entries.push(JournalEntryExport {
            id: row.get("id"),
            content,
            mood_score: row.get("mood_score"),
            entry_type: row.get("entry_type"),
            created_at: row.get("created_at"),
        });
    }

    let conversation_rows = match sqlx::query(
        "select id, agent_type, created_at from ai_conversations \
         where user_id = $1 order by created_at",
    )
    .bind(user.user_id)
    .fetch_all(pool)
    .await
    {
        Ok(rows) => rows,
        Err(err) => return internal_error(err),
    };

    let mut conversations = Vec::with_capacity(conversation_rows.len());
    for conv_row in conversation_rows {
        let conv_id: Uuid = conv_row.get("id");
        let message_rows = match sqlx::query(
            "select role, content_encrypted, created_at from ai_messages \
             where conversation_id = $1 order by created_at",
        )
        .bind(conv_id)
        .fetch_all(pool)
        .await
        {
            Ok(rows) => rows,
            Err(err) => return internal_error(err),
        };

        let mut messages = Vec::with_capacity(message_rows.len());
        for row in message_rows {
            let encrypted: Vec<u8> = row.get("content_encrypted");
            let content = match user.key.decrypt(&encrypted) {
                Ok(content) => content,
                Err(err) => return internal_error(err),
            };
            messages.push(MessageExport {
                role: row.get("role"),
                content,
                created_at: row.get("created_at"),
            });
        }

        conversations.push(ConversationExport {
            id: conv_id,
            agent_type: conv_row.get("agent_type"),
            created_at: conv_row.get("created_at"),
            messages,
        });
    }

    let consent_rows = match sqlx::query(
        "select consent_type, granted_at, revoked_at, policy_version_at_consent \
         from consent_records where user_id = $1 order by granted_at",
    )
    .bind(user.user_id)
    .fetch_all(pool)
    .await
    {
        Ok(rows) => rows,
        Err(err) => return internal_error(err),
    };
    let consents: Vec<serde_json::Value> = consent_rows
        .into_iter()
        .map(|row| {
            json!({
                "consent_type": row.get::<String, _>("consent_type"),
                "granted_at": row.get::<DateTime<Utc>, _>("granted_at"),
                "revoked_at": row.get::<Option<DateTime<Utc>>, _>("revoked_at"),
                "policy_version_at_consent": row.get::<String, _>("policy_version_at_consent"),
            })
        })
        .collect();

    Json(json!({
        "pseudonymous_handle": user.pseudonymous_handle,
        "exported_at": Utc::now(),
        "journal_entries": journal_entries,
        "conversations": conversations,
        "consents": consents,
    }))
    .into_response()
}

/// `DELETE /api/v1/account` — FR-5.3. Deletes the `users` row; every linked table
/// (journal_entries, incidents, evidence_files, ai_conversations/messages, consent_records,
/// sessions) cascades via FK per migration 0001/0002. `crisis_events.user_id` uses
/// `ON DELETE SET NULL` by design, retaining anonymized signal data for the safety-audit
/// function described in PRD §10.1/§10.5 without keeping it linked to the deleted account.
async fn delete_account(State(state): State<AppState>, user: AuthedUser) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    let result = sqlx::query("delete from users where id = $1")
        .bind(user.user_id)
        .execute(pool)
        .await;
    match result {
        Ok(_) => StatusCode::NO_CONTENT.into_response(),
        Err(err) => internal_error(err),
    }
}
