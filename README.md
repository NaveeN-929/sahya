# Sahay

An AI-native support platform for men in India facing domestic/partner abuse, disputed
legal allegations, custody disputes, financial/workplace abuse, and the mental-health
consequences of these. See [`Sahay_Master_PRD_v1.md`](Sahay_Master_PRD_v1.md) for the full
product, architecture, legal, and business specification, and
[`CLAUDE.md`](CLAUDE.md) for the engineering summary and non-negotiable safety constraints.

## Repo layout

```
Sahay_Master_PRD_v1.md   — master PRD (source of truth)
design-system/           — Digital Sanctuary design system (tokens, components, docs)
frontend/                — Next.js client (App Router, Tailwind v4, Digital Sanctuary design system)
backend/                 — Rust/Axum application + AI orchestration service
  infra/
    docker-compose.yml   — local Postgres (pgvector) for development
.claude/skills/          — project-specific Claude Code skills (new agent, new endpoint, design component, legal content, DB migration, safety/DPDPA check, go-live checklist)
.github/workflows/       — CI (frontend lint/build, backend fmt/clippy/build/test)
```

`frontend/` and `backend/` are independent projects sharing this one repo — each has its
own dependency manifest, lockfile, and build/lint/test commands, and is meant to be worked
on (and eventually deployed) on its own.

## Local development

**Database + local LLM:**

```sh
docker compose -f backend/infra/docker-compose.yml up -d
docker compose -f backend/infra/docker-compose.yml exec ollama ollama pull llama3.2   # once
```

**Backend (`backend/`):**

```sh
cd backend
cp .env.example .env   # set SAHAY_MASTER_KEY (openssl rand -base64 32); adjust DATABASE_URL/OLLAMA_* if needed
cargo run
```

Migrations run automatically on startup (`sqlx::migrate!`, see `config.rs`) — no separate
migration step needed. The API binds to `0.0.0.0:8080` by default. `/healthz` reports
process + DB status. `/api/v1/directory/crisis-resources` works even without a database
connection — that's a deliberate architectural property, not an oversight (see PRD §11.6).
If `SAHAY_MASTER_KEY` is unset, an ephemeral key is generated per process (fine for a quick
test, but encrypted content won't survive a restart).

**Frontend (`frontend/`):**

```sh
cd frontend
cp .env.local.example .env.local   # points at the backend above
npm install
npm run dev
```

Runs on `http://localhost:3000`. Pages: `/` (landing/first disclosure), `/chat` (AI
Companion), `/journal`, `/directory` (resource directory), `/knowledge` (educational
content), `/privacy` (consents, data export, account deletion).

**Admin panel:** `/admin` is a separate auth system from the anonymous end-user sessions —
there's no public admin sign-up. Bootstrap the first admin account from `backend/`, with
`DATABASE_URL` set (e.g. via `.env`):

```sh
cd backend
cargo run --bin create_admin -- --email you@example.com --password <a-strong-password> --name "Your Name"
```

This inserts (or updates, if the email already exists) a row in the `admins` table — run it
again with a different `--email` to add another admin. Sign in at
`http://localhost:3000/admin/login`. Covers knowledge-content review, professional-directory
vetting, aggregate/non-PII crisis monitoring, and break-glass data-subject export/deletion;
every mutating action is written to `audit_logs`.

## Before building a feature

Read [`CLAUDE.md`](CLAUDE.md)'s non-negotiables section first — this product handles
disclosures of abuse, legal distress, and suicidal ideation, and several constraints
(crisis-resource independence, RAG-only legal content, no autonomous third-party contact)
are architectural, not style preferences. Use the relevant skill in `.claude/skills/` for
recurring work (new AI agent, new API endpoint, new design component, legal content entry,
DB migration, safety/DPDPA pre-ship check, go-live readiness) rather than freehanding it.

**Status as of 2026-06-30:** PRD draft v1.0 complete; MVP backend + frontend implemented
end-to-end (auth, AI Companion, journal, knowledge platform, resource directory, consent/
export/deletion — see CLAUDE.md "Where the project actually is" for the full breakdown of
what's built vs. still placeholder/unbuilt). Tier 1 research gates (clinical safety review,
legal content review, data protection counsel review — PRD §7.1) have **not** yet been
confirmed. No crisis flow, legal content, or user data collection should ship to real users
until those are confirmed, even in a closed pilot — what's in this repo today is
development-stage, with crisis detection and legal content explicitly placeholder/unreviewed.
