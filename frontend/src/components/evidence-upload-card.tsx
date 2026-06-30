import * as React from "react";
import { ShieldCheck, FileText, Image as ImageIcon, Mic, Lock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * EvidenceUploadCard
 * For documenting incidents (messages, photos, audio, written notes) for personal records
 * or future legal use. Tone must be procedural and protective, never clinical-cold or
 * investigative/dramatic. The privacy reassurance is shown persistently, not just once.
 */
const TYPE_ICON = { document: FileText, image: ImageIcon, audio: Mic } as const;

export interface EvidenceItem {
  id: string;
  type: keyof typeof TYPE_ICON;
  name: string;
  date: string;
}
export interface EvidenceUploadCardProps {
  items: EvidenceItem[];
  onUpload: () => void;
  onRemove: (id: string) => void;
  className?: string;
}
export function EvidenceUploadCard({ items, onUpload, onRemove, className }: EvidenceUploadCardProps) {
  return (
    <div className={cn("rounded-card-lg border border-border bg-surface p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-heading text-base font-semibold text-ink">Private documentation</h3>
          <p className="mt-1 text-sm text-ink-secondary">
            Keep a secure, dated record for yourself. Only you can see this.
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-1 text-xs font-medium text-success-fg">
          <Lock className="h-3 w-3" strokeWidth={1.75} /> Encrypted
        </span>
      </div>

      <button
        onClick={onUpload}
        className="mt-4 flex w-full flex-col items-center gap-2 rounded-card border-2 border-dashed border-border py-6 text-sm text-ink-muted transition-colors duration-fast hover:border-primary-300 hover:bg-primary-50/40 focus-visible:outline-none focus-visible:shadow-focus-ring"
      >
        <ShieldCheck className="h-6 w-6 text-primary-500" strokeWidth={1.75} />
        Add a message, photo, recording, or note
      </button>

      {items.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {items.map((item) => {
            const Icon = TYPE_ICON[item.type];
            return (
              <li key={item.id} className="flex items-center gap-3 rounded-card bg-muted px-3 py-2.5">
                <Icon className="h-4 w-4 shrink-0 text-ink-secondary" strokeWidth={1.75} />
                <span className="flex-1 truncate text-sm text-ink">{item.name}</span>
                <span className="text-xs text-ink-muted">{item.date}</span>
                <button
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="rounded-sm p-1 text-ink-muted hover:bg-surface hover:text-error-fg focus-visible:outline-none focus-visible:shadow-focus-ring"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
