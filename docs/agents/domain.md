# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This is a single-context repo: one `GLOSSARY.md` and one `docs/adr/` at the root of sas-meta. They cover the app repos checked out underneath sas-meta as well. Both are written in Norwegian bokmål.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-spleis-lagrer-bare-id-for-rettighetskategori.md
│   └── 0002-alle-vilkarsgrunnlag-far-rettighetskategori-id.md
├── docs/specs/
├── docs/tickets/
└── <app-repo>/          ← each app repo checked out here
```

## Use the glossary's vocabulary

When your output names a domain concept (in a ticket title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Strider mot ADR 0004 (saksbildet deles opp per begrep), men verdt å ta opp igjen fordi …_
