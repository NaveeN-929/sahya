"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/button";
import { Badge } from "@/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/table";
import {
  approveAdminArticle,
  listAdminArticles,
  unpublishAdminArticle,
  type AdminArticle,
} from "@/lib/admin-api";

export default function AdminKnowledgePage() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setArticles(await listAdminArticles());
    } catch (err) {
      console.error("could not load knowledge articles", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function run() {
      await load();
    }
    void run();
  }, []);

  async function approve(id: string) {
    await approveAdminArticle(id);
    await load();
  }

  async function unpublish(id: string) {
    await unpublishAdminArticle(id);
    await load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold text-ink">Knowledge review</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Approving sets the same `reviewed_by`/`reviewed_at` fields the public Knowledge
            Platform reads — only lawyer-reviewed content should be approved here (PRD §7.1).
          </p>
        </div>
        <Link href="/admin/knowledge/new">
          <Button size="sm">
            <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            New draft
          </Button>
        </Link>
      </div>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}

      {!loading && (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <Link href={`/admin/knowledge/${article.id}`} className="font-medium hover:underline">
                    {article.title}
                  </Link>
                </TableCell>
                <TableCell className="capitalize">{article.content_category.replace("-", " ")}</TableCell>
                <TableCell>
                  {article.reviewed_at ? (
                    <Badge variant="success">Reviewed</Badge>
                  ) : (
                    <Badge variant="warning">Unreviewed draft</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {article.reviewed_at ? (
                      <Button variant="outline" size="sm" onClick={() => unpublish(article.id)}>
                        Unpublish
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => approve(article.id)}>
                        Approve
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
