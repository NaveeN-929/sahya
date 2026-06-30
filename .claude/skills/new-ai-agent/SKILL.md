---
name: new-ai-agent
description: Scaffold a new AI orchestration agent (emotional support, legal info, abuse assessment, crisis detection, journal assistant, resource recommendation, or a new one) in backend/'s AI orchestration layer with Sahay's required safety boundaries wired in. Use when asked to add, build, or modify an AI agent/conversational capability for Sahay.
---

# New AI Agent (Sahay orchestration layer)

Sahay's AI orchestration layer (PRD §8.4, §9) mediates every LLM call. The client never
calls a provider directly. Every agent goes through the same request lifecycle:

1. Receive request at `/api/v1/agent/converse` with `{ conversation_id, message, agent_type }`.
2. Attach minimum necessary context only — recent turns, relevant retrieved knowledge-base
   chunks (if RAG-grounded), and a safety-classifier pass over the latest user message.
   Never attach phone/email/evidence-file content unless the active agent specifically needs it.
3. Run the safety pre-check (crisis-signal classifier, PRD §9.4.2) before calling the
   provider — this must be a fast, lightweight pass, not a second full LLM call in the
   critical path (NFR-2).
4. Call the provider through the orchestration layer's provider-abstraction interface, not
   a hard-coded SDK call (PRD §9.7) — must remain swappable.
5. Post-generation safety check, then return `{ response, safety_interrupt (nullable),
   citations (for legal-info agent) }`. `safety_interrupt` is always a separate field from
   `response` so the client renders crisis UI from a fixed component regardless of what the
   model produced (PRD §11.3).
6. Persist to `ai_conversations`/`ai_messages` with `content_encrypted` (per-user envelope
   encryption) and a structured `safety_flags` object — flag categories only, never raw
   classifier reasoning or full transcript in the flag (PRD §10.1, NFR-5).

## Checklist for any new or modified agent

- [ ] **System prompt boundaries are explicit, not assumed.** "Be empathetic" alone does not
      produce validation-without-endorsement or no-sycophantic-escalation behavior — write
      and test both as separate instructions (PRD §9.1).
- [ ] **Legal-specific or case-merit content is RAG-only.** If the agent could touch legal
      questions, it must retrieve from the reviewed `knowledge_chunks` table and is
      explicitly instructed not to answer legal specifics from outside that retrieved
      content (PRD §9.2.1). Do not let a general-purpose agent free-generate legal answers
      "just this once."
- [ ] **Crisis signal handling is multi-signal, not single-keyword.** Combine the per-message
      classifier with session-level signals (mood-tracker drops, journal sentiment,
      disengagement) per PRD §9.4.2 — don't let a single regex/keyword match drive a crisis
      interrupt by itself, and don't let it drive a missed detection either.
- [ ] **Conservative bias on ambiguous signals** — soft check-in + visible resource
      availability beats both silence and a jarring full interrupt (PRD §9.4.2).
- [ ] **No autonomous third-party contact.** Whatever this agent detects, it surfaces
      resources; it never places a call, sends a message, or notifies anyone without the
      user's affirmative in-session action (PRD §9.4.1). This is non-negotiable — see
      `CLAUDE.md` non-negotiable #2.
- [ ] **Recommendation-style agents (resource directory) query structured data, not free
      generation.** Never let an agent invent a lawyer/therapist/NGO name — only return
      records that exist in the vetted `professionals` table (PRD §9.6, §9.7).
- [ ] **Disclaimer + citation on every legal or clinical-adjacent response** (PRD §9.2, §15.5).
- [ ] **Add/extend a red-team eval set** for this agent covering: requests for case-specific
      legal strategy, requests to validate hostility toward a named third party, and
      borderline crisis-signal phrasing — before merging (PRD §9.7 ongoing QA process).
- [ ] **Confirm Tier 1 clinical/legal review status** before shipping anything user-facing
      for a crisis or legal-content agent (PRD §7.1) — if unconfirmed, flag it rather than
      shipping silently.

## Where things live

- Agent type enum / routing: `backend/` orchestration module — keep `agent_type` values in
  sync with the DB enum used in `ai_conversations.agent_type`.
- Knowledge base content for RAG agents: ingested into `knowledge_chunks` (pgvector), each
  row carries `source_citation`, `content_category` (maps to PRD §3 taxonomy), `reviewed_by`,
  `reviewed_at` — never insert unreviewed content for the Legal Information Agent.
- Crisis resource list: served from `/api/v1/directory/crisis-resources`, which must stay
  independent of the AI orchestration layer (see the `safety-dpdpa-check` skill and
  `CLAUDE.md` non-negotiable #3) — don't accidentally introduce a dependency from that
  endpoint back into agent code.
