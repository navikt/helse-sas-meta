# Instruksjoner for sas-meta

## Logging

Når du skriver, endrer eller gjennomgår kode som bruker `sykepenger-libs/logging`, les og følg [skillen for sykepenger-logging](.github/skills/sykepenger-logging/SKILL.md).

## Språk i domenedokumentasjon

Skriv `GLOSSARY.md`, ADR-er i `docs/adr/`, specer i `docs/specs/` og tickets i `docs/tickets/` (`trello.json`) på norsk bokmål. Følg klarspråk-prinsippene.

## Skills fra mattpocock/skills

Disse skillene er hentet fra [mattpocock/skills](https://github.com/mattpocock/skills) og er i bruk i sas-meta. De startes eksplisitt av brukeren:

- [grill-with-docs](.github/skills/grill-with-docs/SKILL.md): grundig utspørring av en plan eller et design som samtidig oppdaterer `GLOSSARY.md` og ADR-er. Bruker [grilling](.github/skills/grilling/SKILL.md) og [domain-modeling](.github/skills/domain-modeling/SKILL.md).
- [to-spec](.github/skills/to-spec/SKILL.md): gjør samtalen om til en spec. Specen skrives som Markdown-fil i [`docs/specs/`](docs/specs/) i sas-meta.
- [to-tickets](.github/skills/to-tickets/SKILL.md): deler en plan, en spec eller samtalen opp i vertikale tickets med avhengigheter. Hver ticket skrives som et Trello-kort i [`docs/tickets/<feature>/trello.json`](docs/tickets/) i sas-meta, med en felles label for featuren. Det lages ingen Markdown-filer for tickets.

## Tickets til Trello

Vi har ikke Trello-MCP ennå. Tickets havner derfor i Trello i to steg: to-tickets skriver `docs/tickets/<feature>/trello.json`, og så kjører du `node .bin/trello/push-tickets.mjs` fra roten av sas-meta. Skriptet lar deg velge feature og hvilke kort som skal opprettes, legger dem i lista «Klar til spill», lager labelen hvis den mangler, legger akseptansekriteriene i en sjekkliste og lenker til lappene som blokkerer under «Blokkeres av i Trello». Det leser `TRELLO_API_KEY`, `TRELLO_TOKEN`, `TRELLO_BOARD_ID` og eventuelt `TRELLO_LIST_NAME` (for en annen liste) fra `.env` ved siden av skriptet. Fila skal ikke sjekkes inn. Bruk `--dry-run` for å se hva som blir opprettet. Skriptet bruker bare Node sitt standardbibliotek. Agenter skal ikke dytte til Trello selv.
