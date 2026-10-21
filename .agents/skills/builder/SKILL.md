---
name: builder
description: Turn an idea, design or description into working changes on this site. Gathers what it needs, writes a reviewable build plan, delegates the build to the builder agent, then checks the result before reporting. Use when asked to build or add a page, section, component or interaction, even if described only in words.
---

# Builder

Plan, build and check. This skill orchestrates; the `builder` agent writes the code from an approved
plan, and you verify it. The plan is the worker's whole brief.

## Phase 0: What

Ask for everything still unknown in **one** message:

1. **Inputs:** links or files to read (Figma, screenshots, notes, a shaping doc or breadboard).
2. **Outcome:** what a visitor sees and does, as acceptance items you can check in a browser.
3. **Must haves, out of scope, open decisions** the user already knows.

When non-interactive, infer each answer and list every assumption at the top of the plan.

## Phase 0.5: Branch

On `main`, run `project-start` first and continue only after it returns a feature branch. On any other
feature branch, reuse it. Stop on a dirty `main` or an ambiguous base.

## Phase 1: Read the inputs

Read every input fully. A design or board is read, not copied: pull out requirements, content, states and
open questions. If an input cannot be read, say so in the plan; do not guess its content.

## Phase 2: Plan, then approval

Write `<date>/plans/<date>-<slug>-build.md` (see `AGENTS.md`, "Plans and other artifacts") with:

- **Goal** and **Acceptance items**: numbered, each observable (what to do, what you should see, at which
  width or theme when it matters).
- **Where:** every path the build may write, including test files. Add `pnpm-lock.yaml` only if the plan
  lists a dependency.
- **Content and behavior:** copy, states, interactions, the existing components and tokens to reuse.
- **Out of scope**, **Open decisions** (each with a default), **Assumptions**.
- **Checks:** `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm check`, plus the browser walk-through.

Post a short chat summary with the path. Apply corrections to the file, show what changed, and do not
build until the user approves (unless they said to skip approval).

## Phase 3: Build

Delegate to the `builder` agent with the plan path. The plan must be self-contained. When the runtime
cannot start a subagent, build it yourself from the same plan. Use one builder per plan; do not split one
plan across builders (use `delegate` for genuinely independent plans).

## Phase 4: Review before reporting

Check the result yourself; do not forward the builder's success claim.

1. Inspect the diff: only the Where paths changed, nothing added outside the plan.
2. Run `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm check`.
3. Walk through every acceptance item in a real browser, at 1440px and 390px wide and in both themes
   when the item touches layout or colour. Use the project's available browser driver.
4. Documentation sync: if a documented behavior, command or content field changed, update `README.md` or
   `AGENTS.md` in the same change.

Send the builder one concrete fix list, re-check, and stop after two rounds; report what remains.

## Phase 5: Report

The plan path, what was built and left out, assumptions, each acceptance item with its observed result,
commands run with results, and anything not verified.
