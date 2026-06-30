---
name: new-api-endpoint
description: Scaffold a new REST endpoint in Sahay's Rust/Axum application plane (apps/api) following its auth, encryption, and versioning conventions. Use when asked to add or modify a backend API route for Sahay.
---

# New API Endpoint (Sahay apps/api)

## Conventions (PRD §11.1)

- REST over HTTPS, JSON, versioned under `/api/v1/...` from day one.
- The client never calls the LLM provider or object storage directly — AI goes through
  `/api/v1/agent/converse` (see `new-ai-agent` skill), files go through signed URLs (below).
- Every endpoint touching journal/evidence/conversation data requires the user's session
  token and is scoped to that user's own records only. There is no admin-override path in
  the standard API surface — admin/support access to user content is a separate, logged
  break-glass procedure (PRD §8.5), not a query parameter or role check on the normal route.

## Steps

1. **Classify the data this endpoint touches** against PRD §10.4's sensitivity table
   (critical / high / moderate). This determines encryption and logging requirements before
   you write the handler.
2. **Auth:** extract and validate the session token; reject anything without it for any
   route that isn't explicitly public (`/api/v1/directory/crisis-resources`,
   `/api/v1/directory/search` browsing, public Knowledge Platform content are the known
   public exceptions per PRD §11.2, §11.6, FR-2.1).
3. **Scope the query to `user_id` from the session**, never from a client-supplied
   parameter, for any per-user resource.
4. **File uploads/downloads:** never proxy file bytes through the app server. Issue a
   short-lived signed URL for direct-to-R2 upload/download
   (`/api/v1/evidence/upload-url`, `/api/v1/evidence/files/{id}/download-url` pattern, PRD
   §11.5). Compute and persist the SHA-256 hash at upload time.
5. **Critical-tier data (journal/incidents/evidence/conversations):** write through the
   per-user envelope-encryption helper, never plaintext to Postgres. Read paths decrypt
   server-side only for the authenticated owner.
6. **Consent-gated fields:** if this endpoint collects phone/email or anything else
   requiring opt-in (PRD §8.5, §10.1), write a corresponding `consent_records` row in the
   same transaction, with `consent_type` and `policy_version_at_consent` — don't collect
   the field and backfill consent separately.
7. **Logging:** log the safety/audit-relevant decision and its category (NFR-5), not the
   raw sensitive payload. Never log full journal/evidence/conversation content, even at
   debug level.
8. **Independence check:** if this is (or touches) `/api/v1/directory/crisis-resources`,
   it must remain servable with zero dependency on the database or AI orchestration layer —
   static/cached, CDN-edge-servable (PRD §11.6, NFR-1). Don't add a DB lookup to this
   specific route for convenience.
9. **Update the route table** in `apps/api`'s router module and confirm the response shape
   matches what's documented in `Sahay_Master_PRD_v1.md` §11 for that resource (or update
   the PRD section if this is a deliberate, agreed deviation).

## Don't

- Don't add a generic "is admin" bypass to a per-user route.
- Don't return file content inline in a JSON response — always the signed-URL pattern.
- Don't skip the consent_records write because "we'll add it later."
- Don't let `/api/v1/directory/crisis-resources` depend on anything that could be the thing
  that's down during an incident.
