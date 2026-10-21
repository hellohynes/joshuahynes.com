# joshuahynes.com

Joshua Hynes's portfolio. React 19, Vite, Tailwind v4 and TypeScript, with pnpm. It is a static single-page app with real paths:

- `/` home
- `/work` the grid of pieces, newest first (the Work link is hidden from the navigation until `showWork` is set to `true` in `src/content/site.ts`; the page itself still resolves)
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
| `pnpm lint` | Run Oxlint (`.oxlintrc.json`: correctness rules plus the React hooks, React Compiler and Fast Refresh rules). |
| `pnpm check` | Validate the content and fail on any `TODO:` placeholder (see below). |
| `pnpm activity` | Refresh `src/data/activity.ts`, the data behind the home drawing (see below). Needs the `gh` CLI, signed in. |
| `pnpm check:agents` | Verify the Claude and Codex agent tooling match (see Agent tooling). Not part of `pnpm check`. |

## Content model

Everything on the site comes from `src/content/`:

- `types.ts` defines the shape of a piece and of the site details.
- `items.ts` is the list of pieces (`allItems`). It also holds a commented template and a draft example.
- `site.ts` holds your name, role, headline, intro, work history, contact email, the footer stats, and `showWork` (whether the Work link shows in the navigation).

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

A piece with `draft: true` is routed, listed and rendered in development only (`pnpm dev`). Production and PR-preview builds never route or list it, and no HTML is written for it. Drafts are also removed from the built JavaScript at build time. Drafts are exempt from the `TODO:` check, so you can leave placeholders in one while you work.

## The production check

`pnpm check` validates the content (ids, dates, colours, one to three `impact` points) and fails if any published piece, or `src/content/site.ts`, still contains a string starting with `TODO:`. The contact email in `site.ts` is set, so the check passes until a new placeholder is added. The production workflow (`.github/workflows/production.yml`) runs it, so placeholders cannot ship to production. The `deploy.yml` and `pr-preview.yml` workflows do not run it.

## Deploys and base paths

Static hosts serve real files only, so the build writes a copy of the app shell for every route: `work/index.html`, `about/index.html`, `work/<id>/index.html` for each published piece, and `404.html` (see `vite-plugins/route-html.ts`). Unknown paths such as `/work/nope` fall through to the app's Not found view.

Every path honours the Vite `base`. The GitHub workflows in `.github/workflows/` rewrite it before building, with `sed "s|base: .*|base: '<path>',|"` over `vite.config.ts`: `/` for production and `/<PR number>/` for PR previews. So `vite.config.ts` must keep exactly one line containing the text `base: `. Do not write that text anywhere else in the file, including comments.

## The home drawing

The home page draws the last 80 weeks of activity as stacked lines over the whole page, edge to edge and top to bottom (`src/components/ActivityDrawing.tsx`). The lines fade with depth: the newest week is strongest and the oldest a light grey (`src/lib/depth.ts`). The newest week is cobalt and, as it stops at the last recorded day, ends in a dot (a "thumb", the same marker as the hovered day) so the line does not look cut off; hover or tap a line for that week's figures: the week whose line is nearest the pointer is picked (and kept while you move along it), drawn again on top left to right, with a dot on the hovered day. It draws in once when first on screen, each line crossing left to right in 0.7s and starting 15ms after the one behind it (oldest first, about 1.9s in all), and appears without the draw-in under reduced motion. The canvas is decorative and hidden from assistive technology. The footer's stats line is not generated from the drawing: it is hand-edited text in `src/content/site.ts` (`stats`), with rounded numbers on purpose so they do not go stale quickly, and are updated by hand when it makes sense.

The data lives in `src/data/activity.ts`, generated by `scripts/update-activity.mjs`. Only aggregate counts are stored: each week's start date, seven daily contribution counts, a pull-request count and a count of documents written. No repository names, titles, file names or lines-changed totals. To refresh it, run `pnpm activity` and commit the changed file. The drawing's hover readout uses this data, so it shows the snapshot and the site does not update itself.

## The changing word

On the home page the headline's second line starts "Building with AI." and, every 5 seconds (`HOLD_MS` in `src/components/RotatingHeadline.tsx`), the first word changes to another verb, printed in with the same block-cursor and spinning-glyph effect as the work page. The verbs are `site.headline.verbs` in `src/content/site.ts` (the first is the word on load). A word comes in at random, never the one before it, and every verb shows once before any repeats; sometimes it prints in another typeface and one of five accent colours (the picking is in `src/lib/verbs.ts`, the print timing in `src/lib/flip.ts`). The headline's height never changes, and a long word in a wide face scales line two down to fit the window. Screen readers get one static sentence, "Design leader. Building with AI.", and never hear the changing word.

A "Pause word changes" button in the footer stops the changes (WCAG 2.2.2) and becomes "Resume word changes". Changes also stop while the tab is hidden. With reduced motion requested the word never changes and the button is not shown.

## Agent tooling

Claude and Codex share the same skills and agents (`AGENTS.md` has the rules and the layout):

- Skills: `project-start`, `shaping`, `breadboard`, `design-spec`, `delegate`, `builder`, `pr-prep`, `pr-create`. Each is written once in `.agents/skills/<skill>/SKILL.md`; Pilot keeps a byte-identical copy in `.claude/skills/`, so edit only `.agents/skills`.
- Agents: `builder` (writes the paths its plan lists) and `reviewer` (read-only). Shared instructions are in `.agents/agents/`, with a Claude profile in `.claude/agents/` and a Codex profile in `.codex/agents/`.
- Plans, shaping docs, breadboards and reports are written outside the repository, under `~/notes/sessions/<date>/` (or `$SESSION_NOTES_ROOT`).
- `pnpm check:agents` fails when a skill copy drifts from its canonical file, or an agent pair differs in name or sandbox capability (a read-only profile must be read-only in both).

## Where the plan and design live

- Design: `~/notes/sessions/2026-10-20/plans/2026-10-20-timeline-canvas-design.md`
- Prototypes: `~/notes/sessions/2026-10-20/shaping/joshuahynes-com-mockups/`
- Implementation plan: `~/notes/sessions/2026-10-21/plans/2026-10-21-update-template.md`

## Planned

Not built yet: the opening transition and directed page sequence, pencil margin notes on work pages, photo and link items, and the typeface and phone polish.

Old: `pnpm contributions` (`scripts/update-contributions.mjs`) and `src/data/contributions.ts` are not used by the site now. They are kept for a later feature.
