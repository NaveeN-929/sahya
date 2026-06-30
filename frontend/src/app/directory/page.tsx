"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, MapPin, Languages } from "lucide-react";
import { Badge } from "@/components/card";
import { searchProfessionals, type ProfessionalSummary } from "@/lib/api";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "lawyer", label: "Lawyer" },
  { value: "therapist", label: "Therapist" },
  { value: "financial-advisor", label: "Financial advisor" },
];

export default function DirectoryPage() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<ProfessionalSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      setLoading(true);
      try {
        setResults(await searchProfessionals({ category: category || undefined }));
      } catch (err) {
        console.error("could not search directory", err);
      } finally {
        setLoading(false);
      }
    }
    void run();
  }, [category]);

  async function search() {
    setLoading(true);
    try {
      setResults(
        await searchProfessionals({
          category: category || undefined,
          location: location || undefined,
        }),
      );
    } catch (err) {
      console.error("could not search directory", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Find a professional</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          A small, hand-vetted starter list, not an open marketplace — every entry shows its
          verification status (PRD §16.1).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-fast focus-visible:outline-none focus-visible:shadow-focus-ring ${
              category === c.value
                ? "border-primary-300 bg-primary-50 text-primary-700"
                : "border-border bg-surface text-ink-secondary hover:bg-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && search()}
          placeholder="City (optional)"
          className="flex-1 rounded-input border border-border bg-surface px-4 py-2 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:shadow-focus-ring"
        />
        <button
          onClick={search}
          className="rounded-button bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus-visible:outline-none focus-visible:shadow-focus-ring"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}
      {!loading && results.length === 0 && (
        <p className="text-sm text-ink-muted">No professionals match yet — try a different filter.</p>
      )}

      <div className="flex flex-col gap-3">
        {results.map((professional) => (
          <div key={professional.id} className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-heading text-base font-semibold text-ink">{professional.name}</p>
              {professional.credentials_verified ? (
                <Badge variant="success">
                  <ShieldCheck className="h-3 w-3" strokeWidth={1.75} /> Verified
                </Badge>
              ) : (
                <Badge variant="warning">
                  <ShieldAlert className="h-3 w-3" strokeWidth={1.75} /> Unverified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs capitalize text-ink-muted">
              {professional.category.replace("-", " ")}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {professional.specializations.map((spec) => (
                <Badge key={spec} variant="neutral">
                  {spec}
                </Badge>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-ink-muted">
              {professional.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} /> {professional.location}
                </span>
              )}
              {professional.languages.length > 0 && (
                <span className="flex items-center gap-1">
                  <Languages className="h-3.5 w-3.5" strokeWidth={1.75} />{" "}
                  {professional.languages.join(", ")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
