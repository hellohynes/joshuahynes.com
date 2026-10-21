---
name: delegate
description: Split a large job into independent tasks, run them on lighter workers in parallel, then integrate and verify. Use when work divides into pieces that do not write the same files, such as a change across many files, several independent investigations, or a plan with separable parts.
---

# Delegate

The main session plans, splits and checks. Workers do bounded pieces. Use the fewest workers that help:
each re-reads context, so delegation pays off only when pieces are truly independent or would flood the
main session.

## 1. Decide

Delegate only when all hold: each piece can run once its inputs are ready; no two pieces write the same
file; each can be described completely up front (goal, files, constraints, checks). Keep the work in the
main session when it is small, tightly coupled, or needs a decision from the user partway through.

## 2. Split

| Situation | Pattern |
| --- | --- |
| Independent pieces | Run them all at once |
| Later steps need earlier output | Pipeline: start each stage when its inputs are ready |
| The same change across many files | One worker per batch of files |
| Cheap checks gate costly analysis | Run the checks first; stop if they fail |

Per task, write: the goal, the files it owns, the files it must not touch, the rules to follow, the checks
to run, and what to report. Workers do not ask the user questions, commit, push, or change anything
outside their files. Worker count: 1 for up to about 10 small tasks, 2 to 3 for larger batches, 4 at most.

## 3. Choose the worker

- A lighter model for well-specified work: implementing a planned piece, applying a pattern across files,
  searching, writing tests to a spec.
- Keep judgment-heavy pieces (design decisions, work too costly to describe) in the main session.
- Use a named profile when one fits: `builder` for an approved build plan, `reviewer` for a read-only
  review pass.

## 4. Run

- **Claude:** start independent workers in one message with the Agent tool, either a named profile or
  `general-purpose` with a lighter model such as `sonnet`. Run in the background when the main session has
  other work.
- **Codex:** use the subagents and profiles the runtime exposes (`.codex/agents/`) when the user allows
  parallel agents; otherwise run the tasks one after another from the same descriptions.
- Never pass a model name from one runtime to the other.
- Track the tasks so a long run survives interruption, and report progress on long runs.

## 5. Integrate and verify

1. Read each report and inspect the actual changes; "done" is not evidence.
2. Resolve overlaps in the main session.
3. Run `pnpm lint`, `pnpm test`, `pnpm build` and `pnpm check` once over the combined result.
4. Redo any task that failed or came back incomplete in the main session.

## Rules

- The user keeps the gates: plan approval, review findings, commits, PRs.
- Do not repeat a finished worker's exploration. Do not run several workers on one question.
- If the user says stop, stop every worker this session started.

## Report

The tasks, the worker or profile for each (or `main session`), what each changed, the combined checks
and results, and anything unfinished.
