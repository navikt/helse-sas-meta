---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Specs live as Markdown files in `docs/specs/` and tickets in `docs/tickets/<feature>/` at the root of the sas-meta repo (helse-sas-meta). They are not in an issue tracker. If the user passes a ticket reference (a path, a ticket number or a title), read it from `docs/tickets/` together with the spec it links to, and state its title before starting. If the reference is ambiguous, ask. Only start a ticket whose blockers have status `ferdig`.

The code itself lives in the app repo(s) checked out underneath sas-meta, named on the ticket's **Repo** line. Each app repo is its own git repository.

Set the ticket's **Status** to `pågår` when you start and `ferdig` when you're done, and tick off the acceptance criteria you've met.

Call the Skill tool with "tdd" where possible, at pre-agreed seams.

Compile regularly, run single test classes regularly, and run the full test suite of the affected modules once at the end.

Once done, call the Skill tool with "code-review" to review the work.

Commit your work to the current branch of the app repo. Commit the ticket status changes in sas-meta separately.
