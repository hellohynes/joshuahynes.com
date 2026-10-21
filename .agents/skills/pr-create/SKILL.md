---
name: pr-create
description: Create or update a GitHub pull request for the current branch with a clear title and problem-led body, after pr-prep. Use when asked to open a PR, update a PR description, or publish the branch for review.
---

# PR Create

Open or update the PR only after checking external state. Direct invocation authorizes preparation and
read-only refresh, not publication: confirm before any push or PR mutation.

## Workflow

1. `git status --short`. Any path present, except the known noise in `AGENTS.md`: stop and tell the user
   to commit, then run `pr-prep`, then rerun this. Never stage, commit, stash or rebase here.
2. Resolve the repo slug from `git remote get-url origin`; the repo owner is its first path segment. Pick
   the account for the `gh` calls that write (PR create and edit):
   - Use the active account when `gh api --hostname github.com "repos/$SLUG" --jq .permissions.push`
     prints exactly `true`.
   - Otherwise try the other signed-in github.com accounts from `gh auth status`, the repo owner first.
     For each, set `ACCOUNT_TOKEN="$(gh auth token --hostname github.com --user "$ACCOUNT")"` in that one
     command's shell and require it to succeed and be non-empty (an empty `GH_TOKEN` is ignored, which
     would silently run as the active account). Then run the same `gh api` check with
     `GH_TOKEN="$ACCOUNT_TOKEN"` and stop at the first account that prints exactly `true`.
   - Record the chosen account's login with `gh api --hostname github.com user --jq .login`, run under
     that account's token like any other call.
   - Never export a token, print it or write it down. `gh auth switch` changes the active account for
     every repo and terminal, and the global git config uses `gh` as its credential helper, so a switch
     would redirect your other repos' HTTPS operations.
   - If no signed-in account can push, stop and tell the user to run `gh auth login`; never run
     `gh auth switch` or `gh auth login` yourself.
   - `git push` uses git's credential helper, not `gh`. Read
     `git config --get-all credential.https://github.com.helper` and keep only the values after the last
     empty one (an empty value resets the list). When any of them ends with `gh auth git-credential`, the
     push may run as the active `gh` account: stop if that account cannot push and tell the user. In this
     repo `.git/config` resets the list to `osxkeychain` and the origin URL names `hellohynes`.
3. Resolve `BASE_REF` (`origin/<default branch>`), run `git fetch origin`, capture `BASE_SHA` and
   `HEAD_SHA`. If `git rev-list --count "$BASE_REF"..HEAD` is zero, report nothing to publish and stop.
4. Look up an existing PR: `gh pr list --repo "$SLUG" --head "$BRANCH" --state all --json
   number,state,author,url,title,baseRefName,body`. The command must succeed; a failed lookup is unknown and
   blocks everything. An empty result means none. For an existing PR its live base is authoritative.
5. Read the latest `pr-prep` report for this branch in `<date>/reports/`. Require `Verdict: Ready`, a
   `HEAD_SHA` equal to the current HEAD, and a `BASE_SHA` equal to the refreshed base. Missing, stale or
   mismatched: stop with one action, run `pr-prep` again.
6. **Title:** `type: description` in lowercase conventional form (`feat`, `fix`, `chore`, `docs`,
   `refactor`, `test`), imperative, under about 70 characters, no ticket key. Keep an existing PR's title
   unless asked.
7. **Body:** one `## Summary` that states the problem and who it affects, then the solution, then short
   bullets of concrete changes. Add `## Notes` only for something the reviewer must act on or know, such
   as a setting to change. Remove any empty section entirely. Run `writing-help` in edit mode on the
   drafted title and body, but keep any `What changed` summary out of the body and keep the step 6 title
   format. No AI attribution.
8. **GIF (required):** read `references/gif-selection.md`, select and validate one GIF, and put it first in
   the body, above `## Summary`, as a bare image line with no heading. An existing PR keeps its GIF unless
   the user asks for a replacement: take the leading image line from its current `body` (or a legacy
   `## GIF` section), run the reference's URL check on it, and put it first. If it is absent or fails the
   check, select a new one. With no validated GIF, stop before any push or PR
   mutation, unless the user supplies a URL (it gets the same check) or says to publish without one.
9. Propose the exact `git push -u origin "$BRANCH"` and `gh pr create` (or the edit) with the title and
   body, and wait for explicit confirmation. A changed head, base, title, body or GIF invalidates it.
   When step 2 chose a non-active account, each write command (`gh pr create`, `gh api -X PATCH`) runs as
   `T="$(gh auth token --hostname github.com --user "$ACCOUNT")" && [ -n "$T" ] && GH_TOKEN="$T" gh pr
   create ...`, so a failed or empty token stops the command instead of falling back to the active
   account. Show the user that unexpanded text, never a token value.
   For an edit use `gh api -X PATCH "repos/$SLUG/pulls/$N" -F body=@FILE`, adding `-f title="$TITLE"` only
   when the title changes: `gh pr edit` can fail on a Projects (classic) GraphQL deprecation error. Keep
   FILE in the session scratch or notes folder, never in the repo, so the next clean-tree check passes.
10. After confirmation: push, create or edit, then verify the returned PR's head, base and state. For a
    new PR the preview deploys at `https://www.joshuahynes.com/<PR number>/` once the PR Preview workflow
    passes; report that URL and the workflow state rather than claiming it is live.
11. Update only a PR whose `author.login` from step 4 equals the login recorded in step 2, and check that
    before step 9. For another author's PR, keep the proposed body local.

## Safety

- Only a successful empty lookup proves there is no PR.
- Do not push or create when the tree is dirty, the prep report is missing or stale, the base moved, or
  there is no validated GIF (without the user's explicit waiver).
- Never rebase or merge here; `pr-prep` owns integration.
- Do not push, create or edit without the separate explicit confirmation.
- Never print, echo, export or persist a token, and never change the active `gh` account.

## Output

Create or update mode, the title, the PR URL or the proposed command and body, the GIF URL and its
validation result (or the waiver), the prep report used, the preview URL and workflow state, and anything
left undone.
