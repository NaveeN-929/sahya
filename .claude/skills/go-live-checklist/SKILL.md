---
name: go-live-checklist
description: Assess Sahay's readiness to launch a phase (closed pilot, soft public launch, or a later phase) against infrastructure, safety-gate, and business-sequencing requirements. Use when asked whether Sahay is ready to ship/launch/go live, or to plan a launch/deployment milestone.
---

# Go-Live Readiness (Sahay)

Sahay's launch is explicitly staged (PRD §17.3) — don't treat "go live" as a single binary
event. Identify which stage is being assessed and check against that stage's gate, not the
full long-term vision.

## Stage gates

**Stage 1 — Closed/invite pilot (tens to low hundreds of users, PRD §17.3, §16.2 Phase 1)**
- [ ] Tier 1 research gates cleared: clinical safety reviewer engaged and has reviewed the
      crisis-detection design/triggers/language; legal reviewer has reviewed all published
      legal-education content; data-protection counsel has reviewed the data model and
      evidence-storage design (PRD §7.1).
- [ ] MVP scope matches PRD §16.1, not more: AI Companion (emotional support + abuse
      assessment), crisis resource auto-surfacing, narrow Knowledge Platform (cyber/elder
      abuse categories only), text-only Journal, anonymous auth, small hand-vetted
      Resource Directory. Full Legal Information Agent RAG and evidence storage are
      Phase 1.5 — confirm they're not silently in scope for this stage.
- [ ] `/api/v1/directory/crisis-resources` verified independently available (load-test or
      manual check with DB/AI layer simulated-down).
- [ ] KIRAN helpline and Tele-MANAS operating status re-verified immediately before launch
      (PRD §9.4.3 note — government helpline status can change; don't rely on the PRD's
      original verification date).
- [ ] Recruitment channel is closed/trusted (warm referral, professional network) — not
      broad social media advertising (PRD §17.3 Stage 1 requirement).
- [ ] Run the `safety-dpdpa-check` skill against the full shipped surface, not just the
      most recent change.

**Stage 2 — Soft public launch (post Phase 1.5)**
- [ ] Full Legal Information Agent (RAG-grounded) live, with expanded reviewed content.
- [ ] Evidence storage (encrypted upload, hash verification) live and tested.
- [ ] Growth channel is organic/earned-media, not paid acquisition (PRD §17.3 Stage 2).
- [ ] Public-facing transparency policy on law-enforcement/court data requests is published
      (PRD §15.3, §15.6) — this is a named pre-launch open item, confirm it's actually done.
- [ ] Entity structure (private limited + future Section 8 affiliate) confirmed before any
      broader data collection at this scale (PRD §17.1, §15.6).

**Stage 3 — Institutional partnership push (Phase 2+)**
- [ ] Resource Directory has a real self-serve verification workflow, not just founder-vetted
      entries (PRD §16.2 Phase 2).
- [ ] CSR/NGO referral-partnership conversations are framed as referral partnerships, not
      content partnerships — confirm no inherited advocacy framing from PRD §6.3's ecosystem.

## Infrastructure checks (any stage)

- [ ] Data residency defaults to India where the provider supports it (NFR-3) — confirm
      storage region, not just compute region.
- [ ] Crisis-resource endpoint target 99.9%+ availability decoupled from core platform's
      99.5%+ target (NFR-1).
- [ ] No PII/conversation content reaches the LLM provider beyond contractually-confirmed
      no-training terms and prompt minimization (PRD §8.5, §15.3).
- [ ] Performance budget tested against mid-range Android + degraded connectivity, not just
      high-end dev hardware (NFR-4).
- [ ] Auditability: safety-relevant decisions (crisis flag, legal-content served) are logged
      by category, without becoming a new sensitive-data exposure (NFR-5).

## Open legal items to confirm before any launch stage (PRD §15.6)

- [ ] SDF (Significant Data Fiduciary) designation likelihood assessed with counsel.
- [ ] Law-enforcement/court data-request response policy drafted and reviewed.
- [ ] ToS language on educational-not-advice boundary reviewed for enforceability.
- [ ] Entity structure confirmed before user data collection begins.
- [ ] Duty-of-care exposure for the auto-surface-not-auto-contact crisis design reviewed
      with counsel.

## Output format

State the target stage explicitly, then a pass/fail list against that stage's gate plus the
infra and legal-open-items sections. Anything unconfirmed (not failed — *unconfirmed*) should
be called out distinctly, since "I don't know if legal review happened" and "legal review
happened and failed" require different next actions.
