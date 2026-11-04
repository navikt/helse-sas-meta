# 10: Rulle ut fase 1

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 1

**Repo:** `spleis`, `sp-inntekt`

**Hva skal lages:** sp-inntekt svarer i dev og prod, og togglen for `AvventerInntektsavklaring` er på i Spleis. Alle nye sykefraværstilfeller får en inntektsavklaring. Spleis beregner fortsatt som før.

**Blokkeres av:** [04: Gjenbruk av registeropplysninger ved `nyInnhenting: false`](04-gjenbruk-av-registeropplysninger.md), [07: `AvventerInntektsavklaring` i Spleis bak toggle](07-spleis-avventer-inntektsavklaring.md), [08: `AVVENTER_INNTEKTSAVKLARING` og `AVVENTER_SYKEPENGEGRUNNLAG` i Spock og spammer](08-tilstandene-i-spock-og-spammer.md), [09: Revurdering gjennom `AvventerInntektsavklaring`](09-revurdering-gjennom-avventer-inntektsavklaring.md)

**Status:** klar

## Akseptansekriterier

- [ ] sp-inntekt har tilgang til Spedisjon, Sigrun og rapiden i dev og prod.
- [ ] Togglen er skrudd på i dev, og vi har sett perioder gå gjennom tilstanden uten å bli stående.
- [ ] Togglen er skrudd på i prod.
- [ ] Vi har fulgt med på perioder i `AVVENTER_INNTEKTSAVKLARING` i spammer i minst en uke uten at noen står fast.
