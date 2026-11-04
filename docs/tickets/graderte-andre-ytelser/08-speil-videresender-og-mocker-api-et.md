# 08: Speil videresender og mocker API-et til sp-andre-ytelser

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Hva skal lages:** Speil har en rute som videresender til sp-andre-ytelser i dev, en mock med de samme reglene som sp-andre-ytelser lokalt, og genererte typer og hooks for API-et. Skjemaet tar dem i bruk i [09](09-speil-lagrer-fordelinger-i-sp-andre-ytelser.md).

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] `GET` og `POST` på `/api/andre-ytelser/personer/{personPseudoId}/graderte-andre-ytelser` videresendes til sp-andre-ytelser i dev.
- [ ] Lokalt svarer en mock. Den lagrer fordelinger per yrkesaktivitet med versjon og hendelser, og fyller inn `fra`-feltene, også `fraSykdomsgradFørFordeling`.
- [ ] Mocken håndhever reglene 1–6 i specen med de samme feilkodene. Den svarer 409 `UTDATERT_TILSTAND` ved feil versjon og 400 `MANGLER_ENDRINGER` uten dager.
- [ ] En forespørsel uten reelle endringer gir samme versjon og ingen ny hendelse.
- [ ] `orval.config.ts` har et prosjekt for sp-andre-ytelser, og typer og hooks for `graderte-andre-ytelser` og visningen av saksbehandlerhandlinger er generert fra det.
- [ ] Skriptet `lokal-andre-ytelser` i `package.json` bruker backendnavnet i `backends.ts`. I dag bruker det `andre-ytelser`, mens backenden heter `sp-andre-ytelser`, så `parseLokaleBackends` kaster feil.
- [ ] Tester dekker lagring, `fra`-felter, hver feilkode, 409 og forespørsler uten endring.
