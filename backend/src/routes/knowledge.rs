use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::Row;
use uuid::Uuid;

use crate::config::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/knowledge/articles", get(list_articles))
        .route("/knowledge/articles/{id}", get(get_article))
}

fn db_unavailable() -> Response {
    (StatusCode::SERVICE_UNAVAILABLE, "database unavailable").into_response()
}

fn internal_error(err: impl std::fmt::Display) -> Response {
    tracing::error!(%err, "internal error");
    (StatusCode::INTERNAL_SERVER_ERROR, "internal error").into_response()
}

#[derive(Deserialize)]
struct ListQuery {
    category: Option<String>,
    q: Option<String>,
}

#[derive(Serialize)]
struct ArticleSummary {
    id: Uuid,
    title: String,
    content_category: String,
    source_citation: String,
    reviewed: bool,
    reviewed_by: Option<String>,
    reviewed_at: Option<DateTime<Utc>>,
}

/// `GET /api/v1/knowledge/articles` — FR-2.1, no authentication required. `reviewed` is
/// derived from `reviewed_by`/`reviewed_at` being populated — PRD §7.1's Tier 1 legal
/// review gate, not a separate flag that could drift from the actual review state.
/// FR-2.3's natural-language search is not implemented (that's the Legal Information
/// Agent's RAG retrieval, Phase 1.5, PRD §9.2.1) — `q` here is a plain substring filter.
async fn list_articles(State(state): State<AppState>, Query(params): Query<ListQuery>) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let category = params.category.unwrap_or_default();
    let query_text = format!("%{}%", params.q.unwrap_or_default());

    let rows = sqlx::query(
        "select id, title, content_category, source_citation, reviewed_by, reviewed_at \
         from knowledge_chunks \
         where ($1 = '' or content_category = $1) \
           and ($2 = '%%' or title ilike $2 or content ilike $2) \
         order by content_category, title",
    )
    .bind(&category)
    .bind(&query_text)
    .fetch_all(pool)
    .await;

    let rows = match rows {
        Ok(rows) => rows,
        Err(err) => return internal_error(err),
    };

    let articles: Vec<ArticleSummary> = rows
        .into_iter()
        .map(|row| {
            let reviewed_by: Option<String> = row.get("reviewed_by");
            let reviewed_at: Option<DateTime<Utc>> = row.get("reviewed_at");
            ArticleSummary {
                id: row.get("id"),
                title: row.get("title"),
                content_category: row.get("content_category"),
                source_citation: row.get("source_citation"),
                reviewed: reviewed_by.is_some() && reviewed_at.is_some(),
                reviewed_by,
                reviewed_at,
            }
        })
        .collect();

    Json(articles).into_response()
}

#[derive(Serialize)]
struct ArticleDetail {
    id: Uuid,
    title: String,
    content: String,
    content_category: String,
    source_citation: String,
    reviewed: bool,
    reviewed_by: Option<String>,
    reviewed_at: Option<DateTime<Utc>>,
}

async fn get_article(State(state): State<AppState>, Path(id): Path<Uuid>) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let row = sqlx::query(
        "select id, title, content, content_category, source_citation, reviewed_by, reviewed_at \
         from knowledge_chunks where id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await;

    match row {
        Ok(Some(row)) => {
            let reviewed_by: Option<String> = row.get("reviewed_by");
            let reviewed_at: Option<DateTime<Utc>> = row.get("reviewed_at");
            Json(ArticleDetail {
                id: row.get("id"),
                title: row.get("title"),
                content: row.get("content"),
                content_category: row.get("content_category"),
                source_citation: row.get("source_citation"),
                reviewed: reviewed_by.is_some() && reviewed_at.is_some(),
                reviewed_by,
                reviewed_at,
            })
            .into_response()
        }
        Ok(None) => (StatusCode::NOT_FOUND, "article not found").into_response(),
        Err(err) => internal_error(err),
    }
}
