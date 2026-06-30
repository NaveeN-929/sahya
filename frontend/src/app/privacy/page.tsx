"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import { Badge, Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import {
  clearSession,
  deleteAccount,
  exportAccount,
  getStoredHandle,
  grantConsent,
  listConsents,
  revokeConsent,
  type ConsentRecord,
} from "@/lib/api";

const CONSENT_TYPES = [
  { value: "data-processing", label: "General data processing" },
  { value: "phone-collection", label: "Phone number collection" },
  { value: "evidence-storage", label: "Evidence file storage" },
  { value: "professional-referral-share", label: "Sharing details with a referred professional" },
];

const POLICY_VERSION = "draft-2026-06-30";

export default function PrivacyPage() {
  const router = useRouter();
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    listConsents()
      .then(setConsents)
      .catch((err) => console.error("could not load consents", err));
  }, []);

  async function grant(consentType: string) {
    try {
      const record = await grantConsent({ consent_type: consentType, policy_version: POLICY_VERSION });
      setConsents((prev) => [record, ...prev]);
    } catch (err) {
      console.error("could not grant consent", err);
    }
  }

  async function revoke(id: string) {
    try {
      await revokeConsent(id);
      setConsents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, revoked_at: new Date().toISOString() } : c)),
      );
    } catch (err) {
      console.error("could not revoke consent", err);
    }
  }

  async function handleExport() {
    try {
      const data = await exportAccount();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sahay-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("could not export account", err);
    }
  }

  async function handleDelete() {
    try {
      await deleteAccount();
      router.push("/");
    } catch (err) {
      console.error("could not delete account", err);
    }
  }

  function handleLogout() {
    clearSession();
    router.push("/");
  }

  const activeConsentTypes = new Set(consents.filter((c) => !c.revoked_at).map((c) => c.consent_type));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Privacy &amp; account</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Session: <span className="font-mono">{getStoredHandle() ?? "—"}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consent</CardTitle>
          <CardDescription>
            Nothing beyond anonymous-session usage happens without an explicit grant here (PRD
            §10.1, DPDPA).
          </CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-2">
          {CONSENT_TYPES.map((type) => {
            const active = activeConsentTypes.has(type.value);
            const record = consents.find((c) => c.consent_type === type.value && !c.revoked_at);
            return (
              <div
                key={type.value}
                className="flex items-center justify-between gap-3 rounded-card border border-border bg-canvas px-4 py-3"
              >
                <div>
                  <p className="text-sm text-ink">{type.label}</p>
                  {active ? (
                    <Badge variant="success">Granted</Badge>
                  ) : (
                    <Badge variant="neutral">Not granted</Badge>
                  )}
                </div>
                {active ? (
                  <Button variant="outline" size="sm" onClick={() => record && revoke(record.id)}>
                    Revoke
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => grant(type.value)}>
                    Grant
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your data</CardTitle>
          <CardDescription>
            Export everything you&apos;ve disclosed, or permanently delete your account and all
            linked data (FR-5.2, FR-5.3).
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" strokeWidth={1.75} /> Export my data
          </Button>
          <Button variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </Card>

      <Card className="border-error-border">
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>
            Permanently deletes your journal, conversations, and consent history. This cannot
            be undone.
          </CardDescription>
        </CardHeader>
        {!confirmingDelete ? (
          <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>
            <Trash2 className="h-4 w-4" strokeWidth={1.75} /> Delete my account
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-ink-secondary">Are you sure? This is permanent.</p>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Yes, delete everything
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
