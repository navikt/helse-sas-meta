---
status: akseptert
---

# Domenetjenestene gjenbruker vurderingen når subsumsjonen er den samme

Mønsteret i ADR 0006 gjelder også for domenetjenestene, ikke bare for sp-rettighetskategori. Når en domenetjeneste får en ny rettighetskategori-ID, slår den opp rettighetskategorien (ADR 0005) og ser om den ville gjort samme subsumsjon som sist: samme regel, med samme lovreferanse og vilkårskode, brukt på de samme faktaene og med samme utfall. Er subsumsjonen den samme, gjenbruker tjenesten den gjeldende vurderingen og ID-en til den, og registrerer at vurderingen også gjelder den nye rettighetskategori-ID-en. Er subsumsjonen en annen, blir det en ny vurdering med ny ID, også når utfallet er det samme.

Vi avklarte dette med jurist med opptjening som eksempel. Saksbehandleren legger til tilleggskategorien jordbruker for en selvstendig næringsdrivende. Rettighetskategorien får ny ID fordi konklusjonen er endret, men opptjening leser bare hovedkategorien. Opptjening ville brukt regelen for selvstendig næringsdrivende igjen og kommet til samme svar på samme måte. Da er det ikke nødvendig juridisk å vurdere på nytt, og en ny vurdering ville bare gitt en ny ID i Spleis uten at noe er endret for opptjening.

Samme utfall er ikke nok. Endres hovedkategorien fra Selvstendig næringsdrivende til Arbeidstaker, er opptjening kanskje oppfylt i begge tilfeller. Men for en arbeidstaker teller opptjening dager med arbeidsforhold før skjæringstidspunktet, mens den for en selvstendig næringsdrivende ikke gjør det. Veien fram til utfallet er en annen subsumsjon, så vurderingen kan ikke gjenbrukes, selv om resultatet er «oppfylt» begge gangene.

## Eksempel

1. Søknaden kommer inn. sp-rettighetskategori avgjør Selvstendig næringsdrivende med ID 1. Opptjening bruker regelen for selvstendig næringsdrivende og lager opptjeningsvurdering 1, oppfylt.
2. Saksbehandleren legger til tilleggskategorien jordbruker. Det blir avgjørelse ID 2.
3. Spleis vilkårsprøver på nytt og sender ID 2 til opptjening. Hovedkategorien er den samme, så opptjening ville brukt samme regel på samme fakta. Opptjening registrerer at vurdering 1 også gjelder ID 2, og svarer med opptjeningsvurdering 1.
4. Endrer saksbehandleren senere hovedkategorien til Arbeidstaker og selvstendig næringsdrivende, gir det avgjørelse ID 3. Opptjening ville nå brukt en annen regel og lager opptjeningsvurdering 2 mot ID 3, også om den er oppfylt.

## Slik gjør opptjening det

1. Er rettighetskategori-ID-en allerede koblet til en opptjeningsvurdering, svarer opptjening med den nyeste av dem uten å slå opp rettighetskategorien.
2. Er ID-en ukjent, slår opptjening opp hovedkategorien. Finnes det en gjeldende vurdering for samme person, skjæringstidspunkt og hovedkategori, gjenbrukes den og kobles til ID-en. Det gjelder også manuelle vurderinger og vurderinger fra Infotrygd.
3. Ellers lager opptjening en ny vurdering og kobler den til ID-en.

Opptjening vurderer ikke hovedkategorien Arbeidstaker og selvstendig næringsdrivende ennå.

## Vurderte alternativer

- **Ny vurdering for hver ny rettighetskategori-ID.** Regelen er enkel, og opptjening trenger ikke vite hva som ble endret. Men tjenesten vurderer på nytt hver gang rettighetskategorien endres, også når endringen ikke gjelder den. Henter den opplysninger på nytt, kan svaret bli et annet uten at rettighetskategorien var grunnen. Var vurderingen gjort manuelt, må saksbehandleren kanskje gjøre den igjen.
- **Gjenbruke vurderingen når utfallet er det samme.** Da slipper vi også nye ID-er når hovedkategorien endres og utfallet blir det samme. Men da viser vurderingen en subsumsjon som ikke er den som ville gjeldt for den nye rettighetskategorien. Det kan vi ikke stå inne for juridisk.

## Konsekvenser

- Hver domenetjeneste må vite hvilke deler av rettighetskategorien som avgjør subsumsjonen dens, og sammenligne dem med rettighetskategorien den vurderte sist. For opptjening er det i dag bare hovedkategorien.
- Begynner en domenetjeneste å bruke en tilleggskategori, må sammenligningen endres samtidig. Ellers gjenbruker den vurderinger som skulle vært gjort på nytt.
- En vurdering kan gjelde flere rettighetskategori-ID-er. Domenetjenesten lagrer koblingen til hver ID og når den ble registrert, slik at vi kan vise hvilken avgjørelse vurderingen ble gjort med, og hvilke den senere gjelder for.
- En manuell vurdering beholdes når subsumsjonen er den samme. Saksbehandleren trenger ikke vurdere den igjen.
- Spleis trenger ingen endring. Den får samme vurderings-ID tilbake oftere.
- Hvilke fakta som skal hentes på nytt ved ny vilkårsprøving, for eksempel arbeidsforhold fra Aa-registeret, er en egen regel i hver domenetjeneste. Gir nye fakta en annen subsumsjon, blir det en ny vurdering.
- Svaret på det første åpne spørsmålet i ADR 0006 er ja, med subsumsjonen som mål på om noe er endret.

## Åpne spørsmål

- **Andre domenetjenester:** Hvilke deler av rettighetskategorien avgjør subsumsjonen i forsikring og medlemskap? Det må avklares for hver tjeneste før de tar i bruk mønsteret. Forsikring gjenbruker i dag bare når rettighetskategori-ID-en er den samme.
- **Arbeidstaker og selvstendig næringsdrivende i opptjening:** Hvilken regel gjelder, og teller både arbeidsforhold og næringsvirksomhet? Det må avklares med jurist.
