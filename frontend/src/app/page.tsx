"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Lock, ShieldCheck, BookOpen, MessageCircle, NotebookPen, Scale, Users } from "lucide-react";
import { Button } from "@/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { ensureSession } from "@/lib/api";
import { setPendingMessage } from "@/lib/pending-message";

const STARTERS = [
  "I had a hard conversation with my partner today",
  "Someone filed a complaint and I don't know what happens next",
  "I don't think anyone would believe what's going on at home",
];

const HOW_IT_WORKS = [
  {
    icon: MessageCircle,
    title: "Talk to the Companion",
    description: "An AI that listens without judgment, any hour, with no name attached.",
  },
  {
    icon: NotebookPen,
    title: "Keep a private journal",
    description: "Encrypted, text-only notes only you can read — useful for your own clarity, not just evidence.",
  },
  {
    icon: Scale,
    title: "Understand the legal process",
    description: "Plain-language explainers grounded in reviewed sources, never improvised legal advice.",
  },
  {
    icon: Users,
    title: "Find vetted professionals",
    description: "A hand-checked directory of therapists and lawyers when you're ready for a person, not a screen.",
  },
];

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [starting, setStarting] = useState(false);
  const reduceMotion = useReducedMotion();

  async function startTalking() {
    if (!message.trim() || starting) return;
    setStarting(true);
    try {
      await ensureSession();
      setPendingMessage(message.trim());
      router.push("/chat");
    } catch (err) {
      console.error("could not start session", err);
      setStarting(false);
    }
  }

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0.01 : 0.3, ease: [0, 0, 0.2, 1] } },
  };

  const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } },
  };

  return (
    <div className="flex flex-1 flex-col gap-16">
      <motion.section
        initial="hidden"
        animate="show"
        variants={stagger}
        className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center"
      >
        <motion.h1
          variants={fadeUp}
          className="max-w-xl font-heading text-3xl font-semibold tracking-tight text-ink md:text-4xl"
        >
          You don&apos;t need a name to be heard here.
        </motion.h1>
        <motion.p variants={fadeUp} className="max-w-lg text-base leading-relaxed text-ink-secondary">
          Sahay is a private, anonymous space for men navigating abuse, legal distress, or
          mental health challenges in India. No sign-up, no real name, no judgment — just a
          place to start.
        </motion.p>

        <motion.div variants={stagger} className="mt-2 grid w-full gap-3 sm:grid-cols-3">
          <TrustPoint variants={fadeUp} icon={<Lock className="h-4 w-4" strokeWidth={1.75} />} label="Anonymous by default" />
          <TrustPoint variants={fadeUp} icon={<ShieldCheck className="h-4 w-4" strokeWidth={1.75} />} label="Encrypted, private journal" />
          <TrustPoint variants={fadeUp} icon={<BookOpen className="h-4 w-4" strokeWidth={1.75} />} label="Plain-language legal info" />
        </motion.div>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="show"
        variants={fadeUp}
        transition={{ delay: reduceMotion ? 0 : 0.15 }}
        className="mx-auto w-full max-w-2xl"
      >
        <Card className="flex flex-col gap-4">
          <CardHeader>
            <CardTitle>What&apos;s on your mind?</CardTitle>
            <CardDescription>Start typing, or pick something close to what brought you here.</CardDescription>
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
            <p className="text-xs text-ink-muted">Nothing here requires your name, phone number, or email.</p>
            <Button variant="primary" disabled={message.trim().length === 0 || starting} onClick={startTalking}>
              {starting ? "Starting…" : "Start talking"}
            </Button>
          </div>
        </Card>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="mx-auto w-full max-w-4xl"
      >
        <motion.div variants={fadeUp} className="mx-auto mb-8 max-w-lg text-center">
          <h2 className="font-heading text-2xl font-semibold text-ink">How Sahay works</h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Four quiet tools, used at your own pace — nothing here pushes you faster than you want to go.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {HOW_IT_WORKS.map(({ icon: Icon, title, description }) => (
            <motion.div key={title} variants={fadeUp}>
              <Card className="h-full">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-primary-50 text-primary-700">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="mt-1">{description}</CardDescription>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="mx-auto mb-8 flex w-full max-w-xl flex-col items-center gap-4 rounded-card-lg border border-border bg-surface px-8 py-10 text-center shadow-1"
      >
        <h2 className="font-heading text-xl font-semibold text-ink">Whenever you&apos;re ready</h2>
        <p className="max-w-md text-sm leading-relaxed text-ink-secondary">
          There&apos;s no account to set up and nothing to lose by trying. Say as much or as little
          as you want — you can stop, delete, or come back anonymously any time.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            document.querySelector("textarea")?.focus();
            document.querySelector("textarea")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
          }}
        >
          Start talking
        </Button>
      </motion.section>
    </div>
  );
}

function TrustPoint({
  icon,
  label,
  variants,
}: {
  icon: React.ReactNode;
  label: string;
  variants?: Variants;
}) {
  return (
    <motion.div
      variants={variants}
      className="flex items-center justify-center gap-2 rounded-card border border-border bg-surface px-4 py-3 text-sm text-ink-secondary shadow-1"
    >
      <span className="text-primary-600">{icon}</span>
      {label}
    </motion.div>
  );
}
