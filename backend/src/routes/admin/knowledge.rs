use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::Row;
use uuid::Uuid;

use crate::admin_auth::AdminUser;
use crate::config::AppState;

use super::audit;
use super::{db_unavailable, internal_error};

pub fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/admin/knowledge/articles",
            get(list_articles).post(create_article),
        )
        .route(
            "/admin/knowledge/articles/{id}",
            axum::routing::patch(update_article).delete(delete_article),
        )
        .route(
            "/admin/knowledge/articles/{id}/approve",
            post(approve_article),
        )
        .route(
            "/admin/knowledge/articles/{id}/unpublish",
            post(unpublish_article),
        )
}

#[derive(Serialize)]
struct ArticleAdminView {
    id: Uuid,
    title: String,
    content: String,
    content_category: String,
    source_citation: String,
    reviewed_by: Option<String>,
    reviewed_at: Option<DateTime<Utc>>,
}

/// `GET /api/v1/admin/knowledge/articles` — unlike the public `/knowledge/articles` route,
/// this returns every row (reviewed or not) with full content, for the review queue.
async fn list_articles(State(state): State<AppState>, _admin: AdminUser) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let rows = sqlx::query(
        "select id, title, content, content_category, source_citation, reviewed_by, reviewed_at \
         from knowledge_chunks order by reviewed_at nulls first, content_category, title",
    )
    .fetch_all(pool)
    .await;

    let rows = match rows {
        Ok(rows) => rows,
        Err(err) => return internal_error(err),
    };

    let articles: Vec<ArticleAdminView> = rows
        .into_iter()
        .map(|row| ArticleAdminView {
            id: row.get("id"),
            title: row.get("title"),
            content: row.get("content"),
            content_category: row.get("content_category"),
            source_citation: row.get("source_citation"),
            reviewed_by: row.get("reviewed_by"),
            reviewed_at: row.get("reviewed_at"),
        })
        .collect();

    Json(articles).into_response()
}

#[derive(Deserialize)]
struct CreateArticleRequest {
    title: String,
    content: String,
    content_category: String,
    source_citation: String,
}

async fn create_article(
    State(state): State<AppState>,
    admin: AdminUser,
    Json(body): Json<CreateArticleRequest>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let row = sqlx::query(
        "insert into knowledge_chunks (title, content, content_category, source_citation) \
         values ($1, $2, $3, $4) returning id",
    )
    .bind(&body.title)
    .bind(&body.content)
    .bind(&body.content_category)
    .bind(&body.source_citation)
    .fetch_one(pool)
    .await;

    let id: Uuid = match row {
        Ok(row) => row.get("id"),
        Err(err) => return internal_error(err),
    };

    audit::record(
        pool,
        admin.admin_id,
        "knowledge.create",
        "knowledge_chunk",
        Some(id),
        None,
    )
    .await;

    (StatusCode::CREATED, Json(serde_json::json!({ "id": id }))).into_response()
}

#[derive(Deserialize)]
struct UpdateArticleRequest {
    title: String,
    content: String,
    content_category: String,
    source_citation: String,
}

/// Editing a previously-approved article clears its review status — a content change must
/// go through review again, it can't silently stay "reviewed" against new text.
async fn update_article(
    State(state): State<AppState>,
    admin: AdminUser,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateArticleRequest>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let result = sqlx::query(
        "update knowledge_chunks \
         set title = $1, content = $2, content_category = $3, source_citation = $4, \
             reviewed_by = null, reviewed_at = null \
         where id = $5",
    )
    .bind(&body.title)
    .bind(&body.content)
    .bind(&body.content_category)
    .bind(&body.source_citation)
    .bind(id)
    .execute(pool)
    .await;

    match result {
        Ok(result) if result.rows_affected() == 0 => StatusCode::NOT_FOUND.into_response(),
        Ok(_) => {
            audit::record(
                pool,
                admin.admin_id,
                "knowledge.update",
                "knowledge_chunk",
                Some(id),
                None,
            )
            .await;
            StatusCode::NO_CONTENT.into_response()
        }
        Err(err) => internal_error(err),
    }
}

async fn delete_article(
    State(state): State<AppState>,
    admin: AdminUser,
    Path(id): Path<Uuid>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    let result = sqlx::query("delete from knowledge_chunks where id = $1")
        .bind(id)
        .execute(pool)
        .await;
    match result {
        Ok(result) if result.rows_affected() == 0 => StatusCode::NOT_FOUND.into_response(),
        Ok(_) => {
            audit::record(
                pool,
                admin.admin_id,
                "knowledge.delete",
                "knowledge_chunk",
                Some(id),
                None,
            )
            .await;
            StatusCode::NO_CONTENT.into_response()
        }
        Err(err) => internal_error(err),
    }
}

/// `POST /api/v1/admin/knowledge/articles/{id}/approve` — sets `reviewed_by`/`reviewed_at`,
/// the same columns the public route's `reviewed` flag derives from (PRD §7.1 Tier 1 gate).
async fn approve_article(
    State(state): State<AppState>,
    admin: AdminUser,
    Path(id): Path<Uuid>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    let result = sqlx::query(
        "update knowledge_chunks set reviewed_by = $1, reviewed_at = now() where id = $2",
    )
    .bind(&admin.email)
    .bind(id)
    .execute(pool)
    .await;
    match result {
        Ok(result) if result.rows_affected() == 0 => StatusCode::NOT_FOUND.into_response(),
        Ok(_) => {
            audit::record(
                pool,
                admin.admin_id,
                "knowledge.approve",
                "knowledge_chunk",
                Some(id),
                None,
            )
            .await;
            StatusCode::NO_CONTENT.into_response()
        }
        Err(err) => internal_error(err),
    }
}

/// `POST /api/v1/admin/knowledge/articles/{id}/unpublish` — clears review status for content
/// that needs to come down or be re-reviewed, without deleting the row.
async fn unpublish_article(
    State(state): State<AppState>,
    admin: AdminUser,
    Path(id): Path<Uuid>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    let result = sqlx::query(
        "update knowledge_chunks set reviewed_by = null, reviewed_at = null where id = $1",
    )
    .bind(id)
    .execute(pool)
    .await;
    match result {
        Ok(result) if result.rows_affected() == 0 => StatusCode::NOT_FOUND.into_response(),
        Ok(_) => {
            audit::record(
                pool,
                admin.admin_id,
                "knowledge.unpublish",
                "knowledge_chunk",
                Some(id),
                None,
            )
            .await;
            StatusCode::NO_CONTENT.into_response()
        }
        Err(err) => internal_error(err),
    }
}
