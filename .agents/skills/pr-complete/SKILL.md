---
name: pr-complete
description: Close out a merged pull request safely: verify the merge and the production deploy, return to the base branch, and prune the merged source branch. Use after a PR is merged, or when asked to finish, close out, wrap up or complete a work item.
---

# PR Complete

Close the loop after a PR is merged. Direct invocation authorizes the steps below: switching to the base
branch, fast-forwarding it, and deleting the verified merged source branch locally and on the remote.
`dry-run`, `report-only` or `do not mutate` keeps the run read-only. A failed gate stops every mutation.

## Inputs

A PR number or URL. Default: the PR for the current branch. A detached HEAD has no current branch, so it
needs an argument.

## Workflow

1. Resolve the repo slug from `git remote get-url origin`. Find the PR from the argument, else
   `gh pr list --repo "$SLUG" --head "$(git branch --show-current)" --state all --json number,state`.
   The lookup must succeed. More than one PR for the branch: stop and ask for a number. These reads work
   under any `gh` account because the repo is public.
2. Read the PR: `gh pr view "$N" --repo "$SLUG" --json
   title,state,mergedAt,mergeCommit,baseRefName,headRefName,headRefOid,headRepositoryOwner`. Record the
   state, merge time, full merge SHA (`mergeCommit.oid`), `BASE`, `SOURCE` and `HEAD_REF_OID`.
3. **Merge gate.** Only `MERGED` continues. `OPEN`, `CLOSED` or no PR: stop, change nothing, and say so.
4. **Safety gates, all read-only, before any mutation.** Any failure stops the run.
   - The tree is clean except the known noise in `AGENTS.md`, and `git fetch origin` succeeds.
   - `SOURCE` is not `BASE`.
   - `headRepositoryOwner.login` equals the owner in `$SLUG`. For a fork, skip steps 6 and 7 and say so.
   - If a local `refs/heads/$SOURCE` exists, its tip equals `HEAD_REF_OID`. Commits past it are
     unpublished work: stop and name them.
   - `git worktree list --porcelain` shows `refs/heads/$SOURCE` checked out in no other worktree.
   - `git ls-remote --exit-code --heads origin "refs/heads/$SOURCE"`: exit 2 means the branch is already
     gone (GitHub may delete on merge), which counts as done. Exit 0 means it exists: its SHA must equal
     `HEAD_REF_OID`. Any other result is unverified.
5. **Return to the base.** When the current branch is the source or the base: `git switch "$BASE"`, then
   `git pull --ff-only origin "$BASE"`. A failed fast-forward stops here. When the current branch is
   something else, do not switch; report the skip.
6. **Remote source branch**, when step 4 found it. Delete it with
   `git push --force-with-lease="refs/heads/$SOURCE:$HEAD_REF_OID" origin ":refs/heads/$SOURCE"`. Only a
   lease rejection (`stale info` or `rejected`) means the branch advanced: stop, keep the local branch, and
   never retry with a plain delete. Any other failure (auth, protection rule, network) is `stopped`: quote
   the error and skip step 7.
7. **Local source branch.** Only after step 6 succeeded or the remote branch was proven gone. Skip it when
   `git show-ref --verify --quiet "refs/heads/$SOURCE"` fails and report `not present`. Otherwise
   `git update-ref -d "refs/heads/$SOURCE" "$HEAD_REF_OID"` (the expected SHA makes it fail if the ref
   moved), then `git config --remove-section "branch.$SOURCE"` (ignore failure) and
   `git fetch --prune origin`.
8. **Production.** Read the default branch with `gh repo view "$SLUG" --json defaultBranchRef --jq
   .defaultBranchRef.name`. When `BASE` is that branch and `.github/workflows/production.yml` exists, list
   `gh run list --repo "$SLUG" --workflow production.yml --branch "$BASE" --limit 20 --json
   databaseId,status,conclusion,headSha` and find the run whose `headSha` is the merge SHA.
   - No run yet: report `not started yet`, not a failure. `queued` or `in_progress`: report as such; do not
     poll.
   - Success: the run proves the publish step finished. Then request the production URL from `AGENTS.md`
     and `/about/` (expect 200) and one asset the root page references. A 200 shows the site is reachable,
     not that this commit is the one served: Pages can lag the run by a minute. Say so.
   - Failure: report the failing step from `gh run view "$ID" --repo "$SLUG" --verbose`, or the output
     from `--log-failed`.
   - The PR's preview folder on `gh-pages` stays; nothing removes it.
9. Classify the result: `complete` (every applicable step succeeded or was not applicable), `stopped` (a
   gate or a step failure prevented closeout) or `needs decision`.

## Rules

- Never discard uncommitted work, and never delete an unmerged, advanced, unverifiable, base, forked or
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
