# Digital Sanctuary — Design System

A design system for a web platform offering emotional support, mental wellness resources, legal information, and community for men navigating abuse, family conflict, trauma, or life crises.

---

## 1. Brand Foundations

**Philosophy.** Digital Sanctuary. Every screen should make someone feel safe, heard, respected, and capable of taking a next step — without ever feeling clinical, political, sensational, or aggressive.

**Personality.** Calm, compassionate, trustworthy, professional, modern, privacy-first, non-judgmental, human-centered.

**Reference points.** Headspace's warmth, Stripe's clarity and trust, Notion's restraint, Linear's precision. The result sits at the intersection of *warm minimalism* and *healthcare-grade trust* — closer to a well-run clinic's waiting room than a wellness app's onboarding carousel.

**Hard no's.** Masculine-stereotype "alpha" aesthetics, dark gaming-style UI, neon or loud gradients, social-media visual patterns, fear-based imagery, anything that could read as emotionally manipulative (urgency timers, guilt-driven copy, manufactured scarcity).

Every design decision in this system can be checked against one question: *does this make someone in a vulnerable moment feel safer, or does it add friction, noise, or alarm?*

---

## 2. Color System

Tokens live in `tokens/design-tokens.json` and are implemented as CSS variables in `tokens/globals.css`. Components must always reference the semantic aliases (`bg-surface`, `text-ink`, `border-border`, etc.) rather than raw palette values, so theme switching (light/dark/high-contrast) requires zero component changes.

| Role | Token | Hex (light) | Use |
|---|---|---|---|
| Primary interactive | `primary-500` | `#3B5BDB` | Buttons, links, focus rings, active nav |
| Primary anchor | `primary-800` | `#1F3A5F` | Headers, nav bars, dark hero surfaces |
| Secondary | `secondary-500` | `#2F855A` | Progress, completion, growth, success |
| Accent | `amber-500` | `#D69E2E` | Gentle highlights, in-progress states |
| Canvas | `neutral-25` | `#FBFAF8` | Page background |
| Surface | `neutral-0` | `#FFFFFF` | Cards, panels |
| Border | `neutral-200` | `#DCD7D0` | Default dividers/borders |
| Text primary | `neutral-900` | `#1C1A18` | Body copy, headings |
| Emergency | `emergency` | `#C53030` | **Reserved exclusively** for the crisis banner, emergency action card, and destructive-action confirmation |

**The red rule.** Red appears in exactly two contexts: true emergency/crisis actions, and irreversible destructive confirmations (e.g., permanently deleting a journal entry). It is never used for routine form validation, generic warnings, or "you have unread messages" badges — those use amber (warning) or info blue instead. This is the single most important constraint in the palette: red carries real weight precisely because it's used so rarely.

**Contrast.** All text/background pairings in the token set meet WCAG AA (4.5:1 for body text, 3:1 for large text/UI components) in both light and dark themes. `primary-700` on `neutral-0`, `neutral-900` on `neutral-25`, and all `semantic.*.fg` on `semantic.*.bg` pairs have been selected specifically to clear this bar — do not substitute adjacent shades without re-checking contrast.

**Dark theme.** Not an inverted light theme — surfaces step up from `neutral-950` (canvas) to `neutral-800` (raised cards) so elevation stays legible without relying on shadows, which read poorly on dark backgrounds. Semantic colors shift to desaturated, deepened variants rather than simply dimming the light-theme hues.

---

## 3. Typography

- **Body:** Inter — chosen for neutrality and exceptional screen legibility at small sizes.
- **Headings:** Inter Tight (Geist as an approved substitute) — slightly tighter tracking than the body face gives headings quiet structure without shouting. Heading weight is capped at 600 (semibold); the system never uses 700+/black weights, which read as aggressive in this context.
- **Monospace:** JetBrains Mono — used narrowly, for things like case reference numbers or document IDs, not as a stylistic device.

Type scale, line-heights, and tracking are defined in `tokens/design-tokens.json → typography.scale`. Body text never drops below 16px for primary reading content (journal entries, AI responses, legal guidance) — this is a deliberate accessibility and trust decision, not just a stylistic one.

---

## 4. Layout & Spacing

**Grid.** 12 columns / 24px gutter on desktop (≥1280px), 8 columns / 24px gutter on tablet (≥768px), 4 columns / 16px gutter on mobile (base). Max content width 1280px, centered, with generous outer margins — the system leans toward *more* whitespace than a typical SaaS product, since density reads as pressure in this context.

**Spacing scale.** A strict 4/8/12/16/24/32/48/64px scale. No off-scale spacing values should appear in shipped UI; if a layout seems to need 20px or 40px, that's a signal to revisit the composition rather than break the scale.

**Radius.** 12–16px on cards, 12px on buttons and inputs, full pill radius on badges/chips. Corners are never sharp (0–4px) — softness here is doing real emotional work, not just decorative.

---

## 5. Elevation

Four shadow levels, all intentionally subtle (max blur 40px, max opacity 12%). No neumorphism, no hard drop shadows, no colored shadows.

- **Level 1** — resting cards
- **Level 2** — hovered/raised cards
- **Level 3** — popovers, dropdowns, tooltips
- **Level 4** — dialogs, drawers, the topmost layer in the app

---

## 6. Iconography & Illustration

**Icons.** Lucide, exclusively. 1.75px stroke weight, rounded line caps, 20px default size. No filled icons, no duotone, no emoji used as functional UI (emoji are acceptable only in optional user-authored content like journal entries).

