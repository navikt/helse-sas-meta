# 15: Saksbehandlers endringer i sp-inntekt

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 3

**Repo:** `sp-inntekt`

**Hva skal lages:** Saksbehandler kan korrigere månedsinntekten for en arbeidsgiver og deaktivere og aktivere arbeidsforhold i sp-inntekt. En endring gir en ny inntektsavklaring med kilde `saksbehandler`, og outboxen sender `endret_inntektsavklaring` til Spleis og `saksbehandlerhandling` til Spesialist. Endringene følger med når sp-inntekt lager en ny inntektsavklaring.

**Blokkeres av:** [04: Gjenbruk av registeropplysninger ved `nyInnhenting: false`](04-gjenbruk-av-registeropplysninger.md)

**Status:** klar

## Akseptansekriterier

- [ ] `POST .../korrigert-inntekt`, `.../deaktivering` og `.../aktivering` under `/api/personer/{pseudoId}` tar innholdet i specen og svarer `{ "inntektsavklaringId": UUID }`. De har tilgangskontroll per person og auditlogging.
- [ ] Endepunktene svarer 404 når skjæringstidspunktet ikke har inntektsavklaring, og 400 når arbeidsgiveren ikke er i inntektsavklaringen eller endringen ikke endrer noe.
- [ ] Hver endring får en ny `endringId`, og `saksbehandlerhandling` har `handlingId` lik `endringId` og de andre feltene i specen.
- [ ] `GET .../saksbehandlerhandlinger/{handlingId}/visning` gir feltene for endringen, som i sp-vilkarsproving.
- [ ] Hendelsene publiseres gjennom en outbox, bare etter at inntektsavklaringen er lagret.
- [ ] Korrigerte inntekter og deaktiverte arbeidsforhold følger med inn i nye inntektsavklaringer for samme skjæringstidspunkt.
- [ ] Den korrigerte inntekten fjernes når en ny inntektsmelding med et annet beløp kommer for arbeidsgiveren, som i Spleis i dag.
- [ ] REST- og rapid-tester dekker de tre endringene, feilsvarene, visningen, outboxen og korrigert inntekt ved ny inntektsmelding med samme og annet beløp.
- [ ] Det åpne spørsmålet nedenfor er besvart, og specen er oppdatert hvis svaret krever mer enn arbeidsforhold.

## Merknader

- **Åpent spørsmål fra specen:** Hva betyr det at saksbehandler kan «aktivere og deaktivere inntekter», ut over arbeidsforhold? Krever svaret endringer på enkeltinntekter fra a-ordningen, lag en egen ticket.
