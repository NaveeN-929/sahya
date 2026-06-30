"use client";

import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle, Alert } from "@/components/card";
import { Button } from "@/components/button";
import { Input, Label, Textarea } from "@/components/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import {
  AdminApiError,
  deleteAdminUser,
  exportAdminUser,
  lookupAdminUser,
  type UserLookupResult,
} from "@/lib/admin-api";

const MIN_REASON_LEN = 10;

/**
 * Break-glass data-subject-request fulfillment for a user who can't self-serve via
 * `/privacy` (lost their session token and emailed support). The only search field is the
 * pseudonymous handle — there's no name/email/phone search, because the system doesn't
 * collect those by default.
 */
export default function AdminUsersPage() {
  const [handle, setHandle] = useState("");
  const [result, setResult] = useState<UserLookupResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [exportReason, setExportReason] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleLookup(event: React.FormEvent) {
    event.preventDefault();
    setLookupError(null);
    setActionMessage(null);
    setResult(null);
    try {
      setResult(await lookupAdminUser(handle.trim()));
    } catch (err) {
      setLookupError(err instanceof AdminApiError ? err.message : "Lookup failed");
    }
  }

  async function handleExport() {
    if (!result) return;
    setActionError(null);
    setBusy(true);
    try {
      const data = await exportAdminUser(result.id, exportReason);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${result.pseudonymous_handle}-export.json`;
      link.click();
      URL.revokeObjectURL(url);
      setActionMessage("Export downloaded and logged to the audit log.");
      setExportReason("");
    } catch (err) {
      setActionError(err instanceof AdminApiError ? err.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!result) return;
    setActionError(null);
    setBusy(true);
    try {
      await deleteAdminUser(result.id, deleteReason);
      setActionMessage("User data deleted and logged to the audit log.");
      setResult(null);
      setDeleteReason("");
    } catch (err) {
      setActionError(err instanceof AdminApiError ? err.message : "Deletion failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Data requests</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Break-glass export/delete for a user who can&apos;t self-serve via their own
          `/privacy` page. Every action here requires a reason and is written to the audit
          log — this is not a convenience admin override.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Look up a user</CardTitle>
          <CardDescription>By pseudonymous handle only (e.g. guest-3f9a1c).</CardDescription>
        </CardHeader>
        <form className="flex gap-2" onSubmit={handleLookup}>
          <Input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="guest-3f9a1c"
            required
          />
          <Button type="submit">Look up</Button>
        </form>
        {lookupError && (
          <Alert className="mt-4" variant="error" title="No match">
            {lookupError}
          </Alert>
        )}
      </Card>

      {actionMessage && (
        <Alert variant="success" title="Done">
          {actionMessage}
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{result.pseudonymous_handle}</CardTitle>
            <CardDescription>
              Created {new Date(result.created_at).toLocaleDateString()} ·{" "}
              {result.journal_entry_count} journal entries · {result.conversation_count} AI
              conversations
            </CardDescription>
          </CardHeader>
          {actionError && (
            <Alert className="mb-4" variant="error" title="Action failed">
              {actionError}
            </Alert>
          )}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="export-reason">Reason for export</Label>
              <Textarea
                id="export-reason"
                value={exportReason}
                onChange={(e) => setExportReason(e.target.value)}
                placeholder="e.g. user emailed support@... requesting a copy of their data, lost their session token"
              />
            </div>
            <Button
              variant="secondary"
              disabled={busy || exportReason.trim().length < MIN_REASON_LEN}
              onClick={handleExport}
              className="self-start"
            >
              Export data
            </Button>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="delete-reason">Reason for deletion</Label>
              <Textarea
                id="delete-reason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g. user emailed support@... requesting account deletion, lost their session token"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={busy || deleteReason.trim().length < MIN_REASON_LEN}
                  className="self-start"
                >
                  Delete user data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete {result.pseudonymous_handle}&apos;s data?</DialogTitle>
                  <DialogDescription>
                    This permanently deletes the user&apos;s journal entries, AI conversations,
                    consent history, and account. It cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={handleDelete}>
                      Confirm deletion
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      )}
    </div>
  );
}
