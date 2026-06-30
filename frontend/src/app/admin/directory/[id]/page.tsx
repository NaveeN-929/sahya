"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle, Alert, Badge } from "@/components/card";
import { Button } from "@/components/button";
import { Input, Label, Textarea } from "@/components/input";
import {
  listAdminProfessionals,
  rejectAdminProfessional,
  updateAdminProfessional,
  verifyAdminProfessional,
  AdminApiError,
  type AdminProfessional,
} from "@/lib/admin-api";

const CATEGORIES = ["lawyer", "therapist", "financial-advisor"];

export default function EditProfessionalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [professional, setProfessional] = useState<AdminProfessional | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [specializations, setSpecializations] = useState("");
  const [location, setLocation] = useState("");
  const [languages, setLanguages] = useState("");
  const [feeStructure, setFeeStructure] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listAdminProfessionals()
      .then((rows) => {
        const found = rows.find((p) => p.id === id);
        if (!found) return;
        setProfessional(found);
        setName(found.name);
        setCategory(found.category);
        setSpecializations(found.specializations.join(", "));
        setLocation(found.location ?? "");
        setLanguages(found.languages.join(", "));
        setFeeStructure(found.fee_structure ?? "");
      })
      .catch((err) => console.error("could not load professional", err));
  }, [id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateAdminProfessional(id, {
        name,
        category,
        specializations: specializations.split(",").map((s) => s.trim()).filter(Boolean),
        location: location || undefined,
        languages: languages.split(",").map((s) => s.trim()).filter(Boolean),
        fee_structure: feeStructure || undefined,
        contact_info: professional?.contact_info ?? {},
      });
      router.replace("/admin/directory");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Could not save changes");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify() {
    const method = window.prompt('Verification method (e.g. "Bar Council ID checked")');
    if (!method) return;
    await verifyAdminProfessional(id, method);
    router.replace("/admin/directory");
  }

  async function handleReject() {
    await rejectAdminProfessional(id);
    router.replace("/admin/directory");
  }

  if (!professional) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Edit listing</CardTitle>
            {professional.platform_review_status === "approved" && <Badge variant="success">Approved</Badge>}
            {professional.platform_review_status === "pending" && <Badge variant="warning">Pending</Badge>}
            {professional.platform_review_status === "rejected" && <Badge variant="error">Rejected</Badge>}
          </div>
          <CardDescription>
            {professional.credentials_verified
              ? `Verified via ${professional.verification_method ?? "unknown method"}`
              : "Not yet verified."}
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
          <div className="mt-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
            {professional.platform_review_status !== "approved" && (
              <Button type="button" variant="secondary" onClick={handleVerify}>
                Verify
              </Button>
            )}
            {professional.platform_review_status !== "rejected" && (
              <Button type="button" variant="outline" onClick={handleReject}>
                Reject
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
