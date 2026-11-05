---
name: to-tickets
description: "Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges, published as GitHub issues in navikt/sas-issues."
disable-model-invocation: true
---

# To Tickets

Break a plan, spec, or conversation into a set of **tickets**: tracer-bullet vertical slices, each declaring the tickets that **block** it.

Tickets are published as GitHub issues in `navikt/sas-issues`, even when the work concerns one of the app repos checked out underneath sas-meta. Read `docs/agents/issue-tracker.md` for the `gh` commands, labels and blocking edges. Always pass `-R navikt/sas-issues`.

Write the tickets in Norwegian bokmål and follow the klarspråk principles (see the `klarsprak` skill). Use the Norwegian headings and labels from the template below. Keep code identifiers, state names and API fields unchanged.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec issue number or URL, or another issue) as an argument, fetch it and read its full body and comments.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Ticket titles and descriptions should use the project's domain glossary vocabulary (`GLOSSARY.md`), and respect ADRs (`docs/adr/`) in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Before slicing, check that every contract between apps the tickets will touch (behov, events, HTTP APIs) is named field by field in the spec. If a field name, type or allowed value is missing, stop and settle it with the user, then add it to the spec. This is the one change to the source spec this skill makes besides the ticket-index link.

Break the work into **tracer bullet** tickets.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

Give each ticket its **blocking edges**: the other tickets that must complete before it can start. A ticket with no blockers can start immediately.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the whole codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as **expand–contract**. First expand: add the new form beside the old so nothing breaks. Then migrate the call sites over in batches sized by blast radius (per package, per directory, per app repo), each batch its own ticket blocked by the expand, keeping CI green batch to batch because the old form still exists. Finally contract: delete the old form once no caller remains, in a ticket blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify ticket; green is promised only there.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each ticket, show:

- **Title**: short descriptive name
- **Blocked by**: which other tickets (if any) must complete first
- **What it delivers**: the end-to-end behaviour this ticket makes work

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct: does each ticket only depend on tickets that genuinely gate it?
- Should any tickets be merged or split further?

Iterate until the user approves the breakdown.

### 5. Publish the tickets to navikt/sas-issues

Create one GitHub issue per ticket in `navikt/sas-issues`, in dependency order (blockers first), so you can reference real issue numbers in the blocking edges. Use the issue template below: one ticket per issue, never a single combined issue.

When the tickets come from a spec, label every issue with:

- `spec-ticket`
- `epic:<spec-slug>`: the spec issue's `epic:` label

Make every ticket a sub-issue of the spec issue (`--parent <spec>`). Create the `epic:<spec-slug>` label first if it doesn't exist (see `docs/agents/issue-tracker.md`). Tickets that don't come from a spec get neither label; if they come from another issue, make them its sub-issues.

Record blocking edges as native issue dependencies (`--blocked-by`), and list them in the body as well.

If tickets for the same epic already exist (`gh issue list -R navikt/sas-issues --label "epic:<spec-slug>" --state all`), read them first. Update existing issues instead of creating duplicates.

Work the **frontier**: any ticket whose blockers are all closed. For a purely linear chain that means top to bottom.

Do NOT close the spec issue or modify it, except for completing contracts in step 3. The sub-issues already list the tickets under the spec. Tell the user the issue numbers and URLs when you're done.

<issue-template>

Title: `<Tittel>`

Body:

**Spec:** the spec issue, for example `#101`. Omit this line when there is no spec.

**Repo:** the app repo(s) in sas-meta the ticket touches, for example `spleis` or `speil`.

**Hva skal lages:** the end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.

**Blokkeres av:** the issues that gate this one, for example `#12, #13`, or "Ingen (kan starte med en gang)".

## Akseptansekriterier

- [ ] Kriterium 1
- [ ] Kriterium 2

</issue-template>

Status is not a line in the body. An open issue without an assignee is `klar`, an assigned open issue is `pågår`, and a closed issue is `ferdig`.

Avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.
