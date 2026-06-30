# Sahay — Project Guide for Claude Code

Sahay is an AI-native support platform for men in India facing domestic/partner abuse,
disputed legal allegations, custody disputes, financial/workplace abuse, and the mental
health consequences of these — anonymous AI emotional support, neutral legal-process
education, private journaling/evidence organization, and a vetted professional directory,
with crisis support that routes to Tele-MANAS rather than acting as its own crisis line.

**Source of truth:** `Sahay_Master_PRD_v1.md` (root) for product/architecture/legal decisions,
`design-system/` for all UI work. This file is an operational summary for engineering work —
when this file and the PRD disagree, the PRD wins; update this file to match.

## Non-negotiables (read before touching AI, data, or crisis code)

These are safety/legal constraints from PRD §8.5, §9, §14, §15 — they are architectural,
not style preferences. Violating them is a shippability blocker, not a nitpick.

1. **Anonymous by default.** No name/phone/email required for AI Companion, Journal, or
   Knowledge Platform. Identity is opt-in only where functionally required (paid professional
   booking). Never add a feature that silently requires identity.
2. **Crisis resources are auto-surfaced, never auto-escalated to a third party.** The system
   surfaces Tele-MANAS (14416) and other resources automatically the moment risk signals
   appear (PRD §9.4.1). It never contacts a family member, emergency service, or platform
   staff on the user's behalf without the user tapping "connect." Do not build silent
   third-party notification — that is an explicit, deliberate non-feature.
3. **`/api/v1/directory/crisis-resources` must stay independently available.** Static/cached,
   no DB or AI-orchestration dependency, servable from CDN edge even if the rest of the
   platform is down (PRD §11.6, NFR-1).
4. **Legal content is RAG-grounded against a lawyer-reviewed knowledge base only — never
   open LLM generation.** The Legal Information Agent must not answer legal-specific
   questions from parametric/training knowledge (PRD §9.2.1). Any user request for
   case-specific strategic advice ("will I win," "what should I tell police") gets a firm,
   warm redirect to the lawyer directory — never a best-effort answer.
5. **Journal/evidence/conversation content is the most sensitive data in the system.**
   Per-user envelope encryption at rest (PRD §8.5, §10.4). Never log raw content. Never
   send it to a third-party LLM provider beyond the minimum needed for the active request,
   and never include phone/email/file content in a prompt for an unrelated agent.
6. **No third-party analytics/ad SDKs on any flow touching journal, evidence, or AI
   conversation content.** Generic page-view analytics elsewhere is fine. This is the
   BetterHelp lesson (PRD §6.1, §8.5) — treat it as absolute, not a judgment call.
7. **Validation without endorsement; no sycophantic escalation.** The Emotional Support
   Agent validates feelings, not every factual/strategic claim, and never mirrors or
   amplifies hostility toward a named third party (PRD §9.1). This is a system-prompt and
   eval requirement for every agent that talks to users, not just the crisis path.
8. **No diagnosis, no legal advice, no case-merit assessment — ever**, regardless of how
   the user phrases the request. Every legal/clinical-adjacent response carries a visible
   disclaimer and (for legal content) a source citation (PRD §9.2, §15.2, §15.5).
9. **Politically neutral on the underlying gender-law debate.** State what the law says and
   what data shows; never imply allegations against men are generally false as a class;
   never frame women's legal protections as the problem (PRD §5.3, §6.3, §15.4). This
   applies to code comments, copy, seed content, and commit messages alike.
10. **Red is reserved for true emergency actions and irreversible destructive confirmations
    only** (design-system "red rule," `DESIGN-SYSTEM.md` §2). Don't reach for it for
    routine validation or warnings.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Client | Next.js (App Router), Tailwind v4, shadcn/ui conventions, Radix primitives, Framer Motion | PRD §8.2; PWA-style web first, native apps deferred |
| Application | Rust + Axum | PRD §8.2, §8.4; memory safety matters for a system holding sensitive personal data |
| Database | PostgreSQL (+ `pgvector` for MVP-scale vector search) | PRD §8.3 — relational integrity for consent/DSR auditability beats document-store flexibility here; Qdrant is a Phase 2+ swap-in, not an MVP dependency |
| Object storage | S3-compatible (Cloudflare R2 recommended) | zero egress fees for evidence file retrieval, PRD §8.6 |
| AI orchestration | Dedicated service layer; client never calls the LLM provider or holds a provider key | PRD §8.4 — all `/agent/*` calls proxy through the Application plane |
| LLM provider (current) | Self-hosted via Ollama (Docker), `backend/src/llm/` | PRD §9.7 — narrow/self-hosted is fine at this team's scale; swap by implementing `LlmProvider` for a hosted provider later, agent code doesn't change |
| Infra | Docker for local/CI; Kubernetes deferred until real scale need; Cloudflare CDN/DDoS | PRD §8.6 — avoid premature orchestration overhead for a small team |

Provider-abstracted LLM calls (PRD §9.7) — do not hard-couple agent code to one provider's SDK
shape; route through the orchestration layer's own interface.

## Repo layout

