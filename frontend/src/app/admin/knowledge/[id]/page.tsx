"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle, Alert, Badge } from "@/components/card";
import { Button } from "@/components/button";
import { Input, Label, Textarea } from "@/components/input";
import {
  approveAdminArticle,
  deleteAdminArticle,
  listAdminArticles,
  unpublishAdminArticle,
  updateAdminArticle,
  AdminApiError,
  type AdminArticle,
} from "@/lib/admin-api";

const CATEGORIES = ["cyber-abuse", "elder-abuse", "domestic-abuse", "custody", "financial-abuse"];

export default function EditKnowledgeArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<AdminArticle | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentCategory, setContentCategory] = useState(CATEGORIES[0]);
  const [sourceCitation, setSourceCitation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listAdminArticles()
      .then((articles) => {
        const found = articles.find((a) => a.id === id);
        if (!found) return;
        setArticle(found);
        setTitle(found.title);
        setContent(found.content);
        setContentCategory(found.content_category);
        setSourceCitation(found.source_citation);
      })
      .catch((err) => console.error("could not load article", err));
  }, [id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateAdminArticle(id, {
        title,
        content,
        content_category: contentCategory,
        source_citation: sourceCitation,
      });
      router.replace("/admin/knowledge");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Could not save changes");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove() {
    await approveAdminArticle(id);
    router.replace("/admin/knowledge");
  }

  async function handleUnpublish() {
    await unpublishAdminArticle(id);
    router.replace("/admin/knowledge");
  }

  async function handleDelete() {
    if (!window.confirm("Delete this article permanently? This cannot be undone.")) return;
    await deleteAdminArticle(id);
    router.replace("/admin/knowledge");
  }

  if (!article) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Edit article</CardTitle>
            {article.reviewed_at ? (
              <Badge variant="success">Reviewed</Badge>
            ) : (
              <Badge variant="warning">Unreviewed draft</Badge>
            )}
          </div>
          <CardDescription>
            Saving content changes clears review status — it has to be re-approved against the
            new text.
          </CardDescription>
        </CardHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <Alert variant="error" title="Could not save">{error}</Alert>}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={contentCategory}
              onChange={(e) => setContentCategory(e.target.value)}
              className="h-11 w-full rounded-input border border-border bg-surface px-4 text-sm text-ink focus-visible:outline-none focus-visible:shadow-focus-ring"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace("-", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="citation">Source citation</Label>
            <Input
              id="citation"
              required
              value={sourceCitation}
              onChange={(e) => setSourceCitation(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[16rem]"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
            {article.reviewed_at ? (
              <Button type="button" variant="outline" onClick={handleUnpublish}>
                Unpublish
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={handleApprove}>
                Approve
              </Button>
            )}
            <Button type="button" variant="destructive" onClick={handleDelete} className="ml-auto">
              Delete
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
