# 22: Bytte (fase 3)

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `spleis`, `spesialist`, `speil`, `sp-inntekt`, `sp-sykepengegrunnlag`, `spregulering`

**Hva skal lages:** Alt som endrer et sykepengegrunnlag, flyttes i én runde. Spleis bruker grunnlaget fra tjenestene, Speil og Spesialist sender endringer til sp-inntekt og sp-sykepengegrunnlag, avviksvurderingen og grunnbeløpsreguleringen flyttes, og Spregulering skrus av. Ticketen gjelder begge specene.

**Blokkeres av:** [11: Rulle ut fase 2](11-rulle-ut-fase-2.md), [14: Grunnbeløpsregulering i sp-sykepengegrunnlag](14-grunnbelopsregulering.md), [17: Spesialist henter sykepengegrunnlaget fra sp-sykepengegrunnlag bak toggle](17-spesialist-henter-sykepengegrunnlaget.md), [18: Spleis revurderer ved `endret_sykepengegrunnlag`](18-spleis-revurderer-ved-endret-sykepengegrunnlag.md), [20: Spleis avviser overstyringer av inntekt og grunnlag etter byttet](20-spleis-avviser-overstyringer.md), [21: Speil viser sykepengegrunnlaget og sender skjønnsfastsettelser til sp-sykepengegrunnlag bak toggle](21-speil-sykepengegrunnlag-mot-tjenesten.md), [Inntekt 15: Saksbehandlers endringer i sp-inntekt](../avklare-inntekt/15-saksbehandlers-endringer-i-sp-inntekt.md), [Inntekt 17: Speil viser inntektene og sender endringer til sp-inntekt bak toggle](../avklare-inntekt/17-speil-inntekter-mot-sp-inntekt.md)

**Status:** klar

## Akseptansekriterier

- [ ] De åpne spørsmålene nedenfor er besvart, og svarene står i specene.
- [ ] Bytte-togglen i Spleis, togglen i Spesialist og togglen i Speil skrus på samtidig i dev, og vi har behandlet saker med korrigert inntekt, deaktivert arbeidsforhold og skjønnsfastsettelse hele veien til `vedtak_fattet`.
- [ ] Togglen for grunnbeløpsregulering i sp-sykepengegrunnlag er på, og Spregulering er skrudd av, i samme runde.
- [ ] Det samme er gjort i prod.
- [ ] Vi har en plan for hva vi gjør hvis vi må skru av togglene igjen.

## Merknader

- **Åpent spørsmål:** Er det riktig etter loven å regne `PGIF-008` som et fastsatt år med 0 kr? Regelen for årene er også avstemt med team flex.
- **Åpent spørsmål:** Skal sp-inntekt og sp-sykepengegrunnlag sende subsumsjonsmeldinger? Spinnvill slutter å sende subsumsjoner for § 8-30 ved byttet, så spre-subsumsjon blir berørt.
- Etter byttet kan vi ikke rulle tilbake ved å skru av togglene uten å miste endringer som saksbehandlere har gjort i tjenestene. Spleis beholder `Inntektsgrunnlag` fram til opprydningen, så det gjelder bare skjæringstidspunkter som er endret etter byttet.
