---
name: to-spec
description: "Turn the current conversation into a spec and publish it as a spec-issue in navikt/sas-issues: no interview, just synthesis of what you've already discussed."
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a spec. Do NOT interview the user; just synthesize what you already know.

Specs are published as GitHub issues in `navikt/sas-issues`, even when the work concerns one of the app repos checked out underneath sas-meta. The issue is the spec's only copy: do not write it to a file or commit it. Read `docs/agents/issue-tracker.md` for the `gh` commands and labels, and always pass `-R navikt/sas-issues`.

Write the spec in Norwegian bokmål and follow the klarspråk principles (see the `klarsprak` skill). Use the Norwegian headings from the template below. Keep code identifiers, state names and API fields unchanged.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the spec, and respect any ADRs in the area you're touching.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

Check with the user that these seams match their expectations.

3. Pick the **spec slug**: a short kebab-case name for the feature, for example `avklare-inntekt`. It names the epic, so `/to-tickets` and the ticket graph find the spec and its tickets through the label `epic:<spec-slug>`. Check that no spec issue already uses it (`gh issue list -R navikt/sas-issues --label spec-issue --state all`). If a spec for the same feature already exists, update its body instead of creating a new issue.

4. Write the spec using the template below and publish it as one issue in `navikt/sas-issues`. Use the spec's title as the issue title, and label it `spec-issue` and `epic:<spec-slug>`. Create the epic label first if it doesn't exist (see `docs/agents/issue-tracker.md`). Tell the user the issue number and URL when you're done.

<spec-template>

**Deltakere:** the participants from `tverrfaglig-oppstart`, as `Navn (@github)`.

**Tverrfaglighet:** the assessment from `tverrfaglig-oppstart`.

Omit both lines when the conversation registered no participants.

## Problem

The problem that the user is facing, from the user's perspective.

## Løsning

The solution to the problem, from the user's perspective.

## Brukerhistorier

A LONG, numbered list of user stories. Each user story should be in the format of:

1. Som <aktør> vil jeg <funksjon>, slik at <nytte>

<user-story-example>
1. Som saksbehandler vil jeg se skjæringstidspunktet for perioden, slik at jeg vet hvilket sykefraværstilfelle den hører til
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Beslutninger om implementasjon

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Every contract between apps (behov, events, HTTP APIs) is named in full: the message or endpoint name, every input and output field with its exact name and type, and the allowed values. Two apps implemented in separate tickets must be able to agree on the contract by reading only the spec. If the conversation left a field open, list it under `Andre merknader` as an open question.

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.

## Beslutninger om testing

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Varsler og melding om vedtak

The result from `after-grilling`: every new or changed varsel and every change to melding om vedtak, with when it applies, the text or what it must say, and who writes and approves it. Write "Ingen endringer" for a part the conversation settled as unchanged. If the conversation never asked, list it under `Andre merknader` as an open question.

## Utenfor omfang

A description of the things that are out of scope for this spec.

## Andre merknader

Any further notes about the feature. If `tverrfaglig-oppstart` judged the group not cross-disciplinary enough, include what is missing as an open question naming who should be involved.

</spec-template>
