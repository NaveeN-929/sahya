---
name: db-migration
description: Write a new PostgreSQL migration for Sahay's backend/, applying the correct sensitivity tier, encryption, and consent/retention wiring for new or changed tables. Use when asked to add, change, or remove a database table or column for Sahay.
---

# DB Migration (Sahay backend/, PostgreSQL)

Sahay uses Postgres (with `pgvector` for MVP-scale vector search — PRD §8.3), not MongoDB,
specifically because consent/data-subject-request handling needs real foreign keys and
transactional integrity. Migrations should reinforce that, not work around it.

## Steps

1. **Classify sensitivity** against PRD §10.4 before writing DDL:

   | Tier | Tables (existing examples) | Requirement |
   |---|---|---|
   | Critical | `journal_entries`, `incidents`, `evidence_files`, `ai_conversations`/`ai_messages`, `crisis_events` | Per-user envelope encryption on content columns; never plaintext; access-logged; user-controlled deletion |
   | High | `users` | Field-level encryption on `phone`/`email`; indefinite retention while account active |
   | Moderate, audit-critical | `consent_records` | Standard encryption; indefinite retention (legal requirement) — append-only in spirit, don't design for hard deletes of consent history |
   | Moderate | `professionals` | Standard; not end-user PII, but `credentials_verified`/`verified_at`/`verification_method` are load-bearing for trust — don't make them optional |

   A new table holding user-generated or user-disclosed content defaults to **critical**
   unless there's a specific, documented reason it isn't.

2. **Encrypted content columns:** name them `*_encrypted` and store ciphertext only —
   encryption/decryption happens in the application layer with per-user envelope keys, never
   in SQL. Never add a plaintext mirror column "for easier querying."

3. **Foreign keys, not denormalization.** Use real FKs for ownership (`user_id`) and linkage
   (`linked_incident_id`, `linked_evidence_ids`, etc.) — this is the whole reason Postgres
   was chosen over a document store; don't undermine it with loosely-typed JSON blobs for
   relational data.

4. **Consent-relevant tables:** if the migration adds a column that represents a new kind of
   data collection requiring opt-in (anything beyond core anonymous-session usage), make
   sure `consent_records.consent_type` has (or gets) a corresponding value, and that the
   API layer writing to this column also writes a consent row in the same transaction (see
   `new-api-endpoint` skill).

5. **Retention/deletion support:** every new table with a `user_id` FK must support being
   fully removed (not soft-delete-only) on account deletion, and individually
   deletable/exportable by the user where the table represents their own content (FR-5.2,
   FR-5.3, PRD §10.5). If you add a table that can't cleanly cascade-delete, that's a design
   problem to flag, not a follow-up TODO.

6. **`crisis_events`** is access-restricted beyond the standard tier — store
   `signal_summary` as structured/categorical data, never raw transcript. Don't widen this
   table's columns to include free-text conversation content.

7. **Indexes:** index `user_id` FKs used in per-user queries; for `knowledge_chunks`,
   ensure the vector index (pgvector `ivfflat`/`hnsw`) is created alongside
   `content_category` for filtered RAG retrieval.

8. **Naming/versioning:** sequential, timestamped migration files; never edit a migration
   that has already shipped to a deployed environment — write a new one.

## Don't

- Don't store file content in Postgres — `evidence_files` holds a storage reference + hash
  only, never bytes.
- Don't add a column to `crisis_events` or `ai_messages.safety_flags` that captures raw
  classifier reasoning or full prompt/response text — categorical flags only (NFR-5).
- Don't make `consent_records` rows mutable in place — revocation is a new row/timestamp
  (`revoked_at`), not an overwrite, to preserve the audit trail.
