# 01: sp-andre-ytelser lagrer sykdomsgraden før fordeling og håndhever reglene

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `sp-andre-ytelser`

**Hva skal lages:** Speil sender `sykdomsgradFørFordeling` på hver dag når saksbehandler fordeler dagen. sp-andre-ytelser avviser fordelinger som bryter reglene i specen, med de nye feilkodene, og lagrer `sykdomsgradFørFordeling` på dagene i hendelsen. `GET` viser feltet på dagene og i historikken. En dag uten ytelser fjerner de graderte andre ytelsene fra dagen.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] `POST /api/personer/{personPseudoId}/graderte-andre-ytelser` krever `sykdomsgradFørFordeling` på hver dag.
- [ ] Reglene 1–6 i specen gjelder for hver dag. Brudd gir 400 med `GRAD_UTENFOR_GRENSER`, `SUM_ER_IKKE_100`, `ARBEIDSGRAD_OKER` eller `YTELSER_MANGLER_TREKK`. `NEGATIV_GRAD` og `TOTAL_GRAD_OVER_100` er fjernet.
- [ ] Validering skjer før versjonssjekken (409 `UTDATERT_TILSTAND`), som før.
- [ ] `sykdomsgradFørFordeling` og `fraSykdomsgradFørFordeling` lagres på dagene i hendelsen og vises i `GET`, både på dagene og i hendelsene.
- [ ] Eksisterende hendelser uten feltet er slettet med en migrering, etter at det er sjekket at prod ikke har ekte data.
- [ ] OpenAPI-specen er oppdatert, og `OpenApiSpecTest` er grønn.
- [ ] Tester: én test per regel med grensene rundt den i `GraderteAndreYtelserValidatorTest`, og lagring, visning og feilkoder i `GraderteAndreYtelserPostApiTest` og `GraderteAndreYtelserApiTest`.
