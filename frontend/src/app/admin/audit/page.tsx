"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/table";
import { listAuditLog, type AuditLogEntry } from "@/lib/admin-api";

const PAGE_SIZE = 50;

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      setLoading(true);
      try {
        setEntries(await listAuditLog({ limit: PAGE_SIZE, offset }));
      } catch (err) {
        console.error("could not load audit log", err);
      } finally {
        setLoading(false);
      }
    }
    void run();
  }, [offset]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Audit log</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Append-only record of every mutating admin action. No edit/delete is exposed for
          this table.
        </p>
      </div>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}

      {!loading && (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>When</TableHeaderCell>
                <TableHeaderCell>Admin</TableHeaderCell>
                <TableHeaderCell>Action</TableHeaderCell>
                <TableHeaderCell>Resource</TableHeaderCell>
                <TableHeaderCell>Reason</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{entry.admin_email}</TableCell>
                  <TableCell>{entry.action}</TableCell>
                  <TableCell>
                    {entry.resource_type}
                    {entry.resource_id && (
                      <span className="text-ink-muted"> ({entry.resource_id.slice(0, 8)})</span>
                    )}
                  </TableCell>
                  <TableCell className="text-ink-secondary">{entry.reason ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between">
            <button
              disabled={offset === 0}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
              className="text-sm text-ink-secondary hover:text-ink disabled:opacity-45"
            >
              Newer
            </button>
            <button
              disabled={entries.length < PAGE_SIZE}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
              className="text-sm text-ink-secondary hover:text-ink disabled:opacity-45"
            >
              Older
            </button>
          </div>
        </>
      )}
    </div>
  );
}
