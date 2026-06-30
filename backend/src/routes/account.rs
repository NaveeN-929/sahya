use axum::extract::State;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::{Json, Router};

use crate::auth::AuthedUser;
use crate::config::AppState;
use crate::dsr;

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

/// `GET /api/v1/account/export` — FR-5.2, DPDPA data-portability alignment (PRD §15.3).
/// Returns everything this user has disclosed, decrypted, in one portable JSON document —
/// journal entries, AI conversations, and consent history. Professionals/knowledge content
/// are platform data, not user data, and are intentionally excluded. Delegates to `dsr.rs`
/// so this self-service path and the admin break-glass export can never drift on what
/// counts as "all of this user's data."
async fn export_account(State(state): State<AppState>, user: AuthedUser) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    match dsr::export_user_data(pool, &state.master_key, user.user_id).await {
        Ok(export) => Json(export).into_response(),
        Err(err) => internal_error(err),
    }
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
    match dsr::delete_user(pool, user.user_id).await {
        Ok(_) => StatusCode::NO_CONTENT.into_response(),
        Err(err) => internal_error(err),
    }
}
