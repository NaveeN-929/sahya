-- Development seed data only. Do NOT treat this as real reviewed content or real vetted
-- professionals — none of it has cleared the Tier 1 review gates in PRD §7.1. It exists so
-- the Knowledge Platform and Resource Directory have something to render in dev/demo.
-- Before any real deployment: replace the knowledge_chunks rows with lawyer-reviewed
-- content (set reviewed_by/reviewed_at) and replace/remove the professionals rows with
-- real, founder-vetted entries (see the `legal-content-entry` and `go-live-checklist`
-- skills).

insert into knowledge_chunks (title, content, source_citation, content_category, embedding)
select * from (values (
    'What counts as cyber harassment under Indian law',
    'Cyberstalking, doxxing, online harassment, and non-consensual sharing of images can be reported regardless of the victim''s gender. Relevant provisions include IT Act 2000 Sections 66E and 67/67A, and Bharatiya Nyaya Sanhita (BNS) provisions on stalking, criminal intimidation, and defamation. You can file a complaint at the National Cyber Crime Reporting Portal (cybercrime.gov.in) or your nearest cybercrime cell. This is general information, not legal advice for your specific situation — UNREVIEWED DRAFT, pending lawyer review (PRD §7.1).',
    'IT Act 2000 §§66E, 67, 67A; Bharatiya Nyaya Sanhita 2023 (stalking, criminal intimidation, defamation provisions)',
    'cyber-abuse',
    null::vector
)) as v(title, content, source_citation, content_category, embedding)
where not exists (select 1 from knowledge_chunks where title = 'What counts as cyber harassment under Indian law');

insert into knowledge_chunks (title, content, source_citation, content_category, embedding)
select * from (values (
    'The Senior Citizens Act, 2007 — a remedy that already works',
    'The Maintenance and Welfare of Parents and Senior Citizens Act, 2007 is gender-neutral and lets a senior citizen (including fathers) apply to a Maintenance Tribunal for maintenance from children or relatives, and provides a process for addressing neglect. Unlike several other categories in this taxonomy, the law here is already comparatively clear and accessible. This is general information, not legal advice for your specific situation — UNREVIEWED DRAFT, pending lawyer review (PRD §7.1).',
    'Maintenance and Welfare of Parents and Senior Citizens Act, 2007',
    'elder-abuse',
    null::vector
)) as v(title, content, source_citation, content_category, embedding)
where not exists (select 1 from knowledge_chunks where title = 'The Senior Citizens Act, 2007 — a remedy that already works');

insert into professionals (name, category, credentials_verified, specializations, location, languages, fee_structure, contact_info, platform_review_status)
select * from (values (
    '[SEED] Example Family Law Practitioner — replace before launch',
    'lawyer',
    false,
    array['custody', 'disputed-legal-allegations']::text[],
    'Bengaluru',
    array['English', 'Hindi', 'Kannada']::text[],
    'Unknown — placeholder entry',
    '{"note": "placeholder seed data, not a real listing"}'::jsonb,
    'pending'
)) as v(name, category, credentials_verified, specializations, location, languages, fee_structure, contact_info, platform_review_status)
where not exists (select 1 from professionals where name = '[SEED] Example Family Law Practitioner — replace before launch');

insert into professionals (name, category, credentials_verified, specializations, location, languages, fee_structure, contact_info, platform_review_status)
select * from (values (
    '[SEED] Example Counsellor — replace before launch',
    'therapist',
    false,
    array['domestic-abuse', 'mental-health']::text[],
    'Remote / Pan-India',
    array['English', 'Hindi']::text[],
    'Unknown — placeholder entry',
    '{"note": "placeholder seed data, not a real listing"}'::jsonb,
    'pending'
)) as v(name, category, credentials_verified, specializations, location, languages, fee_structure, contact_info, platform_review_status)
where not exists (select 1 from professionals where name = '[SEED] Example Counsellor — replace before launch');
