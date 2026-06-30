use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::Row;
use uuid::Uuid;

use crate::admin_auth::AdminUser;
use crate::config::AppState;
use crate::dsr;

use super::audit;
use super::{db_unavailable, internal_error};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/admin/users/lookup", get(lookup_user))
        .route("/admin/users/{id}/export", post(export_user))
        .route("/admin/users/{id}/delete", post(delete_user))
}

#[derive(Deserialize)]
struct LookupQuery {
    handle: String,
}

#[derive(Serialize)]
struct UserLookupResult {
    id: Uuid,
    pseudonymous_handle: String,
    created_at: chrono::DateTime<chrono::Utc>,
    journal_entry_count: i64,
    conversation_count: i64,
}

/// `GET /api/v1/admin/users/lookup?handle=` — the *only* search field is the pseudonymous
/// handle, deliberately. It's the one identifier a user could read off their own `/privacy`
/// page and relay to support; there is no name/email/phone search because the system
/// doesn't collect those by default (CLAUDE.md non-negotiable #1).
async fn lookup_user(
    State(state): State<AppState>,
    _admin: AdminUser,
    Query(params): Query<LookupQuery>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let row = sqlx::query(
        "select id, pseudonymous_handle, created_at, \
                (select count(*) from journal_entries where user_id = u.id) as journal_entry_count, \
                (select count(*) from ai_conversations where user_id = u.id) as conversation_count \
         from users u where pseudonymous_handle = $1",
    )
    .bind(&params.handle)
    .fetch_optional(pool)
    .await;

    match row {
        Ok(Some(row)) => Json(UserLookupResult {
            id: row.get("id"),
            pseudonymous_handle: row.get("pseudonymous_handle"),
            created_at: row.get("created_at"),
            journal_entry_count: row.get("journal_entry_count"),
            conversation_count: row.get("conversation_count"),
        })
        .into_response(),
        Ok(None) => (StatusCode::NOT_FOUND, "no user with that handle").into_response(),
        Err(err) => internal_error(err),
    }
}

#[derive(Deserialize)]
struct ReasonRequest {
    reason: String,
}

const MIN_REASON_LEN: usize = 10;

/// `POST /api/v1/admin/users/{id}/export` — break-glass fulfillment of a data-subject
/// export request the user can't self-serve (lost their session token). Requires a `reason`
/// (this is the break-glass procedure the `new-api-endpoint` skill calls for, not a
/// convenience admin override) and always writes an `audit_logs` row.
async fn export_user(
    State(state): State<AppState>,
    admin: AdminUser,
    Path(id): Path<Uuid>,
    Json(body): Json<ReasonRequest>,
) -> Response {
    if body.reason.trim().len() < MIN_REASON_LEN {
        return (
            StatusCode::BAD_REQUEST,
            "reason must describe why this break-glass export is needed",
        )
            .into_response();
    }
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let export = match dsr::export_user_data(pool, &state.master_key, id).await {
        Ok(export) => export,
        Err(err) => return internal_error(err),
    };

    audit::record(
        pool,
        admin.admin_id,
        "user.export",
        "user",
        Some(id),
        Some(&body.reason),
    )
    .await;

    Json(export).into_response()
}

/// `POST /api/v1/admin/users/{id}/delete` — break-glass fulfillment of a data-subject
/// erasure request. Same reason/audit requirement as export; irreversible.
async fn delete_user(
    State(state): State<AppState>,
    admin: AdminUser,
    Path(id): Path<Uuid>,
    Json(body): Json<ReasonRequest>,
) -> Response {
    if body.reason.trim().len() < MIN_REASON_LEN {
        return (
            StatusCode::BAD_REQUEST,
            "reason must describe why this break-glass deletion is needed",
        )
            .into_response();
    }
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let deleted = match dsr::delete_user(pool, id).await {
        Ok(rows) => rows,
        Err(err) => return internal_error(err),
    };
    if deleted == 0 {
        return (StatusCode::NOT_FOUND, "user not found").into_response();
    }

    audit::record(
        pool,
        admin.admin_id,
        "user.delete",
        "user",
        Some(id),
        Some(&body.reason),
    )
    .await;

    StatusCode::NO_CONTENT.into_response()
}
