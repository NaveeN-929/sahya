-- Adds browsing metadata to knowledge_chunks so the same reviewed-content table backs
-- both the Knowledge Platform's browsable articles (FR-2.1-2.3) and the Legal Information
-- Agent's RAG retrieval (PRD §9.2.1) without duplicating content.
alter table knowledge_chunks
    add column title text not null default '';
alter table knowledge_chunks
    alter column title drop default;
