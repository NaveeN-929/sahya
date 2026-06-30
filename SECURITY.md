# Security Policy

Sahay holds anonymous disclosures of domestic/partner abuse, legal distress, journal
entries, and (in later phases) evidence files from a population that can be put at real
physical or legal risk if their data leaks or their identity is exposed. We treat security
reports against this codebase as high priority regardless of where in the stack they land.

## Reporting a vulnerability

**Do not open a public GitHub issue for a security vulnerability.** Public issues are
indexed and searchable; for this project a public report can itself create the harm before
a fix ships.

Instead, email **nsanni29@gmail.com** with:

- A description of the vulnerability and its potential impact
- Steps to reproduce (proof-of-concept code, request/response samples, or a short script)
- The affected component (e.g. `backend/src/routes/agent.rs`, `backend/src/crypto.rs`,
  `frontend/src/app/journal`, `/admin`) and, if known, the commit/version
- Your assessment of severity, if you have one

You'll get an acknowledgment within **72 hours**. We'll follow up with a confirmed/rejected
assessment and a rough remediation timeline once we've reproduced it. We'll credit you in
the fix's release notes if you'd like — let us know your preference (credited, anonymous, or
no mention) in your report.

### Safe harbor

We won't pursue legal action against good-faith security research that:

- Avoids privacy violations, data destruction, and service disruption
- Only interacts with accounts/data you created yourself or have explicit permission to
  test against — given this product's anonymous-session model, do not attempt to access,
  decrypt, or exfiltrate another user's journal entries, conversations, or any other
  session's data, even to demonstrate impact
- Gives us a reasonable window to remediate before any public disclosure (see below)
- Doesn't use findings to exploit, blackmail, or harass real users

## Scope

In scope:

- The `backend/` Rust/Axum application and AI orchestration layer, including auth,
  encryption (`crypto.rs`), agent routes, and admin panel
- The `frontend/` Next.js client
- `backend/infra/docker-compose.yml` and any other deployment/infra config in this repo
- Anything that could de-anonymize a user, bypass the per-user envelope encryption on
  journal/evidence/conversation data, escalate privilege into `/admin`, or compromise the
  independence of `/api/v1/directory/crisis-resources`

Particularly high-value reports (these map to the non-negotiables in `CLAUDE.md`):

- Any path that links an anonymous session to a real-world identity without consent
- Any way to read another user's encrypted content, or weaknesses in the envelope-encryption
  / key-wrapping scheme (`SAHAY_MASTER_KEY` handling in `crypto.rs`)
- Auth bypass into the admin panel, or any standard (non-admin) API path that returns
  cross-user data
- Anything that makes `/api/v1/directory/crisis-resources` depend on the database, the AI
  orchestration layer, or any other component that could take it down along with the rest of
  the platform
- Prompt injection or jailbreak techniques that get an AI agent to fabricate a crisis
  hotline/resource, give case-merit legal advice, or leak another session's conversation
  content into its output

Out of scope:

- Findings that require physical access to a user's device
- Denial-of-service via brute-force traffic volume (rate-limiting gaps are still worth
  reporting, but a raw "I can DoS it by sending a lot of requests" report without a
  underlying logic flaw is low priority for a project at this stage)
- Vulnerabilities in third-party dependencies with no demonstrated exploit path against this
  app specifically — please report those upstream instead, though a pointer to a relevant
  CVE affecting our pinned version is welcome
- Social engineering against contributors or users
- This is a development-stage project (see `CLAUDE.md`'s "Where the project actually is");
  missing features and known placeholders documented there (e.g. unreviewed crisis-detection
  heuristic, seed directory/knowledge content) are tracked issues, not vulnerabilities

## Supported versions

There is no tagged release yet — security fixes land on `main`. Once versioned releases
begin, this section will list which lines receive security patches.

## Disclosure timeline

We ask for **90 days** from acknowledgment before any public disclosure, to give us time to
fix and deploy — shorter if we confirm and ship a fix sooner, longer only if we're in active
communication with you about remediation progress. Given the user population, we'd ask you
to weigh the harm of early disclosure heavily even after that window.
