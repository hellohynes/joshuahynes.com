---
name: pr-complete
description: Close out a merged pull request safely: verify the merge and the production deploy, return to the base branch, and prune the merged source branch. Use after a PR is merged, or when asked to finish, close out, wrap up or complete a work item.
---

# PR Complete

Close the loop after a PR is merged. Direct invocation authorizes the steps below: switching to the base
branch, fast-forwarding it, and deleting the verified merged source branch locally and on the remote.
`dry-run`, `report-only` or `do not mutate` keeps the run read-only. A failed gate stops every mutation.

## Inputs

A PR number or URL. Default: the PR for the current branch.

## Workflow

1. Resolve the repo slug from `git remote get-url origin`. Find the PR from the argument, else
   `gh pr list --repo "$SLUG" --head "$(git branch --show-current)" --state all --json number,state`.
   The lookup must succeed. These reads work under any `gh` account because the repo is public.
2. Read the PR: `gh pr view "$N" --repo "$SLUG" --json
   title,state,mergedAt,mergeCommit,baseRefName,headRefName,headRefOid,headRepositoryOwner`. Record the
   state, merge time, full merge SHA, base branch, source branch and `HEAD_REF_OID` (the full head SHA).
3. **Merge gate.** Only `MERGED` continues. `OPEN`, `CLOSED` or no PR: stop, change nothing, and say so.
4. **Safety gates, before any mutation.**
   - The tree is clean except the known noise in `AGENTS.md`.
   - `git fetch origin` succeeds.
   - If a local source branch exists, its tip equals `HEAD_REF_OID`. A local tip with commits past it is
     unpublished work: stop and name the commits.
   - The head repository owner equals the repo owner. For a fork, skip remote deletion and say so.
5. **Return to the base.** When the current branch is the source or the base: `git switch "$BASE"`, then
   `git pull --ff-only origin "$BASE"`. A failed fast-forward stops here. When the current branch is
   something else, do not switch; report the skip.
6. **Remote source branch.** `git ls-remote --exit-code --heads origin "refs/heads/$SOURCE"`: exit 2
   means already gone (GitHub may delete on merge), which counts as done. Any other nonzero exit is
   unverified: stop. When it exists and its SHA equals `HEAD_REF_OID`, delete it with
   `git push --force-with-lease="refs/heads/$SOURCE:$HEAD_REF_OID" origin ":refs/heads/$SOURCE"`. A SHA
   mismatch or a rejected lease means the branch advanced: stop, keep the local branch, and never retry
   with a plain delete.
7. **Local source branch.** Only after the remote step succeeded or the branch was proven gone, and never
   while it is checked out: `git update-ref -d "refs/heads/$SOURCE" "$HEAD_REF_OID"` (the expected SHA
   makes it fail if the ref moved), then `git fetch --prune origin`.
8. **Production.** When the base is the default branch and `.github/workflows/production.yml` exists, find
   the run for the merge SHA: `gh run list --repo "$SLUG" --workflow production.yml --json
   databaseId,status,conclusion,headSha`. Report `queued` or `in progress` as such; do not poll. For a
   completed success, request the production URL from `AGENTS.md` and `/about/`, expect 200, and request
   one asset the root page references. A failed run: report its first failing step from
   `gh run view "$ID" --repo "$SLUG"`. The PR's preview folder on `gh-pages` stays; nothing removes it.
9. Classify the result: `complete` (every applicable step succeeded or was not applicable), `stopped` (a
   gate prevented closeout) or `needs decision`.

## Rules

- Never discard uncommitted work, and never delete an unmerged, advanced, unverifiable, base or
  checked-out branch.
- The bundled authorization covers only the base switch and fast-forward and the deletion of the verified
  merged source branch. It does not cover dirty work, unpublished commits or any other branch.
- Report each skipped step with its reason.
- Keep full SHAs from the evidence. Do not abbreviate them in the report.

## Output

The PR number, title, state, merge time and full merge SHA; the base and source branches; each gate result;
the base switch and pull result; the remote and local deletion results; the production run state and the
URL checks; the final branch as its own field; and one concrete next action. When a blocker must clear
first, say `Rerun pr-complete after <condition>`.
