# 15: Skjønnsfastsettelse og overstyring i sp-sykepengegrunnlag

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** Saksbehandler kan skjønnsfastsette sykepengegrunnlaget og overstyre inntekt og arbeidsforhold i sp-sykepengegrunnlag. Hver endring gir en ny avgjørelse som bygger på den forrige. Tjenesten sender `endret_sykepengegrunnlag` til Spleis og `saksbehandlerhandling` til Spesialist med en outbox.

**Blokkeres av:** [14: REST-API for å lese sykepengegrunnlaget](14-rest-api-for-a-lese.md)

**Status:** klar

## Akseptansekriterier

- [ ] `POST .../skjonnsfastsettelse`, `POST .../inntekt` og `POST .../arbeidsforhold` tar imot feltene i specen, med OBO-token og populasjonstilgangskontroll.
- [ ] Hver POST lager en ny avgjørelse med kilde `saksbehandler`, `byggerPå` satt til ID-en i stien, saksbehandlerens ident, begrunnelsene og lovhjemmelen. Svaret er `id`.
- [ ] Er ID-en i stien ikke den gjeldende for skjæringstidspunktet, svarer tjenesten med 409.
- [ ] En skjønnsfastsettelse gir `fastsatt` `ETTER_SKJØNN` og `inntektskilde` `SKJØNN`, uten ny avviksvurdering.
- [ ] En overstyring av inntekt eller arbeidsforhold gir en ny avviksvurdering mot det samme sammenligningsgrunnlaget og fjerner en tidligere skjønnsfastsettelse.
- [ ] En overstyrt inntekt har `inntektskilde` `SAKSBEHANDLER`. Et deaktivert arbeidsforhold har `deaktivert` `true` og telles ikke med.
- [ ] Et behov `Sykepengegrunnlag` med samme input som avgjørelsen det bygges på, gir den gjeldende ID-en. En avgjørelse fra saksbehandler blir ikke erstattet av en automatisk for samme input.
- [ ] Outboxen sender `endret_sykepengegrunnlag` med `fødselsnummer`, `skjæringstidspunkt`, `sykepengegrunnlagId` og `manuellVurdering` `true`.
- [ ] Outboxen sender `saksbehandlerhandling` med feltene i specen, `kreverTotrinnsvurdering` `true` og `handlingType` `SKJØNNSFASTSATT_SYKEPENGEGRUNNLAG`, `OVERSTYRT_INNTEKT` eller `OVERSTYRT_ARBEIDSFORHOLD`.
- [ ] Integrasjonstester dekker de tre endepunktene, 409, idempotens etter overstyring, at skjønn fjernes ved overstyring og meldingene fra outboxen.