**Illustration.** Soft abstract shapes, calm geometric compositions, nature motifs (gentle gradients evoking horizon lines, plant forms, light), inclusive figure illustration where people are shown. Strictly avoid: crying figures, violence or violence-adjacent imagery, broken-family visual metaphors, courtroom drama, anything that could function as a trigger rather than a comfort. When in doubt, illustration should look more like a sleep app's onboarding art than a PSA campaign.

---

## 7. Motion

Motion is supportive, not decorative. Default entrance pattern: fade + 4–8px slide, 200–300ms, decelerate easing. Scale transforms stay within a 0.96–1.0 range — nothing should feel like it's "popping." Page transitions are gentle crossfades, never slides that mimic native-app navigation stacks (which can feel busy at this density of emotionally loaded content).

`prefers-reduced-motion` is respected globally (see `globals.css`) — all animation durations collapse to near-zero and motion-based reveals degrade to instant opacity changes. This is non-negotiable for this product: motion sickness and sensory overwhelm are real barriers for users in acute distress.

---

## 8. Accessibility

Target: WCAG 2.1 AA across the product, with several AAA-level commitments where it matters most for this audience.

- **Color contrast** — verified at the token level (see §2); never rely on color alone to convey state (icons + text labels always accompany semantic color).
- **Keyboard navigation** — every interactive element is reachable and operable via keyboard; focus order follows visual order; no keyboard traps in dialogs/drawers.
- **Visible focus** — a consistent 3px focus ring (`shadow-focus-ring` token) on every focusable element; never `outline: none` without a replacement.
- **Screen readers** — semantic HTML first, ARIA only to fill genuine gaps; live regions (`aria-live="polite"`) for AI typing indicators and toast notifications; the crisis banner and escalation card use `role="region"` with a descriptive `aria-label` so they're discoverable, not just visually present.
- **Dark mode** — full parity with light mode, not an afterthought filter.
- **High contrast mode** — a `data-contrast="high"` attribute strips shadows and boosts border/text contrast further; available as a one-tap accessibility toggle, not buried in settings.
- **Large text mode** — a `data-text-size="large"` attribute scales the root font size; all spacing in components should be expressed in `rem`, not fixed `px`, so layouts reflow correctly rather than just enlarging text in place.
- **Reduced motion** — see §7.

---

## 9. AI Chat Experience

The AI companion is the emotional center of the product, so it gets its own design language layer rather than reusing a generic chat-app pattern:

- **Identity, not avatar.** A small soft "spark" mark (see `AIMessageCard`) instead of a robot/face avatar — present but unobtrusive.
- **AIMessageCard**, not a plain bubble, for assistant turns — gives room for follow-up suggestion chips, copy/feedback controls, and (when needed) an inline `EscalationCard`.
- **TypingIndicator** uses three soft pulsing dots, never a "thinking" spinner or progress bar, which can read as cold/technical.
- **ConversationStarterCard** components on first load replace an empty input field with a handful of warm, specific entry points ("I had a hard conversation with my kids today," not "Ask me anything").
- **Crisis detection.** When the system detects crisis-relevant language, it surfaces an `EscalationCard` inline in the conversation — never a modal interrupt — offering a real phone line, a human handoff, and the option to keep talking with the AI. The persistent `CrisisBanner` remains available at all times regardless of what the AI detects, so help is never solely dependent on automated detection working correctly.
- **Quick actions** (e.g., "Save this to my journal," "Find a therapist who specializes in this") appear as secondary chips beneath relevant AI responses, not as a persistent toolbar.

---

## 10. Content & Tone

Three things the interface should always communicate, in this order: *you are safe* → *you are not alone* → *here's a concrete next step.*

- Write in plain, warm, adult language — never therapy-jargon, never baby talk.
- Never imply guilt or innocence in any legal content; guidance is informational and neutral ("Here's how restraining orders generally work in your state"), never advisory or predictive ("You'll win this case").
- Errors and empty states explain what happened and what to do next, in the product's calm voice — they don't apologize performatively or use alarming language.
- Buttons name the action, not the mechanism: "Save entry," not "Submit." Confirmation messages reuse the same verb: "Entry saved."
- Avoid manufactured urgency anywhere outside the two legitimate emergency contexts (crisis banner, emergency action card).

---

## 11. Technical Implementation

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4, tokens wired through CSS variables (`tokens/globals.css` + `tokens/tailwind.config.ts`) so theme switches are attribute-driven, not class-driven
- **Components:** shadcn/ui conventions (cva variants, Radix primitives, `cn()` merge utility) — see `/components`
- **Primitives:** Radix UI under the hood for Dialog, Drawer, Dropdown, Tabs, Accordion, Toast (see Component Specs for behavior notes)
- **Motion:** Framer Motion for orchestrated transitions; CSS transitions for simple hover/focus states
- **Icons:** lucide-react

Theme switching is done by toggling `class="dark"` and `data-contrast="high"` / `data-text-size="large"` on the root `<html>` element — no component re-renders or prop drilling required.

---

## 12. Figma Handoff Notes

For teams building the Figma library in parallel with code:

- Create a single **Tokens** page mirroring `design-tokens.json` 1:1 as Figma Variables (color, spacing, radius, typography, effects/shadows), with light/dark/high-contrast as variable modes.
- Build components as **variants**, matching the variant props documented in `COMPONENT-SPECS.md` (e.g., Button: `variant` × `size` × `state`), not as disconnected one-off frames.
- Auto-layout every component with the spacing scale from §4 — no manual pixel-pushing.
- Name layers and components to match the code (`AIMessageCard`, `CrisisBanner`, `EmergencyActionCard`, etc.) so design and engineering stay referentially identical.
- Maintain a dedicated **Crisis & Safety** page in the library (crisis banner, escalation card, emergency action card, all empty/error states related to safety flows) reviewed separately from general UI, given how much weight these specific screens carry.
