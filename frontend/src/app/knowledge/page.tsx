"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/card";
import { listArticles, type ArticleSummary } from "@/lib/api";

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "cyber-abuse", label: "Cyber abuse" },
  { value: "elder-abuse", label: "Elder abuse" },
];

export default function KnowledgePage() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      setLoading(true);
      try {
        setArticles(await listArticles({ category: category || undefined }));
      } catch (err) {
        console.error("could not load articles", err);
      } finally {
        setLoading(false);
      }
    }
    void run();
  }, [category]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Knowledge Platform</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Plain-language process information — not legal advice. Every article shows whether
          it has been reviewed by a licensed professional yet.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-fast focus-visible:outline-none focus-visible:shadow-focus-ring ${
              category === c.value
                ? "border-primary-300 bg-primary-50 text-primary-700"
                : "border-border bg-surface text-ink-secondary hover:bg-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}
      {!loading && articles.length === 0 && (
        <p className="text-sm text-ink-muted">No articles in this category yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/knowledge/${article.id}`}
            className="rounded-card border border-border bg-surface p-4 transition-shadow duration-base hover:shadow-2 focus-visible:outline-none focus-visible:shadow-focus-ring"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-heading text-base font-semibold text-ink">{article.title}</p>
              <Badge variant={article.reviewed ? "success" : "warning"}>
                {article.reviewed ? "Reviewed" : "Unreviewed draft"}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-ink-muted">{article.source_citation}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
