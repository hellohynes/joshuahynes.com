# joshuahynes.com

Joshua Hynes's portfolio. React 19, Vite, Tailwind v4 and TypeScript, with pnpm. It is a static single-page app with real paths:

- `/` home
- `/work` the grid of pieces, newest first
- `/work/<id>` one piece
- `/about`

Node 24 and `pnpm@10.34.6` (see `.nvmrc` and `package.json`).

## Commands

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Dev server. Draft pieces are visible here. |
| `pnpm build` | Typecheck, then build to `dist/`. |
| `pnpm preview` | Serve `dist/` locally. |
| `pnpm test` | Run the unit tests (Vitest). |
| `pnpm lint` | Run ESLint. |
| `pnpm check` | Validate the content and fail on any `TODO:` placeholder (see below). |

## Content model

Everything on the site comes from `src/content/`:

- `types.ts` defines the shape of a piece and of the site details.
- `items.ts` is the list of pieces (`allItems`). It also holds a commented template and a draft example.
- `site.ts` holds your name, role, headline, intro, work history and contact email.

Pieces are sorted newest first by `date`. A year-only date (`2025`) sorts after every dated month of that year. Pieces with the same date keep their order in `items.ts`.

## How to add a piece

1. Open `src/content/items.ts`. Copy the commented template block (or the draft `example-piece`) and paste it into `allItems`.
2. Fill in the fields. Required unless marked optional:
   - `kind`: always `'work'`.
   - `id`: the URL slug, in lowercase kebab-case. The page lives at `/work/<id>`.
   - `date`: `'YYYY'` or `'YYYY-MM'`, for example `'2026-10'`.
   - `draft`: optional. `true` keeps the piece out of production (see Drafts). Delete the line to publish.
   - `title`: the name shown on the grid and the page.
   - `color`: a flat `#rrggbb` background for the piece. Text on it switches automatically between the page ink and paper, whichever reads better.
   - `headline`: one sentence on what the piece did.
   - `impact`: one to three short results, one per entry.
   - `role`: your role on the piece.
   - `period`: free text timeframe, for example `'Jan to Oct 2026'`.
   - `team`: optional. Who you worked with.
   - `summary`: one or two sentences for the page intro.
   - `story`: optional. Paragraphs for the case study.
   - `credits`: optional. A list of `{ role, name }`.
   - `media`: optional. The cover: `{ kind: 'image' | 'video', src, alt }`. A video may also set `poster`.
   - `gallery`: optional. More media, same shape as `media`.
3. Put images and video in `public/work/<id>/`.
4. Reference them by root path, for example `src: '/work/<id>/cover.jpg'`. Paths that start with `/` are resolved against the deploy base path automatically, so the same value works in production and in PR previews.
5. Run `pnpm dev` and open `/work/<id>`.
6. When it is ready, remove `draft: true` and run `pnpm check`.

## Drafts

A piece with `draft: true` is routed, listed and rendered in development only (`pnpm dev`). Production and PR-preview builds never route or list it, and no HTML is written for it. Drafts are exempt from the `TODO:` check, so you can leave placeholders in one while you work.

## The production check

`pnpm check` validates the content (ids, dates, colours, one to three `impact` points) and fails if any published piece, or `src/content/site.ts`, still contains a string starting with `TODO:`. That includes the contact email in `site.ts`, which is a placeholder until you set it, so the check fails until then. The production deploy runs it, so placeholders cannot ship.

## Deploys and base paths

Static hosts serve real files only, so the build writes a copy of the app shell for every route: `work/index.html`, `about/index.html`, `work/<id>/index.html` for each published piece, and `404.html` (see `vite-plugins/route-html.ts`). Unknown paths such as `/work/nope` fall through to the app's Not found view.

Every path honours the Vite `base`. The GitHub workflows in `.github/workflows/` rewrite it before building, with `sed "s|base: .*|base: '<path>',|"` over `vite.config.ts`: `/` for production and `/<PR number>/` for PR previews. So `vite.config.ts` must keep exactly one line containing the text `base: `. Do not write that text anywhere else in the file, including comments.

## Where the plan and design live

- Design: `~/notes/sessions/2026-10-20/plans/2026-10-20-timeline-canvas-design.md`
- Prototypes: `~/notes/sessions/2026-10-20/shaping/joshuahynes-com-mockups/`
- Implementation plan: `~/notes/sessions/2026-10-21/plans/2026-10-21-update-template.md`

## Planned

Not built yet: the opening transition and directed page sequence, the home line drawing, pencil margin notes on work pages, photo and link items, and the typeface and phone polish.

Old: `pnpm contributions` (`scripts/update-contributions.mjs`) and `src/data/contributions.ts` are not used by the site now. They are kept for a later feature.
