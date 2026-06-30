-- Admin panel auth and audit trail. This is a deliberately separate auth system from the
-- end-user `users`/`sessions` tables (PRD §8.5, `new-api-endpoint` skill: "no generic admin
-- bypass on a per-user route — admin access is a separate, logged break-glass procedure").
-- A bug or compromise in one system must not grant access to the other.

-- admins — sensitivity: standard. Staff operational accounts, not user-disclosed content,
-- so this intentionally does not use the per-user envelope-encryption scheme in crypto.rs.
create table admins (
    id              uuid primary key default gen_random_uuid(),
    email           text not null unique,
    password_hash   text not null,
    display_name    text not null,
    created_at      timestamptz not null default now(),
    last_login_at   timestamptz
);

-- admin_sessions — mirrors `sessions`' token-hash pattern, kept as a wholly separate table
-- from the user-session table on purpose.
create table admin_sessions (
    id           uuid primary key default gen_random_uuid(),
    admin_id     uuid not null references admins(id) on delete cascade,
    token_hash   text not null unique,
    created_at   timestamptz not null default now(),
    last_seen_at timestamptz not null default now(),
    expires_at   timestamptz not null
);
create index admin_sessions_admin_id_idx on admin_sessions(admin_id);
create index admin_sessions_token_hash_idx on admin_sessions(token_hash);

-- audit_logs — append-only. Every mutating admin action (knowledge review, professional
-- verification, data-subject-request fulfillment) writes one row here. No update/delete
-- route is ever exposed for this table.
create table audit_logs (
    id            uuid primary key default gen_random_uuid(),
    admin_id      uuid not null references admins(id) on delete restrict,
    action        text not null,
    resource_type text not null,
    resource_id   uuid,
    reason        text,
    created_at    timestamptz not null default now()
);
create index audit_logs_admin_id_idx on audit_logs(admin_id);
create index audit_logs_created_at_idx on audit_logs(created_at);
