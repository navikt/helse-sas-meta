---
name: after-grilling
description: Closing checkpoint for a grilling session. Asks whether the plan needs new or changed varsler to the saksbehandler or changes to melding om vedtak, and settles the details so they reach the spec and tickets. Use when the grilling frontier is empty, or when a plan touches varsler, varseltekster or melding om vedtak.
---

# Varsler og melding om vedtak

Run this when the grilling frontier is empty, before asking the user to confirm shared understanding. Talk to the user in Norwegian bokmål and use the `grilling` round format.

Text that the saksbehandler or the sykmeldte reads is easy to forget until right before production, and it often needs a fagspesialist or a jurist to write or approve it. This checkpoint makes it part of the plan.

## 1. Opening round

Ask both questions in one round, each with your recommendation based on the design tree so far:

1. **Varsler**: Does the plan need new varsler to the saksbehandler, or changes to the varseltekst, explanation or handling of existing ones?
2. **Melding om vedtak**: Does the plan change what the sykmeldte (or arbeidsgiver) is told in melding om vedtak: new reasoning, new or changed information, new cases?

## 2. Follow-up rounds

For every "ja", add the follow-ups below as new branches in the design tree and keep working rounds until they are settled. Look up facts yourself (existing varselkoder in Spleis and Spesialist, the varseldefinisjon in Spesialist, which app builds melding om vedtak and from which data) instead of asking the user.

**Varsler**, per varsel:

- Which varselkode: new, or an existing one that changes? Which app raises it?
- When is it raised, and when does it disappear or count as handled?
- The varseltekst, and the explanation and handling the saksbehandler sees: who writes them, and who approves them?
- What must the saksbehandler do: assess and approve it, or is it information only? Does it block a vedtak?

**Melding om vedtak**, per change:

- In which cases does the sykmeldte see the change, and what does it say?
- Which data does the text need, and does the app building the message get it today?
- Which hjemmel or reasoning must be stated?
- Who writes the text, and who approves it (fagspesialist, jurist)?

Done when every "ja" has a settled answer to every follow-up, or an open question with a named owner. When nobody in the group can write or approve a text, that becomes such an open question.

## 3. Record the result

Write the summary in the conversation, so `to-spec` carries it into the spec:

```
**Varsler:** <varselkode – hva, når, tekst, hvem skriver og godkjenner>, or "Ingen endringer"
**Melding om vedtak:** <endring – når, hva, data, hvem skriver og godkjenner>, or "Ingen endringer"
```

"Ingen endringer" is a valid result: it records that the question was asked.
