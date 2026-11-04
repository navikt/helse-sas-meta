# 08: Speil videresender og mocker API-et til sp-andre-ytelser

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Brukerhistorier:** 9, 10

**Hva skal lages:** Saksbehandler kan hente og lagre fordelinger av dagen mot sp-andre-ytelser i dev. Lokalt svarer en mock med de samme reglene som sp-andre-ytelser, slik at skjemaet kan testes uten backend.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] `GET` og `POST` på `/api/andre-ytelser/personer/{personPseudoId}/graderte-andre-ytelser` videresendes til sp-andre-ytelser i dev.
- [ ] Lokalt svarer en mock. Den lagrer fordelinger per yrkesaktivitet med versjon og hendelser, og fyller inn `fra`-feltene, også `fraSykdomsgradFørFordeling`.
- [ ] Mocken håndhever reglene 1–6 i specen med de samme feilkodene. Den svarer 409 `UTDATERT_TILSTAND` ved feil versjon og 400 `MANGLER_ENDRINGER` uten dager.
- [ ] En forespørsel uten reelle endringer gir samme versjon og ingen ny hendelse.
- [ ] Tester dekker lagring, `fra`-felter, hver feilkode, 409 og forespørsler uten endring.
