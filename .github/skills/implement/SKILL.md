---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Specs are GitHub issues in `navikt/sas-issues` labelled `spec-issue`, with their tickets as sub-issues. Tickets are GitHub issues in `navikt/sas-issues`; see `docs/agents/issue-tracker.md` for the `gh` commands, and always pass `-R navikt/sas-issues`. If the user passes a ticket reference (an issue number, a URL or a title), read the issue together with the spec it links to (its parent `spec-issue`), and state its title before starting. If the reference is ambiguous, ask. Only start a ticket whose blockers are all closed.

Resolve old Markdown spec and ticket paths to their migrated GitHub issues as described in `docs/agents/issue-tracker.md`.

The code itself lives in the app repo(s) checked out underneath sas-meta, named on the ticket's **Repo** line. Each app repo is its own git repository.

Assign the issue to yourself (`--add-assignee @me`) when you start, and tick off the acceptance criteria you've met in the issue body.

Call the Skill tool with "tdd" where possible, at pre-agreed seams.

Compile regularly, run single test classes regularly, and run the full test suite of the affected modules once at the end.

Once done, call the Skill tool with "code-review" to review the work.

Commit your work to the current branch of the app repo.

Then ask the user to confirm that the commits are pushed to `main`, and wait for the answer. The issue stays open until the user confirms. Once confirmed and every criterion is met, comment with a short summary and the commits, then close the issue.
