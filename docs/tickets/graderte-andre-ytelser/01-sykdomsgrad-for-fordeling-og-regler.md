# 01: sp-andre-ytelser lagrer sykdomsgraden før fordeling og håndhever reglene

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `sp-andre-ytelser`

**Hva skal lages:** Speil sender `sykdomsgradFørFordeling` på hver dag når saksbehandler fordeler dagen. sp-andre-ytelser avviser fordelinger som bryter reglene i specen, med de nye feilkodene, og lagrer `sykdomsgradFørFordeling` på dagene i hendelsen. `GET` viser feltet på dagene og i historikken. En dag uten ytelser fjerner de graderte andre ytelsene fra dagen.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** ferdig

## Akseptansekriterier

- [x] `POST /api/personer/{personPseudoId}/graderte-andre-ytelser` krever `sykdomsgradFørFordeling` på hver dag.
- [x] Reglene 1–6 i specen gjelder for hver dag. Brudd gir 400 med `GRAD_UTENFOR_GRENSER`, `SUM_ER_IKKE_100`, `ARBEIDSGRAD_OKER` eller `YTELSER_MANGLER_TREKK`. `NEGATIV_GRAD` og `TOTAL_GRAD_OVER_100` er fjernet.
- [x] Validering skjer før versjonssjekken (409 `UTDATERT_TILSTAND`), som før.
- [x] `sykdomsgradFørFordeling` og `fraSykdomsgradFørFordeling` lagres på dagene i hendelsen og vises i `GET`, både på dagene og i hendelsene.
- [x] Eksisterende hendelser uten feltet er slettet med en migrering, etter at det er sjekket at prod ikke har ekte data. Prod har ingen data, fordi Speil ikke kan sende fordelinger i prod ennå.
- [x] OpenAPI-specen er oppdatert, og `OpenApiSpecTest` er grønn.
- [x] Tester: én test per regel med grensene rundt den i `GraderteAndreYtelserValidatorTest`, og lagring, visning og feilkoder i `GraderteAndreYtelserPostApiTest` og `GraderteAndreYtelserApiTest`.

## Merknader fra implementasjonen

- **Rullerende deploy:** Flyway kjører V005 når den første nye poden starter. Gamle pods kan fortsatt lagre hendelser uten `sykdomsgradFørFordeling`, og da kan ikke de nye podene lese strømmen til den personen. Skaler ned eller deploy med `Recreate` når V005 går ut, eller sørg for at ingen fordeler dager under deployen.
- **Speil:** API-et krever nå `sykdomsgradFørFordeling`. En Speil-versjon som ikke sender feltet, får 400. Speil må derfor sende feltet før eller samtidig med at denne endringen går ut. [09: Speil lagrer fordelingene i sp-andre-ytelser med sykdomsgraden før fordeling](09-speil-lagrer-fordelinger-i-sp-andre-ytelser.md) dekker dette.
