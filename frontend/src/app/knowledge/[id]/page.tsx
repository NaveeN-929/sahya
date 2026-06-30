"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Alert } from "@/components/card";
import { getArticle, type ArticleDetail } from "@/lib/api";

export default function ArticlePage() {
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticle(params.id)
      .then(setArticle)
      .catch((err) => console.error("could not load article", err))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (!article) return <p className="text-sm text-ink-muted">Article not found.</p>;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Link href="/knowledge" className="flex items-center gap-1 text-sm text-ink-secondary hover:text-ink">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Back to Knowledge Platform
      </Link>

      <h1 className="font-heading text-2xl font-semibold text-ink">{article.title}</h1>

      {!article.reviewed && (
        <Alert variant="warning" title="Unreviewed draft">
          This content has not yet cleared legal review (PRD §7.1, Tier 1). Treat it as a
          starting point, not confirmed guidance, and don&apos;t rely on it for a real decision
          until it carries a reviewer name and date.
        </Alert>
      )}

      <p className="whitespace-pre-wrap text-base leading-relaxed text-ink">{article.content}</p>

      <div className="rounded-card bg-muted p-4 text-sm text-ink-secondary">
        <p className="font-medium text-ink">Source</p>
        <p className="mt-1">{article.source_citation}</p>
        {article.reviewed && (
          <p className="mt-2 text-xs text-ink-muted">
            Reviewed by {article.reviewed_by} on{" "}
            {article.reviewed_at && new Date(article.reviewed_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <p className="text-xs text-ink-muted">
        General information, not legal advice. Consult a licensed professional about your
        specific situation.
      </p>
    </div>
  );
}
