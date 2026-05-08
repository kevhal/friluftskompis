# Friluftskompis — repo memory

## Project overview

Next.js 16 App Router with TypeScript, Tailwind CSS v4, and pnpm. Norwegian-language outdoor trip planning app.

## Architecture

- `app/` — App Router pages and API routes
- `app/components/ui/` — shared UI components (Button, Badge, InputField, etc.) with barrel export via `index.ts`
- `app/components/` — feature components (WeatherWidget, etc.)
- `lib/` — utility modules (yr.ts for weather)
- `skills/` — code-review skill and profile

## Page pattern

New pages follow the discover/omrader pattern:

1. **Server component** at `app/<route>/page.tsx` — contains nav, header, footer, and metadata export
2. **Client component** at `app/<route>/components/<Name>Client.tsx` — interactive logic with `"use client"`
3. Nav: logo linking to `/`, plus links to Hjem, Områder, and the current page (underlined)
4. Header: badge pill + h1 + subtitle paragraph
5. Footer: `© {new Date().getFullYear()} Friluftskompis`

## Color palette

- Background: `#f5f0eb` (warm beige)
- Primary/dark green: `#2d4a2d`
- Hover green: `#3d6b3d`
- Text dark: `#1a2e1a`
- Text muted: `#4a6741`, `#4a5e3a`, `#5a6e50`
- Badge/accent bg: `#d4e8c2`
- Card bg: `#f8fbf5`
- Card border: `#e0e8d8`
- Footer bg: `#1a2e1a`, footer text: `#6a8a5a`

## Existing routes

- `/` — landing page with hero and feature cards
- `/omrader` — area listing (GraphQL → ut.no), with `/omrader/[id]`
- `/discover` — search with weather widget
- `/start` — onboarding/task visualizer
- `/kart` — map page
- `/pakkeliste` — AI packing list
- `/design-system` — component showcase

## Code review

After every code change, run the code-review skill against the modified file(s) before considering the task done. Use the findings to verify the change didn't introduce new issues and that existing ones were correctly resolved.

If the review surfaces any findings, apply fixes for all Critical and Major issues immediately, then re-run the skill to confirm they are resolved. Repeat this loop until the review comes back clean or only Minor/Suggestion-level findings remain.

The skill lives at `skills/code-review/SKILL.md` and maintains a review profile at `skills/code-review/review-profile.json` that accumulates team preferences over time.

## Lint

After every code change, run `pnpm lint` before considering the task done. Fix all errors before moving on. Warnings can be left if they are not actionable.

## Navigation

Always use `<Link />` from `next/link` for internal navigation — never use plain `<a>` elements for internal routes. See: https://nextjs.org/docs/messages/no-html-link-for-pages
