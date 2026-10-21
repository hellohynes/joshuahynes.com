---
name: project-start
description: Start a work item on this site by checking the working tree, updating main, and creating a feature branch. Use when beginning a feature, fix, chore or docs change. Only sets up the branch; never builds anything.
---

# Project Start

Set up the branch for a piece of work, report it, and return control. Direct invocation means the user
wants to start, so apply after the safety checks pass. Use dry-run only when the user asks to preview.

## Inputs

A short work description, for example `add a contact section` or `fix hover on the drawing`. Empty
input: ask for the description.

## Workflow

1. **Pre-flight.** Run `git branch --show-current` and `git status --short`. Resolve `BASE_BRANCH` from
   `git symbolic-ref --short refs/remotes/origin/HEAD` (strip the remote prefix); use `main` if that is
   unset. Stop and ask when the tree is dirty (unless the user accepts carrying the changes) or the
   current branch is not `BASE_BRANCH` (unless the user says to branch from it).
2. **Name the branch.** `{type}/{slug}`: `feat` by default; `fix`, `chore` or `docs` when the input
   clearly says so. The slug is lowercase kebab-case, 3 to 5 meaningful words. Example:
   `feat/contact-section`.
3. **Apply** (skip in dry-run, where you only report the commands):
   - `git fetch origin`, then `git pull --ff-only origin "$BASE_BRANCH"` when on the base. A fetch or
     fast-forward failure stops before creating the branch. Never fall back to merge, rebase or reset.
   - `git switch -c {branch}`.
4. **Recommend one next step.** The solution is unclear: `shaping`. Substantial and clear: `design-spec`.
   An approved build plan exists: `builder`. Otherwise start the work. Never invoke it from here.

## Report

Current branch and cleanliness, resolved base and refresh result, the created or proposed branch,
apply or dry-run, and the one next step.