```
Sahay_Master_PRD_v1.md   — master PRD, source of truth for product/legal/architecture
design-system/           — Digital Sanctuary design system (tokens, components, docs)
frontend/                — Next.js client (PWA-style, mobile-responsive first)
backend/                 — Rust/Axum application + AI orchestration service
  infra/
    docker-compose.yml   — local Postgres + services
.claude/skills/          — project-specific Claude Code skills (see below)
```

`frontend/` and `backend/` are independent projects under this one repo — each owns its own
dependency manifest, lockfile, and build/lint/test pipeline (see `.github/workflows/ci.yml`).
Don't introduce cross-imports between them; they communicate only over the versioned HTTP
API.

## Engineering conventions

- **API surface:** REST over HTTPS, JSON, versioned from day one (`/api/v1/...`, PRD §11.1).
  Every endpoint touching journal/evidence/conversation data is session-scoped to the
  authenticated user only — no admin-override path in the standard API surface.
- **File uploads:** client never proxies large file bytes through the app server — use the
  signed-upload-URL pattern (`/api/v1/evidence/upload-url` → direct-to-R2, PRD §11.5).
  Compute and store the SHA-256 hash at upload time for chain-of-custody (PRD §8.5).
- **DB sensitivity tiers:** `journal_entries`, `incidents`, `evidence_files`,
  `ai_conversations`/`ai_messages`, `crisis_events` are **critical** — per-user envelope
  encryption, access-logged, never in a non-aggregated analytics export (PRD §10.4). New
  tables holding user-generated or disclosed content default to this tier unless there's a
  specific, documented reason not to.
- **Consent:** any new data collection point (especially anything moving a user off
  anonymous-session-only) writes a `consent_records` entry (PRD §10.1, §15.3) — this is a
  DPDPA requirement, not optional plumbing.
- **UI:** always build against `design-system/tokens/` semantic aliases (`bg-surface`,
  `text-ink`, etc.), never raw hex/palette values — see `design-system/docs/DESIGN-SYSTEM.md`.
  Reuse existing components in `design-system/components/` before creating new ones.
- **Content tone:** plain, warm, adult language; no therapy-jargon, no manufactured urgency
  outside the crisis banner / emergency action card (design-system `DESIGN-SYSTEM.md` §10).

## Where the project actually is

MVP scope and phasing are defined in PRD §16. Short version: AI Companion (emotional
support + abuse assessment), crisis resource auto-surfacing, a narrow Knowledge Platform
(cyber/elder abuse content only at first), private Journal (text-only initially), anonymous
auth, and a small hand-vetted Resource Directory ship first. Full Legal Information Agent
RAG and evidence storage are Phase 1.5. Community features are explicitly deferred to
Phase 3 and gated on real-time human moderation.

**Implemented (as of 2026-06-30):** anonymous session auth + envelope encryption
(`backend/src/auth/`, `backend/src/crypto.rs`); AI Companion conversation persistence +
Ollama-backed replies + placeholder crisis-signal detection (`backend/src/routes/agent.rs`,
`backend/src/crisis.rs`); Journal CRUD + mood check-ins (`backend/src/routes/journal.rs`);
Knowledge Platform browse/search over `knowledge_chunks` (`backend/src/routes/knowledge.rs`,
two seed articles); Resource Directory search over `professionals`
(`backend/src/routes/directory.rs`, two clearly-marked `[SEED]` placeholder entries);
consent management, data export, account deletion (`backend/src/routes/account.rs`,
`auth.rs`); frontend pages for all of the above (`frontend/src/app/{chat,journal,directory,
knowledge,privacy}`). **Not implemented:** incident timelines, evidence upload, Journal
Assistant summarization/PDF export (Phase 1.5 per PRD §16.1), the standalone RAG-grounded
Legal Information Agent (legal-info/journal-assistant/resource-rec `agent_type`s exist in
the data model but return a "not available yet" message rather than generating content —
see `LIVE_AGENT_TYPES` in `agent.rs`), phone/email auth upgrade, professional booking.

**Known placeholders that must not be mistaken for production-ready (PRD §7.1 still
unconfirmed):**
- `crisis.rs::detect_signal` is a non-clinically-validated keyword/mood heuristic, explicitly
  commented as such. Do not point real users at it without the Tier 1 clinical review.
- The two `knowledge_chunks` seed rows have `reviewed_by`/`reviewed_at` left `NULL` —
  correctly rendered as "Unreviewed draft" by the frontend — because no lawyer review has
  happened. Don't backfill those columns without a real reviewer.
- The two `professionals` seed rows are named `[SEED] ...` and `credentials_verified =
  false` on purpose — they are not real vetted listings.
- `SAHAY_MASTER_KEY` env-var-based key wrapping (`crypto.rs`) is adequate for dev/MVP, not a
  substitute for a real KMS in production.

**Tier 1 research gates (PRD §7.1) — clinical safety review, legal content review, data
protection counsel review — must clear before any crisis flow, legal content, or user data
collection ships, even in a closed pilot.** If asked to ship one of those without confirmation
the relevant review happened, flag it rather than proceeding silently.

## Skills

Project-specific Claude Code skills live in `.claude/skills/` — use them for the recurring
workflows they cover (new AI agent, new API endpoint, new design component, legal content
entry, DB migrations, safety/DPDPA pre-ship checks, go-live readiness) rather than
freehanding those patterns from scratch each time.
