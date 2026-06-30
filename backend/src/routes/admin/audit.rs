use axum::Json;
use axum::Router;
use axum::extract::{Query, State};
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::admin_auth::AdminUser;
use crate::config::AppState;

use super::{db_unavailable, internal_error};

pub fn router() -> Router<AppState> {
    Router::new().route("/admin/audit-log", get(list_audit_log))
}

/// Writes one append-only `audit_logs` row. Called by every mutating admin handler on
/// success — this is the break-glass procedure's paper trail, not optional telemetry.
pub async fn record(
    pool: &PgPool,
    admin_id: Uuid,
    action: &str,
    resource_type: &str,
    resource_id: Option<Uuid>,
    reason: Option<&str>,
) {
    let result = sqlx::query(
        "insert into audit_logs (admin_id, action, resource_type, resource_id, reason) \
         values ($1, $2, $3, $4, $5)",
    )
    .bind(admin_id)
    .bind(action)
    .bind(resource_type)
    .bind(resource_id)
    .bind(reason)
    .execute(pool)
    .await;

    if let Err(err) = result {
        tracing::error!(%err, action, resource_type, "failed to write audit log row");
    }
}

#[derive(Deserialize)]
pub struct ListQuery {
    #[serde(default)]
    limit: Option<i64>,
    #[serde(default)]
    offset: Option<i64>,
}

#[derive(Serialize)]
struct AuditLogEntry {
    id: Uuid,
    admin_email: String,
    action: String,
    resource_type: String,
    resource_id: Option<Uuid>,
    reason: Option<String>,
    created_at: DateTime<Utc>,
}

/// `GET /api/v1/admin/audit-log` — read-only, paginated. No update/delete route is ever
/// exposed for this table (append-only by design).
pub async fn list_audit_log(
    State(state): State<AppState>,
    _admin: AdminUser,
    Query(params): Query<ListQuery>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let limit = params.limit.unwrap_or(50).clamp(1, 200);
    let offset = params.offset.unwrap_or(0).max(0);

    let rows = sqlx::query(
        "select l.id, a.email as admin_email, l.action, l.resource_type, l.resource_id, \
                l.reason, l.created_at \
         from audit_logs l join admins a on a.id = l.admin_id \
         order by l.created_at desc \
         limit $1 offset $2",
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await;

    let rows = match rows {
        Ok(rows) => rows,
        Err(err) => return internal_error(err),
    };

    let entries: Vec<AuditLogEntry> = rows
        .into_iter()
        .map(|row| AuditLogEntry {
            id: row.get("id"),
            admin_email: row.get("admin_email"),
            action: row.get("action"),
            resource_type: row.get("resource_type"),
            resource_id: row.get("resource_id"),
            reason: row.get("reason"),
            created_at: row.get("created_at"),
        })
        .collect();

    Json(entries).into_response()
}
