use axum::routing::get;
use axum::{Json, Router};
use serde::Serialize;

use crate::config::AppState;

/// `/api/v1/directory/crisis-resources` — PRD §9.4.3, §11.6, NFR-1.
///
/// This handler deliberately takes no shared state and touches no database. The crisis
/// resource list must stay servable even if Postgres or the AI orchestration layer is
/// down, so it's a pure function over a const list — suitable for CDN-edge caching in
/// front of this service. Do not add a database lookup here for convenience; if the
/// resource list needs to become editable without a redeploy, that's a separate,
/// explicitly-designed high-availability path, not a quiet dependency added to this one.
///
/// KIRAN's continued operating status should be re-verified immediately before any
/// launch stage — government helpline numbers/status can change (PRD §9.4.3 note).
pub fn router() -> Router<AppState> {
    Router::new().route("/directory/crisis-resources", get(list_crisis_resources))
}

#[derive(Serialize)]
struct CrisisResource {
    name: &'static str,
    phone: &'static str,
    description: &'static str,
    resource_type: &'static str,
    availability: &'static str,
}

async fn list_crisis_resources() -> Json<Vec<CrisisResource>> {
    Json(vec![
        CrisisResource {
            name: "Tele-MANAS",
            phone: "14416",
            description: "Govt. of India 24/7 tele-mental-health helpline, available in 20 languages. Primary, default resource for all crisis signals.",
            resource_type: "government",
            availability: "24/7",
        },
        CrisisResource {
            name: "KIRAN Mental Health Helpline",
            phone: "1800-599-0019",
            description: "Govt. of India 24/7 mental health helpline. Secondary/alternate government resource.",
            resource_type: "government",
            availability: "24/7",
        },
        CrisisResource {
            name: "Emergency services",
            phone: "112",
            description: "Surfaced only for explicit imminent-danger-to-self-or-others language, with clear framing.",
            resource_type: "emergency",
            availability: "24/7",
        },
    ])
}
