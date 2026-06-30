use axum::routing::get;
use axum::{Json, Router};

use crate::config::AppState;
use crate::crisis::CrisisResource;

/// `/api/v1/directory/crisis-resources` — PRD §9.4.3, §11.6, NFR-1.
///
/// This handler deliberately takes no shared state and touches no database. The crisis
/// resource list must stay servable even if Postgres or the AI orchestration layer is
/// down, so it's a pure function over a const list (`crisis::CrisisResource::all()`),
/// suitable for CDN-edge caching in front of this service. Do not add a database lookup
/// here for convenience; if the resource list needs to become editable without a redeploy,
/// that's a separate, explicitly-designed high-availability path, not a quiet dependency
/// added to this one.
///
/// KIRAN's continued operating status should be re-verified immediately before any
/// launch stage — government helpline numbers/status can change (PRD §9.4.3 note).
pub fn router() -> Router<AppState> {
    Router::new().route("/directory/crisis-resources", get(list_crisis_resources))
}

async fn list_crisis_resources() -> Json<Vec<CrisisResource>> {
    Json(CrisisResource::all())
}
