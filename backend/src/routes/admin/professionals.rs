use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::Row;
use uuid::Uuid;

use crate::admin_auth::AdminUser;
use crate::config::AppState;

use super::audit;
use super::{db_unavailable, internal_error};

pub fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/admin/professionals",
            get(list_professionals).post(create_professional),
        )
        .route(
            "/admin/professionals/{id}",
            axum::routing::patch(update_professional),
        )
        .route(
            "/admin/professionals/{id}/verify",
            post(verify_professional),
        )
        .route(
            "/admin/professionals/{id}/reject",
            post(reject_professional),
        )
}

#[derive(Deserialize)]
struct ListQuery {
    status: Option<String>,
}

#[derive(Serialize)]
struct ProfessionalAdminView {
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

async fn list_professionals(
    State(state): State<AppState>,
    _admin: AdminUser,
    Query(params): Query<ListQuery>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let status = params.status.unwrap_or_default();
    let rows = sqlx::query(
        "select id, name, category, credentials_verified, verification_method, verified_at, \
                specializations, location, languages, fee_structure, contact_info, \
                platform_review_status \
         from professionals \
         where ($1 = '' or platform_review_status = $1) \
         order by platform_review_status, name",
    )
    .bind(&status)
    .fetch_all(pool)
    .await;

    let rows = match rows {
        Ok(rows) => rows,
        Err(err) => return internal_error(err),
    };

    let professionals: Vec<ProfessionalAdminView> = rows
        .into_iter()
        .map(|row| ProfessionalAdminView {
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
        .collect();

    Json(professionals).into_response()
}

#[derive(Deserialize)]
struct ProfessionalUpsert {
    name: String,
    category: String,
    specializations: Vec<String>,
    location: Option<String>,
    languages: Vec<String>,
    fee_structure: Option<String>,
    contact_info: Value,
}

const VALID_CATEGORIES: &[&str] = &["lawyer", "therapist", "financial-advisor"];

async fn create_professional(
    State(state): State<AppState>,
    admin: AdminUser,
    Json(body): Json<ProfessionalUpsert>,
) -> Response {
    if !VALID_CATEGORIES.contains(&body.category.as_str()) {
        return (StatusCode::BAD_REQUEST, "unknown category").into_response();
    }
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let row = sqlx::query(
        "insert into professionals \
            (name, category, specializations, location, languages, fee_structure, contact_info) \
         values ($1, $2, $3, $4, $5, $6, $7) returning id",
    )
    .bind(&body.name)
    .bind(&body.category)
    .bind(&body.specializations)
    .bind(&body.location)
    .bind(&body.languages)
    .bind(&body.fee_structure)
    .bind(&body.contact_info)
    .fetch_one(pool)
    .await;

    let id: Uuid = match row {
        Ok(row) => row.get("id"),
        Err(err) => return internal_error(err),
    };

    audit::record(
        pool,
        admin.admin_id,
        "professional.create",
        "professional",
        Some(id),
        None,
    )
    .await;

    (StatusCode::CREATED, Json(serde_json::json!({ "id": id }))).into_response()
}

async fn update_professional(
    State(state): State<AppState>,
    admin: AdminUser,
    Path(id): Path<Uuid>,
    Json(body): Json<ProfessionalUpsert>,
) -> Response {
    if !VALID_CATEGORIES.contains(&body.category.as_str()) {
        return (StatusCode::BAD_REQUEST, "unknown category").into_response();
    }
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };

    let result = sqlx::query(
        "update professionals \
         set name = $1, category = $2, specializations = $3, location = $4, languages = $5, \
             fee_structure = $6, contact_info = $7 \
         where id = $8",
    )
    .bind(&body.name)
    .bind(&body.category)
    .bind(&body.specializations)
    .bind(&body.location)
    .bind(&body.languages)
    .bind(&body.fee_structure)
    .bind(&body.contact_info)
    .bind(id)
    .execute(pool)
    .await;

    match result {
        Ok(result) if result.rows_affected() == 0 => StatusCode::NOT_FOUND.into_response(),
        Ok(_) => {
            audit::record(
                pool,
                admin.admin_id,
                "professional.update",
                "professional",
                Some(id),
                None,
            )
            .await;
            StatusCode::NO_CONTENT.into_response()
        }
        Err(err) => internal_error(err),
    }
}

#[derive(Deserialize)]
struct VerifyRequest {
    verification_method: String,
}

/// `POST /api/v1/admin/professionals/{id}/verify` — the vetting gate FR-4.2 depends on;
/// `credentials_verified`/`verification_method`/`verified_at` are load-bearing for trust
/// per the `db-migration` skill, so all three are always set together.
async fn verify_professional(
    State(state): State<AppState>,
    admin: AdminUser,
    Path(id): Path<Uuid>,
    Json(body): Json<VerifyRequest>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    let result = sqlx::query(
        "update professionals \
         set credentials_verified = true, verification_method = $1, verified_at = now(), \
             platform_review_status = 'approved' \
         where id = $2",
    )
    .bind(&body.verification_method)
    .bind(id)
    .execute(pool)
    .await;
    match result {
        Ok(result) if result.rows_affected() == 0 => StatusCode::NOT_FOUND.into_response(),
        Ok(_) => {
            audit::record(
                pool,
                admin.admin_id,
                "professional.verify",
                "professional",
                Some(id),
                Some(&body.verification_method),
            )
            .await;
            StatusCode::NO_CONTENT.into_response()
        }
        Err(err) => internal_error(err),
    }
}

async fn reject_professional(
    State(state): State<AppState>,
    admin: AdminUser,
    Path(id): Path<Uuid>,
) -> Response {
    let Some(pool) = state.db.as_ref() else {
        return db_unavailable();
    };
    let result = sqlx::query(
        "update professionals \
         set credentials_verified = false, platform_review_status = 'rejected' \
         where id = $1",
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
                "professional.reject",
                "professional",
                Some(id),
                None,
            )
            .await;
            StatusCode::NO_CONTENT.into_response()
        }
        Err(err) => internal_error(err),
    }
}
