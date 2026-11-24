---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Specs are GitHub issues in `navikt/sas-issues` labelled `spec-issue`, with their tickets as sub-issues. Tickets are GitHub issues in `navikt/sas-issues`; see `docs/agents/issue-tracker.md` for the `gh` commands, and always pass `-R navikt/sas-issues`. If the user passes a ticket reference (an issue number, a URL or a title), read the issue together with the spec it links to (its parent `spec-issue`), and state its title before starting. If the reference is ambiguous, ask. Only start a ticket whose blockers are all closed.

Resolve old Markdown spec and ticket paths to their migrated GitHub issues as described in `docs/agents/issue-tracker.md`.

The code itself lives in the app repo(s) checked out underneath sas-meta, named on the ticket's **Repo** line. Each app repo is its own git repository.

Before you start, ask the user who else is working on the issue. Look each person up in `docs/agents/team.json` (see `docs/agents/team.md`). Then assign the issue to the user and to every person who has a GitHub username (`--add-assignee @me,<github>,...`). Everyone named, including people without a username, is a co-author of every commit. Tick off the acceptance criteria you've met in the issue body.

Call the Skill tool with "tdd" where possible, at pre-agreed seams. Propose the seams following `## Tester` in `CODING_STANDARDS.md` (logic on the domain object, the repository against the database, the river at smoke level), and get them confirmed before the first test.

Compile regularly, run single test classes regularly, and run the full test suite of the affected modules once at the end.

Once done, call the Skill tool with "code-review" to review the work. Fix every breach of a documented standard it reports; to leave one in place, ask the user first.

Commit your work to the current branch of the app repo by calling the Skill tool with "gitmoji-commit", with the people from the start as co-authors.

Then ask the user to confirm that the commits are pushed to `main`, and wait for the answer. The issue stays open until the user confirms. Verify the push from the app repo over HTTPS, since the sandbox blocks the SSH remote, `gh api` against app repos and `git cherry`. The folder name can differ from the GitHub repo (`spock` is `navikt/helse-spock`), so take the URL from the remote:

```sh
git fetch -q "$(git remote get-url origin | sed -E 's#^git@[^:]+:#https://github.com/#; s#^ssh://git@[^/]+/#https://github.com/#')" main
git log --oneline --cherry-mark --right-only FETCH_HEAD...<last-sha>
```

`=` marks a commit that is on `main`, also after a rebase. `+` can still be a rebased copy whose surrounding lines changed: find the commit with the same subject in `git log FETCH_HEAD --format='%h %s' -n 50` and compare `git diff -U0 <sha>~ <sha> | grep -v '^@@\|^index '` for both. Identical output means the commit is on `main`. Name the commits by their SHAs on `main`. Once every commit is on `main` and every criterion is met, comment with a short summary and the commits, then close the issue.
