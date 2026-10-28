---
name: to-tickets
description: "Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges, written as one Markdown file per ticket in docs/tickets in the sas-meta repo."
disable-model-invocation: true
---

# To Tickets

Break a plan, spec, or conversation into a set of **tickets**: tracer-bullet vertical slices, each declaring the tickets that **block** it.

Tickets are written as Markdown files in `docs/tickets/` at the root of the sas-meta repo (helse-sas-meta), even when the work concerns one of the app repos checked out underneath it. Do not publish the tickets to an issue tracker.

Write the tickets in Norwegian bokmål and follow the klarspråk principles (see the `klarsprak` skill). Use the Norwegian headings and labels from the template below. Keep code identifiers, state names and API fields unchanged.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path in `docs/specs/`, an issue number or URL) as an argument, fetch it and read its full body and comments.

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

### 5. Write the tickets to docs/tickets

Write one file per ticket under `docs/tickets/<feature-slug>/<NN>-<slug>.md` in the sas-meta repo, numbered from `01` in dependency order (blockers first). Use kebab-case for `<feature-slug>` and `<slug>`. If the tickets come from a spec in `docs/specs/`, use the same slug as the spec file. Create the directories if they don't exist. Use the per-ticket file template below: one ticket per file, never a single combined file.

If tickets for the same feature already exist, read them first. Update existing tickets instead of creating duplicates, and continue the numbering for new ones.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

Also write `docs/tickets/<feature-slug>/index.md`, so the tickets can be navigated on GitHub Pages. It starts with `# Tickets: <feature>`, links to the spec, and has a table with number, linked title, repo and blockers, followed by a Mermaid `flowchart` of the blocking edges. Use relative links to the `.md` files; GitHub Pages turns them into `.html`. Then add a link to `tickets/<feature-slug>/` in `docs/index.html`, in the same section as the spec. Update both when you add or change tickets.

Do NOT modify the source spec, except for adding a link to the ticket index right below its title and completing contracts in step 3. Tell the user the paths of the files when you're done.

<local-ticket-template>

# <NN>: <Tittel>

**Spec:** a relative link to the source spec in `docs/specs/`, if there is one. Otherwise omit this line.

**Repo:** the app repo(s) in sas-meta the ticket touches, for example `spleis` or `speil`.

**Hva skal lages:** the end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.

**Blokkeres av:** relative links to the tickets that gate this one, for example `[01: Tittel](01-slug.md)`, or "Ingen (kan starte med en gang)".

**Status:** klar

## Akseptansekriterier

- [ ] Kriterium 1
- [ ] Kriterium 2

</local-ticket-template>

Valid statuses are `klar` (ready to be picked up), `pågår` (in progress) and `ferdig` (done). New tickets start as `klar`.

Avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.
