---
name: design-spec
description: Plan, review, implement and verify substantial work through evidence-backed vertical slices. Use when a feature, bug or cross-cutting change needs a durable plan before implementation; skip it for small direct edits and explanations.
---

# Design Spec

Turn substantial work into one reviewed plan, implement one approved slice at a time, and verify the
outcome. Evidence-driven, not universally test-first.

## States

**Plan**, **Plan review**, **Implement**, **Verify**. Infer the state from the request and the saved
plan, and say which one you are in before acting.

- Plan and Plan review write only the external plan file.
- Implement needs explicit implementation intent, an approved exact plan revision, one eligible slice,
  and a clean non-`main` feature branch. Otherwise stop and route branch setup to `project-start`.
- Verify reads the repo and updates the plan. It creates no branches, commits, PRs or comments.
- A verified spec is not PR readiness. Recommend `pr-prep`; never invoke it or claim its verdict.

## Plan file

`<date>/plans/<date>-<slug>-design-spec.md` (see `AGENTS.md`, "Plans and other artifacts"). Resume a
matching one instead of creating another. Frontmatter: `status` (`draft`, `approved`, `implemented`,
`verified`), `revision`, `content_hash`, `reviewed_hash`, `approved_hash`. The hash is the SHA-256 of the
body below the frontmatter:

```bash
awk 'c>=2{print} /^---$/ && c<2{c++}' PLAN.md | shasum -a 256
```

Sections: Intent; Goal truths (observable, each checkable); Constraints; Non-goals; Assumptions; Risks;
Affected surfaces; Slices; Deviations. Each slice has an id, the behavior it demonstrates, the paths it
may write, dependencies, status, and an **evidence contract**: strategy, independent oracle, the plausible
wrong implementation it must reject, the cheapest sufficient layer (existing test, new unit test, built
output, browser walk-through), the expected command or observation, and residual risk.

## Plan

Inspect the current code, `README.md`, related plans and tests. Fill every section. Keep `status: draft`,
raise `revision` and refresh `content_hash` on material edits. Do not ask for approval before review.

## Plan review

1. Bind a packet to the plan path, the exact `content_hash`, and the relevant sources.
2. Dispatch two fresh `reviewer` runs, one per lens: **outcome and scope** (do the goal truths cover the
   intent, are non-goals respected, are slices vertical) and **mechanism and evidence** (can each oracle
   reject its wrong implementation, are the paths and commands real). If no isolated reviewer exists, apply
   both lenses yourself in sequence and label the review `degraded - not cold/independent`.
3. Group findings as `Blocker`, `Decision`, `Improvement`; show only non-empty groups. Confirmed in-scope
   findings default to accepted; disputing one needs counter-evidence.
4. Revise for accepted findings. A material revision returns the plan to `draft` and invalidates the
   affected lens: rerun it. When both lenses are current and every finding has a disposition, record
   `reviewed_hash`.
5. Ask once for approval of that exact revision. On approval record the user's words, set
   `approved_hash` to the current hash and `status: approved`.

## Implement

Pick exactly one dependency-ready slice. Recheck branch, working tree, status and that `content_hash`
equals `approved_hash`. State the slice and its evidence contract, then implement only its behavior and
paths. Run the declared evidence. Mark the slice done only when the oracle could reject the named wrong
implementation. Record changed paths, commands or observations, result, deviations and residual risk.

## Verify

Reconcile every goal truth, slice, non-goal and deviation against the current repo. `implemented` means
every required slice has usable evidence; `verified` also needs current independent evidence for every goal
truth or an accepted deviation. Otherwise report `blocked` or `needs decision` and leave `status` alone.

## Output

Plan path, state, revision and hash, reviewer isolation, current and next slice, evidence result,
deviations and residual risk, and one next action.
