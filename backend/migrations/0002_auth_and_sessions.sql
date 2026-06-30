-- Anonymous-session auth (PRD §8.5, FR-1.1) and per-user envelope-encryption key material
-- (PRD §8.5, §10.4 — see backend/src/crypto.rs for the wrap/unwrap scheme).

alter table users
    add column wrapped_dek bytea not null default '\x'::bytea;
alter table users
    alter column wrapped_dek drop default;

-- sessions — sensitivity: high (linkage risk). Only a SHA-256 hash of the bearer token is
-- stored, never the raw token, so a DB read alone can't be replayed as a valid session.
create table sessions (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references users(id) on delete cascade,
    token_hash  text not null unique,
    created_at  timestamptz not null default now(),
    last_seen_at timestamptz not null default now(),
    expires_at  timestamptz not null
);
create index sessions_user_id_idx on sessions(user_id);
create index sessions_token_hash_idx on sessions(token_hash);
