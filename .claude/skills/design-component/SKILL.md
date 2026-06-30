---
name: design-component
description: Build or modify a UI component for Sahay's Next.js app following the Digital Sanctuary design system (tokens, accessibility, crisis/safety component rules). Use when asked to create or update any frontend component, page, or visual element for Sahay.
---

# Design Component (Digital Sanctuary design system)

Before writing new component code, check `design-system/components/` — reuse or extend an
existing primitive (`button.tsx`, `card.tsx`, `chat-bubble.tsx`, `crisis-banner.tsx`,
`emergency-action-card.tsx`, `evidence-upload-card.tsx`, `journal-editor.tsx`,
`legal-resource-card.tsx`, `mood-selector.tsx`) before building something new. Full catalog
and behavior notes: `design-system/docs/COMPONENT-SPECS.md`. Rationale and tone:
`design-system/docs/DESIGN-SYSTEM.md`.

## Hard rules

- **Tokens only.** Reference semantic aliases (`bg-surface`, `text-ink`, `border-border`,
  `bg-canvas`, etc.) from `design-system/tokens/`, never raw hex or arbitrary Tailwind
  color values. Theme switching (light/dark/high-contrast/large-text) must require zero
  component changes — it's attribute-driven (`class="dark"`, `data-contrast="high"`,
  `data-text-size="large"` on `<html>`).
- **The red rule.** `emergency`/destructive-red appears only in the crisis banner, emergency
  action card, and irreversible destructive confirmations. Never for routine validation,
  warnings, or unread badges — use amber (warning) or info blue instead.
- **Spacing scale is strict:** 4/8/12/16/24/32/48/64px only. If a layout seems to need 20px
  or 40px, revisit the composition instead of breaking the scale.
- **Radius:** 12–16px cards, 12px buttons/inputs, full pill on badges/chips. No sharp
  (0–4px) corners.
- **Tap targets:** minimum 44px on any interactive element in a primary flow.
- **Icons:** Lucide only, 1.75px stroke, rounded caps, 20px default. No filled icons, no
  emoji as functional UI (emoji are fine only in user-authored content like journal entries).
- **Motion:** entrance = fade + 4–8px slide, 200–300ms, decelerate easing. Scale stays
  within 0.96–1.0. Always respect `prefers-reduced-motion` — this is non-negotiable for
  this audience (motion sickness/sensory overwhelm are real barriers), not a nice-to-have.
- **Never rely on color alone** to convey state — pair with an icon and/or text label.
- **Crisis/safety components are special-cased, not generic UI:**
  - `CrisisBanner` is persistent, non-modal, non-dismissible on safety-relevant screens
    (chat, journal). Background is `primary-50`/`primary-900`, not red — only its CTA
    button is `emergency` red.
  - `EscalationCard` appears inline in chat (never a modal interrupt) with three graduated,
    user-controlled options (call a line / talk to a human / keep talking to the AI) — never
    a forced redirect.
  - Prefer inline cards/drawers over modal dialogs generally — true modals are reserved for
    actions that must interrupt (destructive confirmations); modal interrupts can feel
    coercive to someone in a heightened state.
- **Copy tone:** plain, warm, adult language. Buttons name the action ("Save entry," not
  "Submit"). Confirmations reuse the same verb ("Entry saved"). No manufactured urgency
  outside the two legitimate emergency contexts. Errors/empty states say what happened and
  what to do next, never apologize performatively, never blame the user, no exclamation
  points on errors.
- **Illustration**, if used: soft abstract shapes, nature motifs, inclusive figures. Never
  crying figures, violence-adjacent imagery, broken-family metaphors, or courtroom drama.

## Steps

1. Check `design-system/preview/style-guide.html` for the visual reference before building
   from scratch.
2. Reuse an existing component or compose from `card.tsx`/`button.tsx` primitives first.
3. Build with Tailwind v4 utilities mapped through `design-system/tokens/tailwind.config.ts`
   — confirm the token exists before inventing a one-off value.
4. Verify keyboard navigation (focus order matches visual order, visible 3px focus ring,
   no keyboard traps) and screen-reader semantics (semantic HTML first; `aria-live="polite"`
   for typing indicators/toasts; `role="region"` + descriptive `aria-label` for crisis
   banner/escalation card).
5. Check contrast against WCAG AA (4.5:1 body, 3:1 large text/UI) — don't substitute
   adjacent token shades without re-checking.
6. Test with `prefers-reduced-motion` on and with `data-contrast="high"` / large-text mode.
