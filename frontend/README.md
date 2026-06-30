# Sahay — web

Next.js (App Router) client, wired to the [Digital Sanctuary design system](../../design-system)
(`tailwind.config.ts` + `src/app/globals.css` consume `design-system/tokens/` directly;
`src/components/` mirrors `design-system/components/`).

See the repo root [`README.md`](../../README.md) and [`CLAUDE.md`](../../CLAUDE.md) for
project-wide context, and [`design-component`](../../.claude/skills/design-component) in
`.claude/skills/` before adding or changing UI.

```sh
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```
