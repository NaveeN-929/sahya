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

**Database:**

```sh
docker compose -f backend/infra/docker-compose.yml up -d
```

**Backend (`backend/`):**

```sh
cd backend
cp .env.example .env   # adjust DATABASE_URL if needed
cargo sqlx migrate run --source migrations   # or: sqlx migrate run (requires sqlx-cli)
cargo run
```

The API binds to `0.0.0.0:8080` by default. `/healthz` reports process + DB status.
`/api/v1/directory/crisis-resources` works even without a database connection — that's a
deliberate architectural property, not an oversight (see PRD §11.6).

**Frontend (`frontend/`):**

```sh
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`.

## Before building a feature

Read [`CLAUDE.md`](CLAUDE.md)'s non-negotiables section first — this product handles
disclosures of abuse, legal distress, and suicidal ideation, and several constraints
(crisis-resource independence, RAG-only legal content, no autonomous third-party contact)
are architectural, not style preferences. Use the relevant skill in `.claude/skills/` for
recurring work (new AI agent, new API endpoint, new design component, legal content entry,
DB migration, safety/DPDPA pre-ship check, go-live readiness) rather than freehanding it.

**Status as of 2026-06-30:** PRD draft v1.0 complete; Tier 1 research gates (clinical
safety review, legal content review, data protection counsel review — PRD §7.1) have not
yet been confirmed. No crisis flow, legal content, or user data collection should ship
user-facing until those are confirmed, even in a closed pilot.
