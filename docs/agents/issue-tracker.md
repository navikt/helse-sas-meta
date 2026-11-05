# Issue tracker: GitHub (navikt/sas-issues)

Specs and tickets live as GitHub issues in **`navikt/sas-issues`**, the sole source of truth for their content, status and dependencies. Specs are never committed to sas-meta. Use the `gh` CLI for all operations, and always pass `-R navikt/sas-issues`: `gh` would otherwise infer `navikt/helse-sas-meta` from `git remote`. The repo is checked out at `./sas-issues` so the agent sandbox allows writes to it, but you don't need to `cd` there: `-R` is enough from any directory.

If the cplt sandbox blocks a write to `navikt/sas-issues` ("outside the startup repo"), stop and tell the user to run `cplt config set --local sandbox.repo_dirs sas-issues` outside the sandbox from `helse-sas-meta`, then restart cplt. See "Tickets i sas-issues og cplt-sandkassen" in `README.md`. Don't work around the block.

Write titles and bodies in Norwegian bokmål and follow the klarspråk principles.

## Specs and epics

A spec is one issue with two labels:

- **`spec-issue`**: marks the issue as a spec.
- **`epic:<spec-slug>`**: the epic. `<spec-slug>` is a short kebab-case name for the feature, for example `epic:avklare-inntekt`.

Every ticket created from the spec is a **sub-issue** of the spec issue and has two labels:

- **`spec-ticket`**: marks the issue as a ticket from a spec.
- **`epic:<spec-slug>`**: the same epic label as the spec.

The spec issue stays open until every ticket is closed.

Create the epic label before the spec issue if it doesn't exist:

```sh
gh label create "epic:<spec-slug>" -R navikt/sas-issues --color 5319e7 --description "<Tittel på specen>"
```

- List the specs: `gh issue list -R navikt/sas-issues --label spec-issue --state all`.
- List the tickets in an epic: `gh issue list -R navikt/sas-issues --label spec-ticket --label "epic:<spec-slug>" --state all`, or the spec issue's sub-issues on the web.
- Link to the epic on the web: `https://github.com/navikt/sas-issues/issues?q=label%3Aepic%3A<spec-slug>`.

Issues that don't come from a spec get none of these labels.

## Ticket status

- **klar**: open, no assignee, and no open blockers.
- **pågår**: open and assigned (`gh issue edit <n> -R navikt/sas-issues --add-assignee @me`).
- **ferdig**: closed.

## Conventions

- **Create a spec**: `gh issue create -R navikt/sas-issues --title "..." --body-file - --label spec-issue --label "epic:<spec-slug>"`. Use a heredoc for the body.
- **Create a ticket**: `gh issue create -R navikt/sas-issues --title "..." --body-file - --label spec-ticket --label "epic:<spec-slug>" --parent <spec>`.
- **Read an issue**: `gh issue view <number> -R navikt/sas-issues --json number,title,body,labels,assignees,state,comments`.
- **List issues**: `gh issue list -R navikt/sas-issues --state open --json number,title,labels,assignees` with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: `gh issue create -R navikt/sas-issues --parent <parent> ...`, or `gh issue edit <parent> -R navikt/sas-issues --add-sub-issue <child>`.
- **Blocking**: GitHub's native issue dependencies. Add an edge with `gh issue create -R navikt/sas-issues --blocked-by <n>,<n> ...` or `gh issue edit <child> -R navikt/sas-issues --add-blocked-by <blocker>`. A ticket is unblocked when every blocker is closed.
- **Count open blockers**: `gh api repos/navikt/sas-issues/issues/<n> --jq .issue_dependencies_summary.blocked_by` (open blockers only; 0 means startable).
- **Comment on an issue**: `gh issue comment <number> -R navikt/sas-issues --body "..."`
- **Apply / remove labels**: `gh issue edit <number> -R navikt/sas-issues --add-label "..."` / `--remove-label "..."`
- **Tick off acceptance criteria**: edit the body (`gh issue view <n> -R navikt/sas-issues --json body -q .body`, change `- [ ]` to `- [x]`, then `gh issue edit <n> -R navikt/sas-issues --body-file -`).
- **Close**: post the explanation with `gh issue comment <number> -R navikt/sas-issues --body "..."`, then `gh issue close <number> -R navikt/sas-issues`.

Link to a spec issue from a ticket with `#<n>`. Link from a spec issue to ADRs and `GLOSSARY.md` in sas-meta with full URLs, for example `https://github.com/navikt/helse-sas-meta/blob/main/docs/adr/<adr>.md`. Relative links don't work across repos.

## Migrated specs and tickets

All former Markdown specs and tickets have been migrated to GitHub, and `docs/specs/` and `docs/tickets/` have been removed. A spec `docs/specs/<spec-slug>.md` is now the issue labelled `spec-issue` and `epic:<spec-slug>`; its body starts with a note naming the old path. Resolve an old ticket path through Git history to find its title, then locate the issue by epic label and title. Read and update the current issue in GitHub.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

## When a skill says "publish to the issue tracker"

Create a GitHub issue in `navikt/sas-issues`. A spec gets `spec-issue` and `epic:<spec-slug>`. A ticket from a spec gets `spec-ticket` and `epic:<spec-slug>`, and becomes a sub-issue of the spec.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above, together with its parent `spec-issue`. The user normally passes the issue number (`#12`), the URL or the title. Resolve old file paths as in **Migrated tickets** above.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue in `navikt/sas-issues` with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create -R navikt/sas-issues --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: see **Blocking** under Conventions.
- **Frontier query**: list the map's open sub-issues, drop any with an open blocker or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> -R navikt/sas-issues --add-assignee @me`, the session's first write.
- **Resolve**: `gh issue comment <n> -R navikt/sas-issues --body "<answer>"`, then `gh issue close <n> -R navikt/sas-issues`, then append a context pointer (gist + link) to the map's Decisions-so-far.
