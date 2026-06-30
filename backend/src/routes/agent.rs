use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::Row;
use uuid::Uuid;

use crate::auth::AuthedUser;
use crate::config::AppState;
use crate::crisis::{self, CrisisResource};
use crate::llm::{ChatMessage, ChatRole};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/agent/converse", axum::routing::post(converse))
        .route("/agent/conversations", get(list_conversations))
        .route(
            "/agent/conversations/{id}",
            get(get_conversation).delete(delete_conversation),
        )
}

fn db_unavailable() -> Response {
    (StatusCode::SERVICE_UNAVAILABLE, "database unavailable").into_response()
}

fn internal_error(err: impl std::fmt::Display) -> Response {
    tracing::error!(%err, "internal error");
    (StatusCode::INTERNAL_SERVER_ERROR, "internal error").into_response()
}

/// Agent types that are actually wired to the LLM for MVP (PRD §16.1: AI Companion ships;
/// the standalone Legal Information Agent RAG system is explicitly Phase 1.5). Abuse
/// assessment is folded into the same conversational surface as emotional support per
/// FR-1.5 / PRD §9.3, sharing one system prompt rather than being a separate cold tool.
const LIVE_AGENT_TYPES: &[&str] = &["emotional-support", "abuse-assessment"];
const ALL_AGENT_TYPES: &[&str] = &[
    "emotional-support",
    "abuse-assessment",
    "legal-info",
    "crisis",
    "journal-assistant",
    "resource-rec",
];

/// System prompt encoding CLAUDE.md's non-negotiables #7/#8 directly as instructions,
/// since system-prompt discipline — not a general "be empathetic" instruction — is what
/// PRD §9.1 requires for validation-without-endorsement and no-sycophantic-escalation to
/// actually hold. This has not been red-teamed or clinically reviewed (PRD §7.1) — treat
/// as a development starting point, not a shipped system prompt.
const SYSTEM_PROMPT: &str = "You are Sahay's AI Companion, a supportive presence for men in India navigating abuse, legal distress, or mental health challenges. \
Rules you must always follow: \
(1) Validate the user's emotional experience without validating every factual or strategic claim they make — never tell them their plan, accusation, or interpretation of a situation is definitely correct. \
(2) Never mirror or amplify hostility toward a specific named person (their spouse, in-laws, opposing party) — you can validate their pain without building a case against someone else. \
(3) You are not a therapist or doctor: never diagnose a condition or claim certainty about what someone has. \
(4) You are not a lawyer: never assess the merits of a legal situation, predict an outcome, or suggest specific wording for a complaint or filing — if asked, gently redirect to speaking with a licensed professional. \
(5) Keep responses concise, warm, plain-language, and never therapy-jargon. \
(6) If someone describes thoughts of harming themselves or others, respond with care and let the platform's separate crisis-resource system handle resource surfacing — don't try to resolve a crisis yourself in the text alone.";

#[derive(Deserialize)]
struct ConverseRequest {
    conversation_id: Option<Uuid>,
    message: String,
    agent_type: Option<String>,
}

#[derive(Serialize)]
struct SafetyInterrupt {
    resources: Vec<CrisisResource>,
}

#[derive(Serialize)]
struct ConverseResponse {
    conversation_id: Uuid,
    response: String,
    safety_interrupt: Option<SafetyInterrupt>,
    citations: Vec<String>,
}

