//! Shared data-subject-request logic — the actual export/delete operations, used by both
//! the end-user `/api/v1/account/export`+`/api/v1/account` routes (self-service) and the
//! admin `/api/v1/admin/users/{id}/export`+`/delete` routes (break-glass, on behalf of a
//! user who can't self-serve). Keeping one implementation means the two paths can never
//! drift on what counts as "all of this user's data."

use chrono::{DateTime, Utc};
use serde::Serialize;
use serde_json::json;
use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::crypto::MasterKey;

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

/// Assembles the full portable export for one user: journal entries, AI conversations, and
/// consent history, decrypted. Mirrors what FR-5.2 requires for self-service export.
pub async fn export_user_data(
    pool: &PgPool,
    master_key: &MasterKey,
    user_id: Uuid,
) -> anyhow::Result<serde_json::Value> {
    let user_row = sqlx::query("select pseudonymous_handle, wrapped_dek from users where id = $1")
        .bind(user_id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| anyhow::anyhow!("user not found"))?;

    let pseudonymous_handle: String = user_row.try_get("pseudonymous_handle")?;
    let wrapped_dek: Vec<u8> = user_row.try_get("wrapped_dek")?;
    let key = master_key.unwrap_dek(&wrapped_dek)?;

    let journal_rows = sqlx::query(
        "select id, content_encrypted, mood_score, entry_type, created_at \
         from journal_entries where user_id = $1 order by created_at",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    let mut journal_entries = Vec::with_capacity(journal_rows.len());
    for row in journal_rows {
        let encrypted: Vec<u8> = row.try_get("content_encrypted")?;
        let content = key.decrypt(&encrypted)?;
        journal_entries.push(JournalEntryExport {
            id: row.try_get("id")?,
            content,
            mood_score: row.try_get("mood_score")?,
            entry_type: row.try_get("entry_type")?,
            created_at: row.try_get("created_at")?,
        });
    }

    let conversation_rows = sqlx::query(
        "select id, agent_type, created_at from ai_conversations \
         where user_id = $1 order by created_at",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    let mut conversations = Vec::with_capacity(conversation_rows.len());
    for conv_row in conversation_rows {
        let conv_id: Uuid = conv_row.try_get("id")?;
        let message_rows = sqlx::query(
            "select role, content_encrypted, created_at from ai_messages \
             where conversation_id = $1 order by created_at",
        )
        .bind(conv_id)
        .fetch_all(pool)
        .await?;

        let mut messages = Vec::with_capacity(message_rows.len());
        for row in message_rows {
            let encrypted: Vec<u8> = row.try_get("content_encrypted")?;
            let content = key.decrypt(&encrypted)?;
            messages.push(MessageExport {
                role: row.try_get("role")?,
                content,
                created_at: row.try_get("created_at")?,
            });
        }

        conversations.push(ConversationExport {
            id: conv_id,
            agent_type: conv_row.try_get("agent_type")?,
            created_at: conv_row.try_get("created_at")?,
            messages,
        });
    }

    let consent_rows = sqlx::query(
        "select consent_type, granted_at, revoked_at, policy_version_at_consent \
         from consent_records where user_id = $1 order by granted_at",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    let consents: Vec<serde_json::Value> = consent_rows
        .into_iter()
        .map(|row| {
            Ok::<_, sqlx::Error>(json!({
                "consent_type": row.try_get::<String, _>("consent_type")?,
                "granted_at": row.try_get::<DateTime<Utc>, _>("granted_at")?,
                "revoked_at": row.try_get::<Option<DateTime<Utc>>, _>("revoked_at")?,
                "policy_version_at_consent": row.try_get::<String, _>("policy_version_at_consent")?,
            }))
        })
        .collect::<Result<_, _>>()?;

    Ok(json!({
        "pseudonymous_handle": pseudonymous_handle,
        "exported_at": Utc::now(),
        "journal_entries": journal_entries,
        "conversations": conversations,
        "consents": consents,
    }))
}

/// Deletes the `users` row; every linked table cascades via FK (migration 0001/0002).
/// `crisis_events.user_id` uses `ON DELETE SET NULL` by design — see `account.rs`.
pub async fn delete_user(pool: &PgPool, user_id: Uuid) -> sqlx::Result<u64> {
    let result = sqlx::query("delete from users where id = $1")
        .bind(user_id)
        .execute(pool)
        .await?;
    Ok(result.rows_affected())
}
