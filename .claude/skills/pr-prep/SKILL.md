---
name: pr-prep
description: Prepare a branch for a pull request with a cold review of the diff, the repo's gates, and a readiness report. Use before opening a PR, after finishing work, or when asked whether a branch is ready.
---

# PR Prep

Review first, then run the gates, so defects found in review are fixed before final validation:
**Preflight, Review, Adjudicate, Resolve, Gates, Report.**

## Modes

- **Author** (default): review the current branch, apply authorized fixes, run gates, write the report.
- **Report-only:** inspect and report; edit, commit and fetch nothing. Use when the user says so.

## 1. Preflight

1. Resolve `BASE_REF` as `origin/<default branch>` (`git symbolic-ref --short refs/remotes/origin/HEAD`,
   else `origin/main`). Run `git fetch origin` unless report-only. Record `BASE_SHA` and `HEAD_SHA`
   (`git rev-parse`) and the branch name.
2. Never prep `main`. Scope is `git diff "$BASE_SHA"...HEAD` plus staged, unstaged and untracked paths.
3. Empty committed and working-tree scope: report `Nothing to review` and stop; write no report.
4. A dirty tree (ignoring the known noise in `AGENTS.md`) is reported, not committed. Commits happen only
   when the user asks.

## 2. Review (cold, before gates)

Dispatch the read-only `reviewer` agent with a packet: branch, base and head SHAs, the full diff, the
list of changed files, and `README.md` and `AGENTS.md` for context. The reviewer does not run commands;
you give it the output. Triggered lenses to add to the packet:

- Always: correctness, regressions, error and empty states.
- Changed `src/` UI or CSS: accessibility (keyboard, focus, contrast, reduced motion), responsive widths,
  both themes.
- Changed `vite.config.ts`, `.github/`, `vite-plugins/`: the single `base: ` line rule and deploy paths.
- Changed `src/content/`, `src/data/`, `scripts/`: privacy (aggregate counts only), `TODO:` placeholders.
- Changed `.agents/`, `.claude/`, `.codex/`: skill and agent consistency (copies identical, profiles
  match, every named command and path real).
- Changed behavior or commands: documentation sync.

If no isolated reviewer exists, run the same lenses yourself in sequence and record
`degraded - not cold/independent`. Docs-only diffs get a lightweight pass.

## 3. Adjudicate

Normalize and deduplicate findings. Confirmed in-scope findings default to **Accept**; suspected ones
default to **Verify** (check against the code). **Dispute** needs counter-evidence. **Defer** needs a
reason, the residual impact, and a follow-up. Record each disposition with its evidence.

## 4. Resolve

In author mode, fix only safe, in-scope defects; ask before changing behavior, architecture or scope.
After any edit, capture the new `HEAD_SHA`/tree state and rerun the reviewer on the changed files. Gates
cannot start until every finding is Resolved, Disputed or Deferred.

## 5. Gates

Run, from the repo root: `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm check`. Docs-only changes run
`pnpm lint` and `pnpm check`. Whenever `.agents/`, `.claude/` or `.codex/` changed, also run
`pnpm check:agents`, docs-only or not. A gate that changes files invalidates the review and returns to step 4.
Stop on any failure; report it with its output. Never claim a gate passed that you did not run.

## 6. Report

Write `<date>/reports/<date>-<branch-slug>-pr-prep.md` (see `AGENTS.md`, "Plans and other artifacts").
Contents: branch, `BASE_REF`, `BASE_SHA`, final `HEAD_SHA`, changed files, reviewer isolation, finding
ledger, gate commands with results, deviations, and exactly one standalone line:

- `Verdict: Ready`
- `Verdict: Needs fixes`
- `Verdict: Needs decision`

`pr-create` reads this report, so the SHAs must be the ones the gates ran against.