/// `POST /api/v1/agent/converse` — FR-1.1–1.5. See `new-ai-agent` skill for the full
/// request lifecycle this implements: persist → multi-signal safety pre-check → provider
/// call → post-check → persist → return `safety_interrupt` as a field separate from
/// `response` (PRD §11.3) so the client always renders crisis UI from a fixed component.
async fn converse(
    State(state): State<AppState>,
    user: AuthedUser,
    Json(body): Json<ConverseRequest>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    if body.message.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, "message must not be empty").into_response();
    }

    // Resolve or create the conversation. agent_type is fixed at creation time and read
    // back from the row thereafter — a client can't silently change agent type mid-thread.
    let (conversation_id, agent_type) = match body.conversation_id {
        Some(id) => {
            let row = sqlx::query(
                "select agent_type from ai_conversations where id = $1 and user_id = $2",
            )
            .bind(id)
            .bind(user.user_id)
            .fetch_optional(pool)
            .await;
            match row {
                Ok(Some(row)) => (id, row.get::<String, _>("agent_type")),
                Ok(None) => {
                    return (StatusCode::NOT_FOUND, "conversation not found").into_response();
                }
                Err(err) => return internal_error(err),
            }
        }
        None => {
            let agent_type = body
                .agent_type
                .clone()
                .unwrap_or_else(|| "emotional-support".to_string());
            if !ALL_AGENT_TYPES.contains(&agent_type.as_str()) {
                return (StatusCode::BAD_REQUEST, "unknown agent_type").into_response();
            }
            let row = sqlx::query(
                "insert into ai_conversations (user_id, agent_type) values ($1, $2) returning id",
            )
            .bind(user.user_id)
            .bind(&agent_type)
            .fetch_one(pool)
            .await;
            match row {
                Ok(row) => (row.get::<Uuid, _>("id"), agent_type),
                Err(err) => return internal_error(err),
            }
        }
    };

    // Persist the user's message before doing anything else, so it's never lost even if
    // the provider call below fails.
    let user_content_encrypted = match user.key.encrypt(&body.message) {
        Ok(blob) => blob,
        Err(err) => return internal_error(err),
    };
    if let Err(err) = sqlx::query(
        "insert into ai_messages (conversation_id, role, content_encrypted) values ($1, 'user', $2)",
    )
    .bind(conversation_id)
    .bind(&user_content_encrypted)
    .execute(pool)
    .await
    {
        return internal_error(err);
    }

    // Multi-signal safety pre-check (PRD §9.4.2) — message text + recent mood check-ins.
    // See crisis.rs: this is a non-clinically-validated placeholder.
    let recent_moods = recent_mood_scores(pool, user.user_id)
        .await
        .unwrap_or_default();
    let signal = crisis::detect_signal(&body.message, &recent_moods);

    let assistant_text = if LIVE_AGENT_TYPES.contains(&agent_type.as_str()) {
        match generate_reply(&state, pool, &user, conversation_id).await {
            Ok(text) => text,
            Err(err) => {
                tracing::warn!(%err, "LLM provider call failed, returning fallback reply");
                "I'm having trouble responding right now, but you're not alone — the resources \
                 below are available regardless of whether I'm working."
                    .to_string()
            }
        }
    } else {
        format!(
            "The {agent_type} agent isn't available yet in this build — it's planned for a \
             later phase per the product roadmap. For legal-process questions in the \
             meantime, try the Knowledge Platform or the lawyer directory."
        )
    };

    let assistant_content_encrypted = match user.key.encrypt(&assistant_text) {
        Ok(blob) => blob,
        Err(err) => return internal_error(err),
    };
    let safety_flags = json!({ "crisis_signal_triggered": signal.is_some() });
    if let Err(err) = sqlx::query(
        "insert into ai_messages (conversation_id, role, content_encrypted, safety_flags) \
         values ($1, 'assistant', $2, $3)",
    )
    .bind(conversation_id)
    .bind(&assistant_content_encrypted)
    .bind(&safety_flags)
    .execute(pool)
    .await
    {
        return internal_error(err);
    }

    let safety_interrupt = if let Some(signal) = signal {
        let resources = CrisisResource::all();
        let resource_names: Vec<&str> = resources.iter().map(|r| r.name).collect();
        let signal_summary = json!({
            "category": signal.category,
            "matched_signal_count": signal.matched_signal_count,
        });
        if let Err(err) = sqlx::query(
            "insert into crisis_events (user_id, signal_summary, resource_surfaced) \
             values ($1, $2, $3)",
        )
        .bind(user.user_id)
        .bind(&signal_summary)
        .bind(resource_names.join(", "))
        .execute(pool)
        .await
        {
            tracing::error!(%err, "failed to record crisis_event");
        }
        Some(SafetyInterrupt { resources })
    } else {
        None
    };

    Json(ConverseResponse {
        conversation_id,
        response: assistant_text,
        safety_interrupt,
        citations: vec![],
    })
    .into_response()
}

