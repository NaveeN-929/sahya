---
name: safety-dpdpa-check
description: Run Sahay's pre-ship safety, privacy, and DPDPA compliance checklist against a feature or change before it merges or deploys. Use when asked to review, audit, or sign off on a Sahay feature for safety/privacy/legal risk, or before merging anything touching AI agents, crisis flows, legal content, or user data.
---

# Safety / Privacy / DPDPA Pre-Ship Check

Run this against any change touching: AI agent behavior, crisis detection/escalation,
legal-education content, journal/evidence/conversation data, or anything collecting new
user data. Report findings as a pass/fail list against each section below, not prose —
this is meant to be a fast, repeatable gate, not a fresh essay each time.

## 1. Crisis safety (PRD §9.4, §14.1)

- [ ] Detection is multi-signal (message classifier + session-level signals), not a single
      keyword/regex.
- [ ] Ambiguous signals trigger a soft, non-alarming surfacing — not silence, not a jarring
      full interrupt.
- [ ] No autonomous third-party contact anywhere in the change — surfacing resources only;
      any "connect" action requires the user's own tap.
- [ ] `safety_interrupt` is structurally separate from the AI's conversational `response` so
      crisis UI renders from a fixed component regardless of generated text.
- [ ] `/api/v1/directory/crisis-resources` (or any change near it) still has zero dependency
      on DB/AI-orchestration availability.
- [ ] A `crisis_events` row is written on detection with categorical `signal_summary` only
      — no raw transcript.

## 2. Legal content / unauthorized-practice-of-law line (PRD §9.2, §15.2)

- [ ] No case-merit assessment, outcome prediction, or suggested filing/complaint wording
      anywhere in agent output or static content.
- [ ] Legal-specific content is retrieved from the reviewed `knowledge_chunks` table, not
      open-generated.
- [ ] Every legal/clinical-adjacent response carries a visible disclaimer; legal content
      carries a source citation.
- [ ] Case-specific strategic requests redirect to the lawyer-directory flow rather than
      getting a best-effort answer.
- [ ] If new/changed content: reviewer (`reviewed_by`/`reviewed_at`) is recorded before this
      ships live (see `legal-content-entry` skill) — flag explicitly if review status is
      unconfirmed rather than assuming it's fine.

## 3. Positioning / editorial neutrality (PRD §5.3, §6.3, §15.4)

- [ ] No content/copy implies allegations against men are generally false as a class.
- [ ] No aggregated "misuse statistics" framing.
- [ ] No framing of women's legal protections (PWDVA, BNS cruelty provisions, POSH Act) as
      themselves the problem.
- [ ] Statistical claims are traceable to a named source (NCRB-style citation discipline,
      PRD §2.4) — no popularized/debunked figures.

## 4. Data minimization & encryption (PRD §8.5, §10.4)

- [ ] New/changed critical-tier data (journal/incident/evidence/conversation content) is
      envelope-encrypted, never logged or analytics-exported in raw form.
- [ ] No third-party analytics/ad SDK touches a flow with journal/evidence/conversation
      content.
- [ ] LLM-provider prompts include only the minimum needed for the active request — no
      phone/email/file content leaking into an unrelated agent's prompt.

## 5. Consent & DPDPA (PRD §10.1, §15.3)

- [ ] Any new data-collection point writes a `consent_records` row in the same transaction,
      with the correct `consent_type` and `policy_version_at_consent`.
- [ ] If this change moves a user off anonymous-session-only (e.g., collects phone/email),
      confirm it's opt-in and explicitly consented, not bundled into another action.
- [ ] Retention: new tables/columns support user-initiated deletion and account-deletion
      cascade (FR-5.2, FR-5.3) — flag if a clean delete path doesn't exist.
- [ ] If this change meaningfully increases data volume/sensitivity processed, note the
      Significant Data Fiduciary (SDF) question (PRD §15.3) for counsel rather than ignoring it.

## 6. Tier 1 research gates (PRD §7.1)

- [ ] If this ships a user-facing crisis flow, legal content, or new user-data collection:
      confirm whether clinical review / legal review / data-protection counsel review has
      actually happened for this specific change. **Do not assume past review covers a new
      change** — flag unconfirmed review status explicitly rather than proceeding silently.

## Output format

List each of the six sections with ✅/⚠️/❌ and a one-line reason for anything not ✅. End
with a clear ship / don't-ship recommendation — don't bury it in prose.
