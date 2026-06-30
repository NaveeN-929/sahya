import * as React from "react";
import { Scale, ExternalLink, Star, Video, MapPin, Languages } from "lucide-react";
import { Badge } from "./card";
import { Button } from "./button";

/* ----------------------------- LegalResourceCard ----------------------------- */
/**
 * Presents legal information neutrally: no scales-of-justice drama, no implication of
 * guilt/innocence. Copy is always informational ("Understand your options"), never
 * advisory or definitive ("You will win your case").
 */
export interface LegalResourceCardProps {
  title: string;
  jurisdiction: string;
  summary: string;
  topics: string[];
  onOpen: () => void;
}
export function LegalResourceCard({ title, jurisdiction, summary, topics, onOpen }: LegalResourceCardProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-1 transition-shadow duration-base hover:shadow-2">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-info-bg text-info-fg">
          <Scale className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="font-heading text-base font-semibold text-ink">{title}</p>
          <p className="text-xs text-ink-muted">{jurisdiction}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-secondary">{summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {topics.map((t) => (
          <Badge key={t} variant="neutral">{t}</Badge>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={onOpen} className="mt-4">
        Read guidance <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
      </Button>
      <p className="mt-2 text-[11px] text-ink-muted">
        General information, not legal advice. Consult a licensed attorney for your situation.
      </p>
    </div>
  );
}

/* ----------------------------- TherapistCard ----------------------------- */
export interface TherapistCardProps {
  name: string;
  credentials: string;
  specialties: string[];
  rating: number;
  languages: string[];
  modalities: ("video" | "in-person")[];
  photoUrl?: string;
  onBook: () => void;
}
export function TherapistCard({ name, credentials, specialties, rating, languages, modalities, photoUrl, onBook }: TherapistCardProps) {
  return (
    <div className="rounded-card-lg border border-border bg-surface p-5 shadow-1 transition-shadow duration-base hover:shadow-2">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
          {photoUrl && (
            // Profile photos come from arbitrary vetted-professional sources, not
            // site-controlled assets, so next/image's static remote-pattern allowlist
            // doesn't fit here — a plain <img> is the deliberate choice.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <p className="font-heading text-base font-semibold text-ink">{name}</p>
          <p className="text-xs text-ink-muted">{credentials}</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-sm text-ink-secondary">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          {rating.toFixed(1)}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {specialties.map((s) => (
          <Badge key={s} variant="primary">{s}</Badge>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1">
          <Languages className="h-3.5 w-3.5" strokeWidth={1.75} /> {languages.join(", ")}
        </span>
        <span className="flex items-center gap-1">
          {modalities.includes("video") ? <Video className="h-3.5 w-3.5" strokeWidth={1.75} /> : <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />}
          {modalities.join(" · ")}
        </span>
      </div>

      <Button onClick={onBook} className="mt-4 w-full" size="sm">
        Book a session
      </Button>
    </div>
  );
}