async fn recent_mood_scores(pool: &sqlx::PgPool, user_id: Uuid) -> anyhow::Result<Vec<i16>> {
    let rows = sqlx::query(
        "select mood_score from journal_entries \
         where user_id = $1 and mood_score is not null \
         order by created_at desc limit 5",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    Ok(rows
        .into_iter()
        .filter_map(|row| row.try_get::<i16, _>("mood_score").ok())
        .collect())
}

async fn generate_reply(
    state: &AppState,
    pool: &sqlx::PgPool,
    user: &AuthedUser,
    conversation_id: Uuid,
) -> anyhow::Result<String> {
    let rows = sqlx::query(
        "select role, content_encrypted from ai_messages \
         where conversation_id = $1 order by created_at desc limit 12",
    )
    .bind(conversation_id)
    .fetch_all(pool)
    .await?;

    let mut history = Vec::with_capacity(rows.len() + 1);
    history.push(ChatMessage {
        role: ChatRole::System,
        content: SYSTEM_PROMPT.to_string(),
    });

    for row in rows.into_iter().rev() {
        let role: String = row.try_get("role")?;
        let encrypted: Vec<u8> = row.try_get("content_encrypted")?;
        let content = user.key.decrypt(&encrypted)?;
        history.push(ChatMessage {
            role: if role == "user" {
                ChatRole::User
            } else {
                ChatRole::Assistant
            },
            content,
        });
    }

    state.llm.complete(&history).await
}

#[derive(Serialize, sqlx::FromRow)]
struct ConversationSummary {
    id: Uuid,
    agent_type: String,
    created_at: DateTime<Utc>,
}

/// `GET /api/v1/agent/conversations` — metadata only, not full content, for list views
/// (PRD §11.3).
async fn list_conversations(State(state): State<AppState>, user: AuthedUser) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    let rows = sqlx::query_as::<_, ConversationSummary>(
        "select id, agent_type, created_at from ai_conversations \
         where user_id = $1 order by created_at desc",
    )
    .bind(user.user_id)
    .fetch_all(pool)
    .await;
    match rows {
        Ok(rows) => Json(rows).into_response(),
        Err(err) => internal_error(err),
    }
}

#[derive(Serialize)]
struct MessageResponse {
    role: String,
    content: String,
    created_at: DateTime<Utc>,
}

/// `GET /api/v1/agent/conversations/{id}` — full message history, owner-only.
async fn get_conversation(
    State(state): State<AppState>,
    user: AuthedUser,
    Path(id): Path<Uuid>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let owns = sqlx::query("select 1 from ai_conversations where id = $1 and user_id = $2")
        .bind(id)
        .bind(user.user_id)
        .fetch_optional(pool)
        .await;
    match owns {
        Ok(Some(_)) => {}
        Ok(None) => return (StatusCode::NOT_FOUND, "conversation not found").into_response(),
        Err(err) => return internal_error(err),
    }

    let rows = sqlx::query(
        "select role, content_encrypted, created_at from ai_messages \
         where conversation_id = $1 order by created_at asc",
    )
    .bind(id)
    .fetch_all(pool)
    .await;
    let rows = match rows {
        Ok(rows) => rows,
        Err(err) => return internal_error(err),
    };

    let mut messages = Vec::with_capacity(rows.len());
    for row in rows {
        let encrypted: Vec<u8> = row.get("content_encrypted");
        let content = match user.key.decrypt(&encrypted) {
            Ok(content) => content,
            Err(err) => return internal_error(err),
        };
        messages.push(MessageResponse {
            role: row.get("role"),
            content,
            created_at: row.get("created_at"),
        });
    }

    Json(messages).into_response()
}

/// `DELETE /api/v1/agent/conversations/{id}` — permanent deletion; `ai_messages` cascades
/// via FK (migration 0001).
async fn delete_conversation(
    State(state): State<AppState>,
    user: AuthedUser,
    Path(id): Path<Uuid>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    let result = sqlx::query("delete from ai_conversations where id = $1 and user_id = $2")
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
