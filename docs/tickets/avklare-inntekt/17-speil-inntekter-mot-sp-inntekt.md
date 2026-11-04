# 17: Speil viser inntektene og sender endringer til sp-inntekt bak toggle

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 3

**Repo:** `speil`

**Hva skal lages:** Med togglen på henter Speil inntektene fra sp-inntekt, og skjemaene for korrigert inntekt og deaktivering av arbeidsforhold sender til sp-inntekt. Totrinnsvurderingen viser endringene fra sp-inntekt. Refusjonsskjemaet går fortsatt til Spesialist.

**Blokkeres av:** [14: Nye verdier i `HandlingType` i Spesialist](14-nye-handlingstyper-i-spesialist.md), [16: Visning av inntektsavklaringen for Speil](16-visning-av-inntektsavklaringen.md)

**Status:** klar

## Akseptansekriterier

- [ ] Speil har en API-klient for sp-inntekt, generert fra OpenAPI som for sp-vilkarsproving.
- [ ] Inntektsvisningen bruker `inntektsavklaringId` fra spleis-api og viser kilde, månedsinntekt, inntekter per måned og historikk.
- [ ] Skjemaet for korrigert inntekt og skjemaet for deaktivering og aktivering sender til sp-inntekt med togglen på.
- [ ] Saksbehandlerhandlinger med `KORRIGERT_INNTEKT`, `ARBEIDSFORHOLD_DEAKTIVERT` og `ARBEIDSFORHOLD_AKTIVERT` hentes fra visningsendepunktet i sp-inntekt.
- [ ] Perioder i `AvventerInntektsavklaring` vises som «Forbereder godkjenning».
- [ ] Med togglen av fungerer Speil som i dag.
- [ ] Komponent- og Playwright-tester dekker visningen og skjemaene med togglen av og på.
