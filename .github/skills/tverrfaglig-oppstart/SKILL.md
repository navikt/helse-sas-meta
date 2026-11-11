---
name: tverrfaglig-oppstart
description: Opening checkpoint for a grilling session. Registers the participants from docs/agents/team.json and has the group consider whether it is cross-disciplinary enough for the topic. Use at the start of /grill-with-docs, or when the user asks who should be involved.
---

# Tverrfaglig oppstart

Run this before the first grilling round. Talk to the user in Norwegian bokmål.

## 1. Register the participants

Read `docs/agents/team.json` (format in `docs/agents/team.md`) and ask who is taking part in this session with the `ask_user` tool, in one form:

- a multi-select array field with every person as an option: `items.anyOf` with `const` set to the GitHub username (or the name when it is `null`) and `title` set to `navn (@github)`
- a free-text field for people outside the list

Without the `ask_user` tool, show the people as a numbered list and let the user answer with numbers, names or usernames.

For someone outside the list, ask for name, GitHub username and email, then offer to add them to `team.json`.

Done when every participant has a name and a GitHub username, or an explicit "ukjent".

## 2. Consider whether the group is cross-disciplinary enough

Ask one question in the `grilling` format: is this group cross-disciplinary enough for the topic? Give your recommendation based on what the session is about.

Done when the user has answered. A "nei" that the group still wants to go ahead with is a valid answer: note what is missing and who should be involved.

## 3. Record the result

Write a short summary in the conversation:

```
**Deltakere:** Navn (@github), Navn (@github)
**Tverrfaglighet:** Vurdert som tilstrekkelig, or Vurdert som mangelfull: <hva som mangler, hvem som bør involveres>
```

This summary is the source for the rest of the session: authors of ADRs (see `domain-modeling`), and `Deltakere` and open questions in the spec and tickets (see `to-spec` and `to-tickets`). Update it if someone joins or leaves during the session.
