"use client";

import { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle, Alert } from "@/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/table";
import { getCrisisSummary, type CrisisSummary } from "@/lib/admin-api";

export default function AdminCrisisPage() {
  const [summary, setSummary] = useState<CrisisSummary | null>(null);

  useEffect(() => {
    getCrisisSummary()
      .then(setSummary)
      .catch((err) => console.error("could not load crisis summary", err));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Crisis monitoring</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Last 30 days, aggregate and categorical only — this view never includes a user
          identifier, by design.
        </p>
      </div>

      <Alert variant="info" title="Detection is a non-clinically-validated placeholder">
        These signals come from `crisis.rs::detect_signal`, an engineering placeholder pending
        the Tier 1 clinical review (PRD §7.1). Treat trends here as a development signal, not a
        validated safety metric.
      </Alert>

      {!summary && <p className="text-sm text-ink-muted">Loading…</p>}

      {summary && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Total events</CardTitle>
                <CardDescription>Since {new Date(summary.since).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <p className="font-heading text-2xl font-semibold text-ink">{summary.total_events}</p>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Resolved</CardTitle>
                <CardDescription>Events with `resolved_at` set</CardDescription>
              </CardHeader>
              <p className="font-heading text-2xl font-semibold text-ink">{summary.resolved_events}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-2 font-heading text-base font-semibold text-ink">By signal category</h2>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Events</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.by_category.map((row) => (
                    <TableRow key={row.category}>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.event_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div>
              <h2 className="mb-2 font-heading text-base font-semibold text-ink">By user action taken</h2>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Action</TableHeaderCell>
                    <TableHeaderCell>Events</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.by_action_taken.map((row) => (
                    <TableRow key={row.user_action_taken}>
                      <TableCell className="capitalize">{row.user_action_taken}</TableCell>
                      <TableCell>{row.event_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h2 className="mb-2 font-heading text-base font-semibold text-ink">By day</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Day</TableHeaderCell>
                  <TableHeaderCell>Events</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.by_day.map((row) => (
                  <TableRow key={row.day}>
                    <TableCell>{new Date(row.day).toLocaleDateString()}</TableCell>
                    <TableCell>{row.event_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
