# 21: Speil viser sykepengegrunnlaget og sender skjønnsfastsettelser til sp-sykepengegrunnlag bak toggle

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `speil`

**Hva skal lages:** Med togglen på henter Speil sykepengegrunnlaget, avviksvurderingen og skjønnsfastsettelsen fra sp-sykepengegrunnlag, og skjemaet for skjønnsfastsettelse sender dit. Totrinnsvurderingen viser skjønnsfastsettelsen fra tjenesten.

**Blokkeres av:** [13: Visning av sykepengegrunnlaget for Speil](13-visning-av-sykepengegrunnlaget.md), [Inntekt 14: Nye verdier i `HandlingType` i Spesialist](../avklare-inntekt/14-nye-handlingstyper-i-spesialist.md)

**Status:** klar

## Akseptansekriterier

- [ ] Speil har en API-klient for sp-sykepengegrunnlag, generert fra OpenAPI.
- [ ] Visningen bruker `sykepengegrunnlagId` fra spleis-api og viser grunnlaget, avviket, sammenligningsgrunnlaget, skjønnsfastsettelsen og historikken.
- [ ] Skjemaet for skjønnsfastsettelse sender til sp-sykepengegrunnlag med togglen på.
- [ ] Saksbehandlerhandlinger med `SKJØNNSFASTSATT_SYKEPENGEGRUNNLAG` hentes fra visningsendepunktet i sp-sykepengegrunnlag.
- [ ] Perioder i `AvventerSykepengegrunnlag` vises som «Forbereder godkjenning».
- [ ] Med togglen av fungerer Speil som i dag.
- [ ] Komponent- og Playwright-tester dekker visningen og skjemaet med togglen av og på.
