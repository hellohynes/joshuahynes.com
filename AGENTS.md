# joshuahynes.com

Joshua Hynes's portfolio: React 19, Vite, Tailwind v4, TypeScript, Vitest. `README.md` documents the
content model, routes, deploys and the home drawing. Read it before changing behavior.

## Commands

| Task | Command |
| --- | --- |
| Dev server | `pnpm dev` |
| Lint | `pnpm lint` |
| Unit tests | `pnpm test` |
| Build (typecheck, then Vite) | `pnpm build` |
| Content check | `pnpm check` |
| Agent tooling parity check | `pnpm check:agents` |

Use pnpm (`packageManager` pins the version) and Node from `.nvmrc`. Never npm or yarn.

## Rules

- Never edit on `main`. Work on `feat/`, `fix/`, `chore/` or `docs/` branches.
- Commit, push and open PRs only when asked. Preserve unrelated changes in the working tree.
- Commit messages, PR titles and branch names follow Conventional Commits: `type: description` for the
  first two (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`;
  optional `(scope)` and `!`), `type/short-kebab-slug` for branches. Check one with
  `pnpm check:format title "<text>"` (or `branch`).
- Commits run Husky hooks: pre-commit checks the branch name, runs `lint-staged` (Oxlint on staged
  source), then `pnpm check:agents`; commit-msg checks the message format. Fix a failure; never bypass it
  with `--no-verify`. CI repeats the full gates and checks the PR title and branch name on every PR.
- `vite.config.ts` must keep exactly one line containing `base: `, and no comment may contain that text
  (the deploy workflows rewrite it with `sed`).
- Known working-tree noise, ignored when checking for a clean tree: `backup` (a gitlink with local
  changes) and the untracked `.codegraph/`. Never stage either.
- Site content comes from `src/content/`. Drafts never ship; `pnpm check` fails on `TODO:` placeholders.
- No AI attribution in commit messages, PR titles or PR bodies.
- Every PR body opens with a validated GIF above the Summary (`pr-create` selects it). A PR goes out
  without one only when the user says so.
- Production is `https://www.joshuahynes.com`; PR previews are at `/<PR number>/` on it.
- Writing (replies, code comments, plans, PR bodies) is plain, terse and direct. Keep identifiers, paths
  and commands exact. Read `.agents/skills/writing-help/references/patterns.md` once per session and apply
  it to everything you write. For a whole document or PR body, run `writing-help`. Site copy in
  `src/content/` is the user's own voice: audit it, but edit it only when asked.

## Plans and other artifacts

Plans, shaping docs, breadboards, reviews and reports live outside the repository, never in it, under
`${SESSION_NOTES_ROOT:-$HOME/notes/sessions}/<YYYY-MM-DD>/` in `plans/`, `reviews/` or `reports/`.
Resolve the date with `date +%F`. Resume an existing artifact for the same work instead of creating a
second one.

## Agent tooling

Both Claude and Codex run the same skills and agents.

| Path | Purpose |
| --- | --- |
| `.agents/skills/<skill>/SKILL.md` | Canonical skill. Codex reads it directly. |
| `.claude/skills/<skill>/` | Byte-identical copy of the whole skill folder for Claude, synced by Pilot. Never edit it; edit the canonical files. |
| `.agents/agents/<agent>.md` | Shared agent instructions. |
| `.claude/agents/<agent>.md`, `.codex/agents/<agent>.toml` | Profiles with the same name and sandbox capability. |

Skills: `project-start`, `shaping`, `breadboard`, `design-spec`, `delegate`, `builder`, `pr-prep`,
`pr-create`, `pr-complete`, `writing-help`. Agents: `builder` (writes the paths its plan lists), `reviewer` (read-only).

To add a skill, write `.agents/skills/<skill>/SKILL.md`, confirm Pilot copied it to `.claude/skills/`, and
run `pnpm check:agents`.
