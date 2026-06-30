use axum::extract::{Query, State};
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::{Json, Router};
use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::Row;

use crate::admin_auth::AdminUser;
use crate::config::AppState;

use super::{db_unavailable, internal_error};

pub fn router() -> Router<AppState> {
    Router::new().route("/admin/crisis/summary", get(crisis_summary))
}

#[derive(Deserialize)]
struct SummaryQuery {
    since: Option<DateTime<Utc>>,
    until: Option<DateTime<Utc>>,
}

#[derive(Serialize)]
struct CategoryBreakdown {
    category: String,
    event_count: i64,
}

#[derive(Serialize)]
struct DailyTrend {
    day: NaiveDate,
    event_count: i64,
}

#[derive(Serialize)]
struct ActionBreakdown {
    user_action_taken: String,
    event_count: i64,
}

#[derive(Serialize)]
struct CrisisSummary {
    since: DateTime<Utc>,
    until: DateTime<Utc>,
    total_events: i64,
    resolved_events: i64,
    by_category: Vec<CategoryBreakdown>,
    by_action_taken: Vec<ActionBreakdown>,
    by_day: Vec<DailyTrend>,
}

/// `GET /api/v1/admin/crisis/summary` — read-only, aggregate/categorical only. Every query
/// here groups by `signal_summary->>'category'`, `user_action_taken`, and day; none of them
/// select `user_id` or any other per-user linkage. This isn't an oversight to "add later" —
/// CLAUDE.md non-negotiable #2 means there must be no path from this surface toward
/// profiling or escalating against a specific user.
async fn crisis_summary(
    State(state): State<AppState>,
    _admin: AdminUser,
    Query(params): Query<SummaryQuery>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let until = params.until.unwrap_or_else(Utc::now);
    let since = params
        .since
        .unwrap_or_else(|| until - chrono::Duration::days(30));

    let totals = sqlx::query(
        "select count(*) as total, \
                count(*) filter (where resolved_at is not null) as resolved \
         from crisis_events where triggered_at between $1 and $2",
    )
    .bind(since)
    .bind(until)
    .fetch_one(pool)
    .await;
    let totals = match totals {
        Ok(row) => row,
        Err(err) => return internal_error(err),
    };

    let by_category = sqlx::query(
        "select coalesce(signal_summary->>'category', 'unknown') as category, count(*) as event_count \
         from crisis_events where triggered_at between $1 and $2 \
         group by category order by event_count desc",
    )
    .bind(since)
    .bind(until)
    .fetch_all(pool)
    .await;
    let by_category = match by_category {
        Ok(rows) => rows
            .into_iter()
            .map(|row| CategoryBreakdown {
                category: row.get("category"),
                event_count: row.get("event_count"),
            })
            .collect(),
        Err(err) => return internal_error(err),
    };

    let by_action_taken = sqlx::query(
        "select user_action_taken, count(*) as event_count \
         from crisis_events where triggered_at between $1 and $2 \
         group by user_action_taken order by event_count desc",
    )
    .bind(since)
    .bind(until)
    .fetch_all(pool)
    .await;
    let by_action_taken = match by_action_taken {
        Ok(rows) => rows
            .into_iter()
            .map(|row| ActionBreakdown {
                user_action_taken: row.get("user_action_taken"),
                event_count: row.get("event_count"),
            })
            .collect(),
        Err(err) => return internal_error(err),
    };

    let by_day = sqlx::query(
        "select date_trunc('day', triggered_at)::date as day, count(*) as event_count \
         from crisis_events where triggered_at between $1 and $2 \
         group by day order by day",
    )
    .bind(since)
    .bind(until)
    .fetch_all(pool)
    .await;
    let by_day = match by_day {
        Ok(rows) => rows
            .into_iter()
            .map(|row| DailyTrend {
                day: row.get("day"),
                event_count: row.get("event_count"),
            })
            .collect(),
        Err(err) => return internal_error(err),
    };

    Json(CrisisSummary {
        since,
        until,
        total_events: totals.get("total"),
        resolved_events: totals.get("resolved"),
        by_category,
        by_action_taken,
        by_day,
    })
    .into_response()
}
