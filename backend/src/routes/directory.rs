use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::Row;
use uuid::Uuid;

use crate::config::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/directory/search", get(search_professionals))
        .route("/directory/professionals/{id}", get(get_professional))
}

fn db_unavailable() -> Response {
    (StatusCode::SERVICE_UNAVAILABLE, "database unavailable").into_response()
}

fn internal_error(err: impl std::fmt::Display) -> Response {
    tracing::error!(%err, "internal error");
    (StatusCode::INTERNAL_SERVER_ERROR, "internal error").into_response()
}

#[derive(Deserialize)]
struct SearchQuery {
    category: Option<String>,
    location: Option<String>,
    language: Option<String>,
    specialization: Option<String>,
}

#[derive(Serialize)]
struct ProfessionalSummary {
    id: Uuid,
    name: String,
    category: String,
    credentials_verified: bool,
    verification_method: Option<String>,
    specializations: Vec<String>,
    location: Option<String>,
    languages: Vec<String>,
    platform_review_status: String,
}

/// `GET /api/v1/directory/search` — FR-4.1, FR-4.2. This queries a structured,
/// database-backed table only — never an AI-generated recommendation — specifically
/// because a generative agent could otherwise invent a lawyer/therapist/NGO that doesn't
/// exist (PRD §9.6, §9.7). Every result carries `credentials_verified` and
/// `platform_review_status` so the client can render verification status per FR-4.2; at
/// MVP stage the table is a small, hand-vetted starter list, not an open marketplace
/// (PRD §16.1).
async fn search_professionals(
    State(state): State<AppState>,
    Query(params): Query<SearchQuery>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let category = params.category.unwrap_or_default();
    let location = format!("%{}%", params.location.unwrap_or_default());
    let language = params.language.unwrap_or_default();
    let specialization = params.specialization.unwrap_or_default();

    let rows = sqlx::query(
        "select id, name, category, credentials_verified, verification_method, \
                specializations, location, languages, platform_review_status \
         from professionals \
         where ($1 = '' or category = $1) \
           and ($2 = '%%' or location ilike $2) \
           and ($3 = '' or $3 = any(languages)) \
           and ($4 = '' or $4 = any(specializations)) \
         order by credentials_verified desc, name",
    )
    .bind(&category)
    .bind(&location)
    .bind(&language)
    .bind(&specialization)
    .fetch_all(pool)
    .await;

    let rows = match rows {
        Ok(rows) => rows,
        Err(err) => return internal_error(err),
    };

    let professionals: Vec<ProfessionalSummary> = rows
        .into_iter()
        .map(|row| ProfessionalSummary {
            id: row.get("id"),
            name: row.get("name"),
            category: row.get("category"),
            credentials_verified: row.get("credentials_verified"),
            verification_method: row.get("verification_method"),
            specializations: row.get("specializations"),
            location: row.get("location"),
            languages: row.get("languages"),
            platform_review_status: row.get("platform_review_status"),
        })
        .collect();

    Json(professionals).into_response()
}

#[derive(Serialize)]
struct ProfessionalDetail {
    id: Uuid,
    name: String,
    category: String,
    credentials_verified: bool,
    verification_method: Option<String>,
    verified_at: Option<DateTime<Utc>>,
    specializations: Vec<String>,
    location: Option<String>,
    languages: Vec<String>,
    fee_structure: Option<String>,
    contact_info: Value,
    platform_review_status: String,
}

async fn get_professional(State(state): State<AppState>, Path(id): Path<Uuid>) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let row = sqlx::query(
        "select id, name, category, credentials_verified, verification_method, verified_at, \
                specializations, location, languages, fee_structure, contact_info, \
                platform_review_status \
         from professionals where id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await;

    match row {
        Ok(Some(row)) => Json(ProfessionalDetail {
            id: row.get("id"),
            name: row.get("name"),
            category: row.get("category"),
            credentials_verified: row.get("credentials_verified"),
            verification_method: row.get("verification_method"),
            verified_at: row.get("verified_at"),
            specializations: row.get("specializations"),
            location: row.get("location"),
            languages: row.get("languages"),
            fee_structure: row.get("fee_structure"),
            contact_info: row.get("contact_info"),
            platform_review_status: row.get("platform_review_status"),
        })
        .into_response(),
        Ok(None) => (StatusCode::NOT_FOUND, "professional not found").into_response(),
        Err(err) => internal_error(err),
    }
}
