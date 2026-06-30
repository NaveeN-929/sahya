-- Sahay — initial schema (PRD §10). Sensitivity tiers and encryption requirements are
-- documented in CLAUDE.md and the `db-migration` Claude skill — read those before adding
-- columns here, especially anything holding user-disclosed content.

create extension if not exists pgcrypto;
create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- users — sensitivity: high. pseudonymous by default; phone/email are opt-in only.
-- ---------------------------------------------------------------------------
create table users (
    id                       uuid primary key default gen_random_uuid(),
    pseudonymous_handle      text not null unique,
    auth_method              text not null default 'anonymous-session'
                                 check (auth_method in ('anonymous-session', 'phone-verified', 'email-verified')),
    phone_encrypted          bytea,
    email_encrypted          bytea,
    data_retention_preference text not null default 'default',
    created_at               timestamptz not null default now(),
    last_active_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- consent_records — sensitivity: moderate, audit-critical. Append-only in spirit:
-- revocation is a new timestamp, never an overwrite (PRD §10.1, §15.3).
-- ---------------------------------------------------------------------------
create table consent_records (
    id                      uuid primary key default gen_random_uuid(),
    user_id                 uuid not null references users(id) on delete cascade,
    consent_type            text not null
                                check (consent_type in ('data-processing', 'phone-collection', 'evidence-storage', 'professional-referral-share')),
    granted_at              timestamptz not null default now(),
    revoked_at              timestamptz,
    policy_version_at_consent text not null
);
create index consent_records_user_id_idx on consent_records(user_id);

-- ---------------------------------------------------------------------------
-- journal_entries — sensitivity: critical. content_encrypted is application-layer
-- envelope-encrypted ciphertext; never store plaintext here.
-- ---------------------------------------------------------------------------
create table journal_entries (
    id                uuid primary key default gen_random_uuid(),
    user_id           uuid not null references users(id) on delete cascade,
    mood_score         smallint check (mood_score between 1 and 5),
    content_encrypted bytea not null,
    entry_type        text not null default 'free-text'
                          check (entry_type in ('free-text', 'structured-incident', 'check-in-response')),
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now()
);
create index journal_entries_user_id_idx on journal_entries(user_id);

-- ---------------------------------------------------------------------------
-- incidents — sensitivity: critical. Structured timeline entries, distinct from free
-- journaling (PRD §10.1). Linkage to evidence is owned by evidence_files.linked_incident_id
-- below rather than duplicated as an array here, to avoid a denormalized two-way edge.
-- ---------------------------------------------------------------------------
create table incidents (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid not null references users(id) on delete cascade,
    incident_date       date not null,
    description_encrypted bytea not null,
    category            text not null,
    linked_journal_entry_id uuid references journal_entries(id) on delete set null,
    created_at          timestamptz not null default now()
);
create index incidents_user_id_idx on incidents(user_id);

-- ---------------------------------------------------------------------------
-- evidence_files — sensitivity: critical. Never stores file bytes — only a storage
-- reference and integrity hash (PRD §8.5, §11.5).
-- ---------------------------------------------------------------------------
create table evidence_files (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid not null references users(id) on delete cascade,
    storage_reference   text not null,
    file_hash_sha256    text not null,
    file_type           text not null,
    linked_incident_id  uuid references incidents(id) on delete set null,
    uploaded_at         timestamptz not null default now()
);
create index evidence_files_user_id_idx on evidence_files(user_id);
create index evidence_files_linked_incident_id_idx on evidence_files(linked_incident_id);

-- ---------------------------------------------------------------------------
-- ai_conversations / ai_messages — sensitivity: critical, same tier as journal.
-- ---------------------------------------------------------------------------
create table ai_conversations (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references users(id) on delete cascade,
    agent_type  text not null
                    check (agent_type in ('emotional-support', 'legal-info', 'abuse-assessment', 'crisis', 'journal-assistant', 'resource-rec')),
    created_at  timestamptz not null default now()
);
create index ai_conversations_user_id_idx on ai_conversations(user_id);

create table ai_messages (
    id                 uuid primary key default gen_random_uuid(),
    conversation_id    uuid not null references ai_conversations(id) on delete cascade,
    role               text not null check (role in ('user', 'assistant')),
    content_encrypted  bytea not null,
    -- safety_flags is categorical only (e.g. {"crisis_signal_triggered": true}) — never
    -- raw classifier reasoning or transcript excerpts (PRD §10.1, NFR-5).
    safety_flags       jsonb not null default '{}'::jsonb,
    created_at         timestamptz not null default now()
);
create index ai_messages_conversation_id_idx on ai_messages(conversation_id);

-- ---------------------------------------------------------------------------
-- crisis_events — sensitivity: critical, access-restricted beyond the standard tier.
-- signal_summary is structured/categorical, never raw transcript (PRD §10.1).
-- ---------------------------------------------------------------------------
create table crisis_events (
    id                 uuid primary key default gen_random_uuid(),
    user_id            uuid references users(id) on delete set null,
    triggered_at       timestamptz not null default now(),
    signal_summary     jsonb not null,
    resource_surfaced  text not null,
    user_action_taken  text not null default 'none'
                           check (user_action_taken in ('none', 'viewed', 'connected')),
    resolved_at        timestamptz
);
create index crisis_events_user_id_idx on crisis_events(user_id);

-- ---------------------------------------------------------------------------
-- professionals — sensitivity: moderate (not end-user PII). Supply side of the
-- Resource Directory; credentials_verified/verified_at/verification_method are
-- load-bearing for trust and must not be optional (PRD §10.1).
-- ---------------------------------------------------------------------------
create table professionals (
    id                    uuid primary key default gen_random_uuid(),
    name                  text not null,
    category              text not null
                              check (category in ('lawyer', 'therapist', 'financial-advisor')),
    credentials_verified  boolean not null default false,
    verification_method   text,
    verified_at           timestamptz,
    specializations       text[] not null default '{}',
    location              text,
    languages             text[] not null default '{}',
    fee_structure         text,
    contact_info          jsonb not null default '{}'::jsonb,
    platform_review_status text not null default 'pending'
                               check (platform_review_status in ('pending', 'approved', 'rejected')),
    created_at            timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- knowledge_chunks — RAG source for the Legal Information Agent (PRD §9.2.1, §10.3).
-- A row is only eligible for retrieval once reviewed_by/reviewed_at are populated — see
-- the `legal-content-entry` Claude skill for the authoring workflow.
-- ---------------------------------------------------------------------------
create table knowledge_chunks (
    id               uuid primary key default gen_random_uuid(),
    content          text not null,
    source_citation  text not null,
    content_category text not null,
    reviewed_by      text,
    reviewed_at      timestamptz,
    embedding        vector(1536),
    created_at       timestamptz not null default now()
);
create index knowledge_chunks_content_category_idx on knowledge_chunks(content_category);
create index knowledge_chunks_embedding_idx on knowledge_chunks using hnsw (embedding vector_cosine_ops);
