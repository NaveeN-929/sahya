# Digital Sanctuary — Design System

A complete design system for a web platform offering emotional support, mental wellness resources, legal information, and community for men experiencing abuse, family conflict, trauma, or crisis. Built for Next.js + Tailwind CSS v4 + shadcn/ui + Radix UI + Framer Motion.

## What's in here

```
tokens/
  design-tokens.json     ← single source of truth: color, type, spacing, radius, elevation, motion
  globals.css             ← CSS variables implementing the tokens (light, dark, high-contrast, large-text)
  tailwind.config.ts      ← Tailwind v4 config mapping utilities to the CSS variables

components/
  button.tsx               ghost/outline/primary/secondary/link/emergency/destructive button
  card.tsx                  Card, Badge, Alert primitives
  crisis-banner.tsx         CrisisBanner + EscalationCard
  emergency-action-card.tsx EmergencyActionCard
  mood-selector.tsx         MoodSelector
  chat-bubble.tsx           ChatBubble, TypingIndicator, AIMessageCard, ConversationStarterCard
  legal-resource-card.tsx   LegalResourceCard, TherapistCard
  evidence-upload-card.tsx  EvidenceUploadCard
  journal-editor.tsx        JournalEditor, ProgressTracker
  lib-utils.ts              cn() class-merge helper (place at components/../lib/utils.ts in your repo)

docs/
  DESIGN-SYSTEM.md         brand, color, type, layout, motion, accessibility, AI chat experience, content tone
  COMPONENT-SPECS.md       full component catalog incl. inputs, nav, overlays, and state components

preview/
  style-guide.html         live, interactive visual reference — open directly in a browser
```

## Getting started in a real project

1. Copy `tokens/globals.css` into your app's global stylesheet import and `tokens/tailwind.config.ts` into your project root.
2. Install dependencies: `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `lucide-react`, plus the specific Radix primitives you need (`@radix-ui/react-dialog`, `-select`, `-tabs`, `-accordion`, `-toast`).
3. Move `components/lib-utils.ts` to `lib/utils.ts` so the `@/lib/utils` import path used throughout resolves correctly.
4. Drop the `components/*.tsx` files into your `components/` directory.
5. Theme switching is attribute-driven: toggle `class="dark"`, `data-contrast="high"`, and `data-text-size="large"` on `<html>` — no component changes needed.

## Start here

Open `preview/style-guide.html` for a complete visual walkthrough of the palette, type scale, and every component in both light and dark theme. Read `docs/DESIGN-SYSTEM.md` for the rationale behind the system, and `docs/COMPONENT-SPECS.md` for the full component-by-component specification.
