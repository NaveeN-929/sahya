# Contributing to Sahay

Sahay handles disclosures of abuse, legal distress, and suicidal ideation from anonymous
users. The constraints below aren't style preferences — they come from
[`Sahay_Master_PRD_v1.md`](Sahay_Master_PRD_v1.md) §8.5/§9/§14/§15 and are a shippability
gate. A PR that violates one of them gets blocked regardless of how good the rest of the
diff is.

Read [`CLAUDE.md`](CLAUDE.md) in full before touching AI, data, or crisis code — this file
summarizes the parts most likely to matter for a typical PR.

## The non-negotiables

1. **Anonymous by default.** AI Companion, Journal, and Knowledge Platform never require a
   name, phone, or email. Identity stays opt-in, only where functionally required (paid
   professional booking). If your change would make any of those three flows require
   identity, stop and raise it instead of shipping it.
2. **Crisis resources are auto-surfaced, never auto-escalated.** Tele-MANAS (14416) and
   other resources appear automatically when risk signals fire. The system never contacts a
   family member, emergency service, or platform staff on the user's behalf without the user
   tapping "connect." Don't add silent third-party notification of any kind, even if it
   seems like it would help.
3. **`/api/v1/directory/crisis-resources` stays independently available.** Static/cached, no
   DB or AI-orchestration dependency, servable from the edge even if the rest of the
   platform is down. If your change adds a dependency to this route, it's a regression.
4. **Legal content is RAG-grounded only — never open LLM generation.** The Legal Information
   Agent must not answer legal-specific questions from parametric/training knowledge. Any
   case-specific strategic question ("will I win," "what should I tell police") gets a
   warm redirect to the lawyer directory, never a best-effort model answer.
5. **Journal/evidence/conversation content is the most sensitive data in the system.**
   Per-user envelope encryption at rest, never logged raw, never sent to a third-party LLM
   beyond the minimum needed for the active request. New tables holding user-generated or
   disclosed content default to the **critical** sensitivity tier (see the `db-migration`
   skill) unless you document a specific reason not to.
6. **No third-party analytics or ad SDKs on any flow touching journal, evidence, or AI
   conversation content.** Generic page-view analytics elsewhere is fine. This is absolute,
   not a judgment call — see PRD §6.1/§8.5 for why.
7. **Validation without endorsement; no sycophantic escalation.** Agents that talk to users
   validate feelings, not every factual/strategic claim, and never mirror or amplify
   hostility toward a named third party. This applies to every user-facing agent's system
   prompt and evals, not just the crisis path.
8. **No diagnosis, no legal advice, no case-merit assessment — ever**, regardless of how the
   request is phrased. Every legal/clinical-adjacent response carries a visible disclaimer
   and, for legal content, a source citation.
9. **Politically neutral on the underlying gender-law debate.** State what the law says and
   what data shows. Never imply allegations against men are generally false as a class;
   never frame women's legal protections as the problem. Applies to code comments, UI copy,
   seed content, and commit messages alike.
10. **Red is reserved for true emergency actions and irreversible destructive confirmations
    only** (design-system "red rule," `design-system/docs/DESIGN-SYSTEM.md` §2). Don't reach
    for it for routine validation, warnings, or visual emphasis.

If you're not sure whether a change touches one of these, run the `safety-dpdpa-check`
skill before opening the PR — it's faster than finding out in review.

## Before you start

- **Setup:** see [`README.md`](README.md) for local dev (Postgres + Ollama via Docker,
  `cargo run` for the backend, `npm run dev` for the frontend).
- **Use the skills.** `.claude/skills/` covers the recurring patterns — new AI agent, new
  API endpoint, new design component, legal content entry, DB migration, safety/DPDPA
  pre-ship check, go-live readiness. Freehanding one of these from scratch is how the wiring
  for consent, encryption, or RAG-grounding gets silently skipped.
- **Know what's actually shipped.** CLAUDE.md's "Where the project actually is" section
  separates implemented features from Phase 1.5+ placeholders (incident timelines, evidence
  upload, the standalone Legal Information Agent, etc.). Don't build on top of a
  placeholder as if it were production behavior.
- **Tier 1 research gates are not yet cleared** (clinical safety review, legal content
  review, data protection counsel review — PRD §7.1). No crisis flow, legal content, or new
  user-data collection point should ship to real users — even a closed pilot — until those
  are confirmed. If your PR would do that, flag it rather than merging quietly.

## Repo conventions

- `frontend/` and `backend/` are independent projects sharing one repo. Don't introduce
  cross-imports between them — they only communicate over the versioned `/api/v1/...` HTTP
  API.
- **API surface:** REST/HTTPS/JSON, versioned from day one. Every endpoint touching
  journal/evidence/conversation data is session-scoped to the authenticated user — no
  admin-override path in the standard API.
- **File uploads:** never proxy large file bytes through the app server — use the
  signed-upload-URL pattern (`/api/v1/evidence/upload-url` → direct-to-R2) and hash at
  upload time for chain-of-custody.
- **Consent:** any new data collection point, especially anything moving a user off
  anonymous-session-only, writes a `consent_records` entry. This is a DPDPA requirement, not
  optional plumbing.
- **UI:** build against `design-system/tokens/` semantic aliases (`bg-surface`, `text-ink`,
  etc.), never raw hex/palette values. Reuse `design-system/components/` before adding a new
  one — see `frontend_design_system_sync` note below.
- **Tone:** plain, warm, adult language; no therapy-jargon, no manufactured urgency outside
  the crisis banner / emergency action card.

## Before opening a PR

CI runs frontend lint+build and backend fmt/clippy/build/test (`.github/workflows/ci.yml`).
Run the equivalent locally first:

```sh
cd backend && cargo fmt --check && cargo clippy --all-targets -- -D warnings && cargo test
cd frontend && npm run lint && npm run build
```

In the PR description, call out explicitly if your change touches:
- an AI agent's system prompt or output-filtering logic
- the crisis-detection path or crisis-resources route
- a new or changed database table (which sensitivity tier, and why if not "critical")
- any new data collection point (where's the `consent_records` write)

That's the information a reviewer needs to check against the non-negotiables above without
re-reading the whole diff line by line.
