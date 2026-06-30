"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/button";
import { Badge } from "@/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/table";
import {
  listAdminProfessionals,
  rejectAdminProfessional,
  verifyAdminProfessional,
  type AdminProfessional,
} from "@/lib/admin-api";

// Radix Select.Item forbids an empty-string value, so "all" is the sentinel here and gets
// translated to "no filter" before it reaches the API client.
const STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminDirectoryPage() {
  const [status, setStatus] = useState("all");
  const [professionals, setProfessionals] = useState<AdminProfessional[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setProfessionals(await listAdminProfessionals(status === "all" ? undefined : status));
    } catch (err) {
      console.error("could not load professionals", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function run() {
      await load();
    }
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function verify(id: string) {
    const method = window.prompt("Verification method (e.g. \"Bar Council ID checked\")");
    if (!method) return;
    await verifyAdminProfessional(id, method);
    await load();
  }

  async function reject(id: string) {
    await rejectAdminProfessional(id);
    await load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold text-ink">Directory vetting</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Verifying sets `credentials_verified`/`verification_method`/`verified_at` together —
            these are load-bearing for trust on the public directory (FR-4.2).
          </p>
        </div>
        <Link href="/admin/directory/new">
          <Button size="sm">
            <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            New listing
          </Button>
        </Link>
      </div>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="max-w-xs">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}

      {!loading && (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {professionals.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/admin/directory/${p.id}`} className="font-medium hover:underline">
                    {p.name}
                  </Link>
                </TableCell>
                <TableCell className="capitalize">{p.category.replace("-", " ")}</TableCell>
                <TableCell>
                  {p.platform_review_status === "approved" && <Badge variant="success">Approved</Badge>}
                  {p.platform_review_status === "pending" && <Badge variant="warning">Pending</Badge>}
                  {p.platform_review_status === "rejected" && <Badge variant="error">Rejected</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {p.platform_review_status !== "approved" && (
                      <Button variant="primary" size="sm" onClick={() => verify(p.id)}>
                        Verify
                      </Button>
                    )}
                    {p.platform_review_status !== "rejected" && (
                      <Button variant="outline" size="sm" onClick={() => reject(p.id)}>
                        Reject
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
