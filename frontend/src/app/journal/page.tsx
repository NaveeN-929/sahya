"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { CrisisBanner } from "@/components/crisis-banner";
import { JournalEditor } from "@/components/journal-editor";
import {
  createJournalEntry,
  deleteJournalEntry,
  listJournalEntries,
  type JournalEntry,
} from "@/lib/api";

const TELE_MANAS_TEL = "tel:14416";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setEntries(await listJournalEntries());
    } catch (err) {
      console.error("could not load journal entries", err);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!draft.trim()) return;
    setSaveState("saving");
    try {
      await createJournalEntry({ content: draft.trim() });
      setDraft("");
      setSaveState("saved");
      await refresh();
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      console.error("could not save journal entry", err);
      setSaveState("idle");
    }
  }

  async function remove(id: string) {
    try {
      await deleteJournalEntry(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      console.error("could not delete journal entry", err);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <CrisisBanner
        dismissible={false}
        onCallHelpline={() => {
          window.location.href = TELE_MANAS_TEL;
        }}
      />

      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Journal</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Private notes, encrypted before they ever leave this conversation. Only you can read
          them.
        </p>
      </div>

      <JournalEditor
        value={draft}
        onChange={setDraft}
        onSave={save}
        saveState={saveState}
        prompt="What happened today that you want to remember or work through?"
      />

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-sm font-semibold text-ink-secondary">Past entries</h2>
        {loading && <p className="text-sm text-ink-muted">Loading…</p>}
        {!loading && entries.length === 0 && (
          <p className="text-sm text-ink-muted">Start your first journal entry above.</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{entry.content}</p>
              <button
                onClick={() => remove(entry.id)}
                aria-label="Delete entry"
                className="shrink-0 rounded-sm p-1.5 text-ink-muted hover:bg-error-bg hover:text-error-fg focus-visible:outline-none focus-visible:shadow-focus-ring"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-ink-muted">
              {new Date(entry.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
