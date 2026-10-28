---
name: to-tickets
description: "Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges, written as Trello cards in docs/tickets/<feature>/trello.json in the sas-meta repo."
disable-model-invocation: true
---

# To Tickets

Break a plan, spec, or conversation into a set of **tickets**: tracer-bullet vertical slices, each declaring the tickets that **block** it.

Tickets are written as Trello cards in `docs/tickets/<feature>/trello.json` at the root of the sas-meta repo (helse-sas-meta), even when the work concerns one of the app repos checked out underneath it. Do not publish the tickets to an issue tracker or to Trello yourself; the user pushes `trello.json` to Trello with a script (see step 6).

Write the tickets in Norwegian bokmål and follow the klarspråk principles (see the `klarsprak` skill). Use the Norwegian field names from the JSON format below. Keep code identifiers, state names and API fields unchanged.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path in `docs/specs/`, an issue number or URL) as an argument, fetch it and read its full body and comments.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Ticket titles and descriptions should use the project's domain glossary vocabulary (`GLOSSARY.md`), and respect ADRs (`docs/adr/`) in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

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

### 5. Write the tickets to trello.json

We have no Trello MCP yet, so tickets reach Trello through a JSON file and a script. Write all tickets for a feature to `docs/tickets/<feature-slug>/trello.json` in the sas-meta repo, one card per ticket, numbered from `01` in dependency order (blockers first). Use kebab-case for `<feature-slug>`. If the tickets come from a spec in `docs/specs/`, use the same slug as the spec file. Create the directory if it doesn't exist. Don't write Markdown files for the tickets.

If `trello.json` already exists for the feature, read it first. Update existing cards instead of creating duplicates, and continue the numbering for new ones.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

The fields on each card follow Trello's REST API (`POST /1/cards`, `POST /1/cards/{id}/checklists`, `POST /1/checklists/{id}/checkItems`):

```json
{
  "feature": "<feature-slug>",
  "label": { "name": "<Feature name, e.g. Avklare rettighetskategori>", "color": "purple" },
  "cards": [
    {
      "id": "01",
      "name": "01: <Tittel>",
      "desc": "**Spec:** [<Spec title>](https://github.com/navikt/helse-sas-meta/blob/main/docs/specs/<feature-slug>.md)\n\n**Repo:** `spleis`\n\n**Hva skal lages:** ...",
      "status": "klar",
      "blokkeresAv": [],
      "checklists": [
        { "name": "Akseptansekriterier", "checkItems": [{ "name": "Kriterium 1", "checked": false }] }
      ]
    }
  ]
}
```

- `label` is the tag every card in the feature gets. Choose the name when you write the tickets. The script creates the label on the board if it doesn't exist. `color` is one of Trello's label colours: `green`, `yellow`, `orange`, `red`, `purple`, `blue`, `sky`, `lime`, `pink` or `black`.
- `id` is the two-digit ticket number, and `name` is `<NN>: <Tittel>`.
- `desc` is Markdown with these fields, separated by blank lines:
  - `**Spec:**` an absolute link to the source spec, `https://github.com/navikt/helse-sas-meta/blob/main/docs/specs/<feature-slug>.md`, if there is one. Otherwise omit it. Trello doesn't know the repo, so never use relative links.
  - `**Fase:**` the phase, if the spec has phases. Otherwise omit it.
  - `**Repo:**` the app repo(s) in sas-meta the ticket touches, for example `spleis` or `speil`.
  - `**Hva skal lages:**` the end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.

  Don't put blocking edges or links to files in the repo (other than the spec) in `desc`; the script adds the blocking links.
- `status` is `klar` (ready to be picked up), `pågår` (in progress) or `ferdig` (done). New tickets start as `klar`. The script doesn't select `ferdig` tickets by default.
- `blokkeresAv` lists the `id`s of the blocking tickets. The script adds a «Blokkeres av i Trello» section to the card with links to the blocking cards, both those it creates and those already on the board.
- `checklists` holds one checklist, `Akseptansekriterier`, with one check item per criterion and `checked: false`.

Avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.

Do NOT modify the source spec. Tell the user the path of the file when you're done.

### 6. Push to Trello

Don't push to Trello yourself. Tell the user to run `node .bin/trello/push-tickets.mjs` from the sas-meta root. The script lets them pick a feature and which cards to create, and puts them in the list «Klar til spill». It reads the Trello credentials from `.bin/trello/.env`. `--dry-run` shows what would be created without writing to Trello.
