# Digital Sanctuary — Component Specifications

Reference code lives in `/components`. This document covers the full requested catalog, including components specified here but not separately coded because they're thin, standard Radix wrappers (inputs, dialogs, tabs, etc.) — implement those directly against Radix primitives using the tokens in `tokens/`.

---

## Form Controls

**Button** — `components/button.tsx`. Variants: `primary`, `secondary`, `outline`, `ghost`, `link`, `emergency`, `destructive`. Sizes: `sm` (36px) `md` (44px) `lg` (48px) `icon` (44×44px). Minimum tap target 44px on any size used in primary flows, per mobile accessibility guidance. `emergency` and `destructive` are visually distinct from each other — emergency is solid red (urgent positive action), destructive is a quieter bordered red (irreversible negative action) — so they're never confusable at a glance.

**Input** — `radius-input` (12px), `border-default`, 44px height minimum, 16px horizontal padding. States: default, focus (`shadow-focus-ring`), error (`border-error-border` + helper text in `text-error-fg` below the field, never only a red border), disabled (`opacity-disabled`). Label always visible above the field — no placeholder-as-label pattern, which fails accessibility and is easy to mis-tap-empty under stress.

**Textarea** — Same treatment as Input, `rows` driven by context (journal editor defaults to 10 rows). Resize disabled vertically except where explicitly useful (the journal editor's own internal scroll handles overflow instead).

**Dropdown / Select** — Radix `Select` or `DropdownMenu`, `radius-card` (14px) panel, `shadow-3`, 8px internal padding, items 40px tall with 8px horizontal padding and hover state `bg-muted`.

**Combobox** — Radix `Command` pattern (search + list). Same panel treatment as Dropdown; search input is borderless and inherits the panel's padding so it doesn't look like a second nested field.

---

## Surfaces & Content

**Cards** — `components/card.tsx`. Base `Card`, plus the platform-specific compositions: `LegalResourceCard`, `TherapistCard`, `EvidenceUploadCard` (each in their own file). All share `radius-card`, `border-default`, `shadow-1` resting / `shadow-2` hover.

**Alerts** — `components/card.tsx → Alert`. General-purpose system/form feedback (success/warning/info/error). Distinct from `CrisisBanner` — Alert is for things like "Your changes were saved" or "That file type isn't supported," never for safety-critical messaging.

**Badges** — `components/card.tsx → Badge`. Pill-shaped, 6 variants matching semantic colors plus `primary`/`neutral`. Used for specialty tags, status labels, and counts — never as the sole indicator of an error state (always paired with text).

**Timeline / Progress Tracker** — `components/journal-editor.tsx → ProgressTracker`. Vertical step list with three states (`complete`/`current`/`upcoming`). Used for safety plans, legal process walkthroughs, and onboarding. Completed connector lines use `secondary-400`, never the full-saturation `secondary-500`, to stay quiet.

---

## Mental Health & Crisis Components

**Mood Selector** — `components/mood-selector.tsx`. Five-point scale communicated through color intensity on abstract circular shapes, not facial expressions (deliberate choice for this audience — avoids both infantilizing and pathologizing tone).

**Journal Editor** — `components/journal-editor.tsx`. Distraction-free, autosaving, privacy indicator always visible in the header, optional reflective prompt above the text field.

**Evidence Upload Cards** — `components/evidence-upload-card.tsx`. Encrypted-storage badge always visible (not just on first use), supports document/image/audio attachment types, deletion requires the same `destructive` button treatment used elsewhere in the system for consistency.

**Crisis Banner** — `components/crisis-banner.tsx → CrisisBanner`. Persistent, non-modal, non-dismissible on safety-relevant screens (chat, journal). Background uses `primary-50`/`primary-900`, not red — only the single CTA button is `emergency` red. This keeps the banner from itself becoming a source of alarm.

**Escalation Card** — `components/crisis-banner.tsx → EscalationCard`. Appears inline in AI chat when crisis-detection triggers. Three graduated options (call a line / talk to a human / keep talking to the AI) so the user always retains agency over what happens next — never a forced redirect.

**Emergency Action Card** — `components/emergency-action-card.tsx`. Dashboard-level, three concrete actions (call / text-chat / find safe location nearby). Uses `error-bg`/`error-border` as a contained card treatment, not a full-bleed page background, so it reads as "available help" rather than "something is wrong with this page."

---

## AI Chat Experience

**Chat Bubble** — `components/chat-bubble.tsx → ChatBubble`. User turns: solid `primary-500` fill, right-aligned. Plain text turns from the assistant (when an `AIMessageCard` would be overkill, e.g. short acknowledgments) use `bg-muted`, left-aligned.

**AI Message Card** — `components/chat-bubble.tsx → AIMessageCard`. The primary assistant-turn component — see Design System §9 for rationale. Includes follow-up suggestion chips and lightweight feedback controls (copy / thumbs up / thumbs down).

**Typing Indicator** — `components/chat-bubble.tsx → TypingIndicator`. Three softly pulsing dots in a `bg-muted` pill, `aria-label="Companion is typing"` for screen readers, respects reduced-motion (degrades to a static "Typing…" label).

**Suggested Prompts / Conversation Starters** — `components/chat-bubble.tsx → ConversationStarterCard`. 2–4 shown on first load of any new conversation; copy is specific and warm rather than generic ("Ask me anything").

**Quick Actions** — Render as the same chip style as follow-up suggestions (`rounded-full`, `border-default`, `bg-canvas`) but positioned as a row beneath an `AIMessageCard` rather than inside it, so they're visually distinguishable as platform actions (save to journal, find a therapist) versus conversational follow-ups.

---

## Navigation

**Navbar** — 64px height, `bg-surface`, `border-b border-default`, logo + primary nav left, `CrisisBanner`'s compact "Get help now" action always present on the right regardless of scroll position (sticky).

**Sidebar** — Desktop only (≥1024px), 260px fixed width, `bg-surface`, sections separated by 24px vertical rhythm, active item indicated by a `primary-50` background and `primary-700` text (never solid-fill active states, which feel heavier than this product wants).

**Bottom Navigation** — Mobile only (<768px), 5 items max, 64px height, `bg-surface` with `shadow-3` (elevated above content since it floats over scrollable areas), active icon+label in `primary-600`, inactive in `text-ink-muted`.

---

## Overlays

**Dialog (Modal)** — Radix `Dialog`, `radius-card-lg` (16px), `shadow-4`, `max-width` 480px for confirmations / 640px for forms, scrim at `opacity.overlay` (40%) in `neutral-950`. Reserve true modals for actions that must interrupt (destructive confirmations) — most flows in this product should prefer inline cards or drawers over modals, since modal interrupts can feel coercive to someone already in a heightened state.

**Drawer** — Radix `Dialog` with a slide-from-edge variant (Framer Motion), used for mobile navigation and secondary detail views (e.g., expanding a therapist's full profile). `radius-card-lg` on the leading edge only.

**Toast** — Radix `Toast`, bottom-right on desktop / bottom-center on mobile (above bottom nav), `radius-card`, `shadow-3`, auto-dismiss 5s with a pause-on-hover/focus, always include a visible dismiss control — never rely on auto-dismiss alone for anything containing more than a short confirmation.

---

## State Components

**Skeleton Loaders** — `bg-muted` blocks with a slow (1.5s), low-contrast shimmer; respects reduced-motion by falling back to a static `bg-muted` block with no animation. Match the exact dimensions of the content they replace to avoid layout shift.

**Empty States** — Centered icon (Lucide, `text-ink-muted`) + one-line explanation + one primary action. Copy frames emptiness as an invitation ("Start your first journal entry") rather than a deficiency ("No entries yet").

**Error States** — Same layout as empty states but icon uses `text-error-fg` and copy explains what happened in plain terms plus one concrete recovery action ("Try again" / "Refresh the page"). Never blame the user, never use exclamation points.

**Loading States** — Inline contexts use a small spinner (`text-primary-500`, 16–20px) next to the relevant action; full-page loads use skeletons, not spinners, to avoid a jarring "blank then pop" experience.

---

## Variant & Prop Reference (for Figma component variants)

| Component | Variant axis | Values |
|---|---|---|
| Button | `variant` | primary, secondary, outline, ghost, link, emergency, destructive |
| Button | `size` | sm, md, lg, icon |
| Badge | `variant` | neutral, primary, success, warning, info, error |
| Alert | `variant` | success, warning, info, error |
| Card | `state` | resting, hover |
| MoodSelector | `mood` | low, heavy, neutral, steady, good |
| ProgressTracker step | `status` | complete, current, upcoming |
| Toast | `variant` | success, warning, info, error |
