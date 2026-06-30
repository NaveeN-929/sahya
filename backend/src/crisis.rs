//! Crisis resource data and signal detection (PRD §9.4).
//!
//! `CrisisResource::all()` is the single source of truth for the resource list — both the
//! independent `/api/v1/directory/crisis-resources` route and the AI Companion's inline
//! `safety_interrupt` use this same function, so the two surfaces never drift. It stays a
//! plain const-backed function (no DB call) so the independent route's availability
//! guarantee (PRD §11.6, NFR-1) holds regardless of how it's called.
//!
//! `detect_signal` is a **non-clinically-validated placeholder**. PRD §7.1 requires a
//! licensed clinical reviewer to design and sign off on real detection signals/thresholds
//! before this can be trusted for real users. This heuristic exists only so the
//! architecture (detection → safety_interrupt → crisis_events → EscalationCard) is
//! exercisable end-to-end in development. Do not point real users at this without that
//! review happening first — see the `safety-dpdpa-check` and `go-live-checklist` skills.

use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct CrisisResource {
    pub name: &'static str,
    pub phone: &'static str,
    pub description: &'static str,
    pub resource_type: &'static str,
    pub availability: &'static str,
}

impl CrisisResource {
    pub fn all() -> Vec<CrisisResource> {
        vec![
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
        ]
    }
}

#[derive(Serialize)]
pub struct SignalSummary {
    pub category: &'static str,
    pub matched_signal_count: usize,
}

/// Multi-signal-shaped (message text + recent mood scores) on purpose, per PRD §9.4.2's
/// "multi-signal, not single-keyword" requirement — but the signal set and thresholds below
/// are placeholder engineering, not the clinically-derived set §9.4.2 actually requires.
pub fn detect_signal(message: &str, recent_mood_scores: &[i16]) -> Option<SignalSummary> {
    const IDEATION_TERMS: &[&str] = &[
        "kill myself",
        "end my life",
        "suicide",
        "want to die",
        "no reason to live",
        "better off dead",
    ];

    let lower = message.to_lowercase();
    let mut matched = 0usize;

    if IDEATION_TERMS.iter().any(|term| lower.contains(term)) {
        matched += 1;
    }

    let low_mood_streak =
        recent_mood_scores.iter().rev().take(3).all(|&m| m <= 2) && recent_mood_scores.len() >= 3;
    if low_mood_streak {
        matched += 1;
    }

    if matched == 0 {
        None
    } else {
        Some(SignalSummary {
            category: if matched >= 2 {
                "multi-signal-elevated"
            } else {
                "single-signal-ambiguous"
            },
            matched_signal_count: matched,
        })
    }
}
