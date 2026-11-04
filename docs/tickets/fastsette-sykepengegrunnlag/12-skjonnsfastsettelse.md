# 12: Skjønnsfastsettelse i sp-sykepengegrunnlag

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** Saksbehandler kan skjønnsfastsette sykepengegrunnlaget i sp-sykepengegrunnlag. Det gir et nytt grunnlag med kilde `saksbehandler`, og outboxen sender `endret_sykepengegrunnlag` til Spleis og `saksbehandlerhandling` til Spesialist.

**Blokkeres av:** [03: Avviksvurdering for arbeidstakere](03-avviksvurdering.md)

**Status:** klar

## Akseptansekriterier

- [ ] `POST /api/personer/{pseudoId}/sykefravaerstilfeller/{skjæringstidspunkt}/skjonnsfastsettelse` tar innholdet i specen og svarer `{ "sykepengegrunnlagId": UUID }`. Endepunktet har tilgangskontroll per person og auditlogging.
- [ ] Endepunktet svarer 404 når skjæringstidspunktet ikke har sykepengegrunnlag, og 400 når grunnlaget ikke er for arbeidstakere eller ikke alle arbeidsgiverne er med.
- [ ] Det nye grunnlaget har `fastsettelse: ETTER_SKJØNN` og `fastsattÅrsinntekt` lik `årlig`.
- [ ] `endret_sykepengegrunnlag` har `manuellVurdering: true`, og `saksbehandlerhandling` har `handlingId` lik `endringId` og `handlingType: SKJØNNSFASTSATT_SYKEPENGEGRUNNLAG`.
- [ ] Hendelsene publiseres gjennom en outbox, bare etter at grunnlaget er lagret.
- [ ] `GET /api/personer/{pseudoId}/saksbehandlerhandlinger/{handlingId}/visning` gir feltene for skjønnsfastsettelsen.
- [ ] En ny automatisk fastsettelse beholder skjønnsfastsettelsen etter regelen om én krone i ticket [03](03-avviksvurdering.md).
- [ ] REST- og rapid-tester dekker skjønnsfastsettelse med og uten alle arbeidsgiverne, selvstendig næringsdrivende, visningen og outboxen.
