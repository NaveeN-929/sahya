"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle, Alert } from "@/components/card";
import { Button } from "@/components/button";
import { Input, Label, Textarea } from "@/components/input";
import { createAdminArticle, AdminApiError } from "@/lib/admin-api";

const CATEGORIES = ["cyber-abuse", "elder-abuse", "domestic-abuse", "custody", "financial-abuse"];

export default function NewKnowledgeArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentCategory, setContentCategory] = useState(CATEGORIES[0]);
  const [sourceCitation, setSourceCitation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const created = await createAdminArticle({
        title,
        content,
        content_category: contentCategory,
        source_citation: sourceCitation,
      });
      router.replace(`/admin/knowledge/${created.id}`);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Could not create draft");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>New knowledge draft</CardTitle>
          <CardDescription>
            Created unreviewed — won&apos;t appear on the public Knowledge Platform until approved.
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
              placeholder="e.g. IT Act 2000 §§66E, 67"
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
          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? "Saving…" : "Save draft"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
