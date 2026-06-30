"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle, Alert } from "@/components/card";
import { Button } from "@/components/button";
import { Input, Label, Textarea } from "@/components/input";
import { createAdminProfessional, AdminApiError } from "@/lib/admin-api";

const CATEGORIES = ["lawyer", "therapist", "financial-advisor"];

export default function NewProfessionalPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [specializations, setSpecializations] = useState("");
  const [location, setLocation] = useState("");
  const [languages, setLanguages] = useState("English");
  const [feeStructure, setFeeStructure] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const created = await createAdminProfessional({
        name,
        category,
        specializations: specializations.split(",").map((s) => s.trim()).filter(Boolean),
        location: location || undefined,
        languages: languages.split(",").map((s) => s.trim()).filter(Boolean),
        fee_structure: feeStructure || undefined,
        contact_info: {},
      });
      router.replace(`/admin/directory/${created.id}`);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Could not create listing");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>New professional listing</CardTitle>
          <CardDescription>
            Created as `pending` — won&apos;t show `credentials_verified` on the public
            directory until verified.
          </CardDescription>
        </CardHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <Alert variant="error" title="Could not save">{error}</Alert>}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            <Label htmlFor="specializations">Specializations (comma-separated)</Label>
            <Input
              id="specializations"
              value={specializations}
              onChange={(e) => setSpecializations(e.target.value)}
              placeholder="custody, disputed-legal-allegations"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="languages">Languages (comma-separated)</Label>
            <Input id="languages" value={languages} onChange={(e) => setLanguages(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fee">Fee structure</Label>
            <Textarea id="fee" value={feeStructure} onChange={(e) => setFeeStructure(e.target.value)} />
          </div>
          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? "Saving…" : "Save listing"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
