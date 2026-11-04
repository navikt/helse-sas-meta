# Instruksjoner for sas-meta

Alle repoer som nevnes i specer, tickets og ADR-er, er sjekket ut i `./<repo>` under sas-meta. Les dem der.

## Logging

Når du skriver, endrer eller gjennomgår kode som bruker `sykepenger-libs/logging`, les og følg [skillen for sykepenger-logging](.github/skills/sykepenger-logging/SKILL.md).

## Språk i domenedokumentasjon

Skriv `GLOSSARY.md`, ADR-er i `docs/adr/`, specer i `docs/specs/` og tickets i `navikt/sas-issues` på norsk bokmål. Følg klarspråk-prinsippene.

## Commits

Følg [gitmoji-commit](.github/skills/gitmoji-commit/SKILL.md) når du skriver commit-meldinger, committer eller squasher commits.

## Skills fra mattpocock/skills

Disse skillene er hentet fra [mattpocock/skills](https://github.com/mattpocock/skills) og er i bruk i sas-meta. De startes eksplisitt av brukeren:

- [grill-with-docs](.github/skills/grill-with-docs/SKILL.md): grundig utspørring av en plan eller et design som samtidig oppdaterer `GLOSSARY.md` og ADR-er. Bruker [grilling](.github/skills/grilling/SKILL.md) og [domain-modeling](.github/skills/domain-modeling/SKILL.md).
- [to-spec](.github/skills/to-spec/SKILL.md): gjør samtalen om til en spec. Specen skrives som Markdown-fil i [`docs/specs/`](docs/specs/) i sas-meta.
- [to-tickets](.github/skills/to-tickets/SKILL.md): deler en plan, en spec eller samtalen opp i vertikale tickets med avhengigheter. Hver ticket blir et eget issue i [`navikt/sas-issues`](https://github.com/navikt/sas-issues/issues) med labelene `spec-ticket` og `epic:<spec>`.
- [implement](.github/skills/implement/SKILL.md): implementerer en spec fra `docs/specs/` eller en ticket fra `navikt/sas-issues` i app-repoet ticketen gjelder. Bruker [tdd](.github/skills/tdd/SKILL.md) og avslutter med [code-review](.github/skills/code-review/SKILL.md).
- [code-review](.github/skills/code-review/SKILL.md): gjennomgår endringene i et app-repo siden et fast punkt, både mot kodestandardene og mot specen eller ticketen. Kan også startes av agenten når du ber om en gjennomgang.
- [retro](.github/skills/retro/SKILL.md): retrospektiv etter en økt. Foreslår forbedringer i agentens miljø, for eksempel navigasjon, automatiske sjekker og kodestandarder. Bruker [writing-for-agents](.github/skills/writing-for-agents/SKILL.md).

[tdd](.github/skills/tdd/SKILL.md), [codebase-design](.github/skills/codebase-design/SKILL.md) og [writing-for-agents](.github/skills/writing-for-agents/SKILL.md) er også hentet derfra. De brukes av skillene over, og agenten kan starte dem selv.

## Agent skills

### Issue tracker

Tickets er GitHub-issues i `navikt/sas-issues`. Tickets fra en spec har labelene `spec-ticket` og `epic:<spec-slug>`. Specene ligger fortsatt i `docs/specs/`, og eldre tickets i `docs/tickets/`. Se `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: én `GLOSSARY.md` og `docs/adr/` på rota av sas-meta. Se `docs/agents/domain.md`.
