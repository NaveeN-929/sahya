"use client";

import { useState } from "react";
import { Lock, ShieldCheck, BookOpen } from "lucide-react";
import { Button } from "@/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { CrisisBanner } from "@/components/crisis-banner";

const TELE_MANAS_TEL = "tel:14416";

const STARTERS = [
  "I had a hard conversation with my partner today",
  "Someone filed a complaint and I don't know what happens next",
  "I don't think anyone would believe what's going on at home",
];

export default function Home() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-surface px-6">
        <span className="font-heading text-base font-semibold text-brand">Sahay</span>
        <CrisisBanner
          dismissible={false}
          onCallHelpline={() => {
            window.location.href = TELE_MANAS_TEL;
          }}
          className="hidden border-none bg-transparent px-0 py-0 md:flex"
        />
      </header>

      <main className="mx-auto flex w-full max-w-desktop flex-1 flex-col gap-12 px-6 py-16 md:px-12">
        <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h1 className="max-w-xl font-heading text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            You don&apos;t need a name to be heard here.
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-ink-secondary">
            Sahay is a private, anonymous space for men navigating abuse, legal distress, or
            mental health challenges in India. No sign-up, no real name, no judgment — just a
            place to start.
          </p>

          <div className="mt-2 grid w-full gap-3 sm:grid-cols-3">
            <TrustPoint icon={<Lock className="h-4 w-4" strokeWidth={1.75} />} label="Anonymous by default" />
            <TrustPoint icon={<ShieldCheck className="h-4 w-4" strokeWidth={1.75} />} label="Encrypted, private journal" />
            <TrustPoint icon={<BookOpen className="h-4 w-4" strokeWidth={1.75} />} label="Plain-language legal info" />
          </div>
        </section>

        <section className="mx-auto w-full max-w-2xl">
          <Card className="flex flex-col gap-4">
            <CardHeader>
              <CardTitle>What&apos;s on your mind?</CardTitle>
              <CardDescription>
                Start typing, or pick something close to what brought you here.
              </CardDescription>
            </CardHeader>

            <div className="flex flex-wrap gap-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => setMessage(starter)}
                  className="rounded-full border border-border bg-canvas px-3 py-1.5 text-sm text-ink-secondary transition-colors duration-fast hover:bg-muted focus-visible:outline-none focus-visible:shadow-focus-ring"
                >
                  {starter}
                </button>
              ))}
            </div>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              placeholder="Tell me what's going on. I'm here to listen."
              className="w-full resize-none rounded-input border border-border bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:shadow-focus-ring"
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-muted">
                Nothing here requires your name, phone number, or email.
              </p>
              <Button variant="primary" disabled={message.trim().length === 0}>
                Start talking
              </Button>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}

function TrustPoint({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-card border border-border bg-surface px-4 py-3 text-sm text-ink-secondary shadow-1">
      <span className="text-primary-600">{icon}</span>
      {label}
    </div>
  );
}
