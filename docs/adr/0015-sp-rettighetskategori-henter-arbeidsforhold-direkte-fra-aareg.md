---
status: til vurdering
---

# sp-rettighetskategori henter arbeidsforhold direkte fra Aareg

For å avgjøre tilleggskategorien Arbeidstaker på skip trenger sp-rettighetskategori de maritime arbeidsforholdene til personen: arbeidssted, ansettelsesperiode, skipsregister og fartsområde. Tjenesten henter dem selv med et REST-kall til Aareg API v2, med Entra ID client credentials. Svaret lagres som grunnlag for vurderingen. sp-rettighetskategori henter søknader fra Spedisjon på samme måte.

Grunnen er at sp-rettighetskategori eier hele avgjørelsen og grunnlaget for den. Med et direkte kall blir det ingen ny kontrakt på rapiden og ingen endring i Spleis, i tråd med ADR 0005. sparkel-aareg er laget for å svare på behov fra Spleis, og løsningen gir ikke feltene om skip.

## Vurderte alternativer

- **Nytt behov som sparkel-aareg løser.** Da gjenbruker vi klienten og tilgangen sparkel-aareg allerede har. Men løsningen må utvides med skipsregister og fartsområde, sp-rettighetskategori må vente på et svar på rapiden midt i sin egen behandling, og vi får en kontrakt til mellom to tjenester som i dag ikke kjenner hverandre.
- **Spleis sender arbeidsforholdene med i behovet `Rettighetskategori`.** Spleis henter allerede `ArbeidsforholdV2` til vilkårsprøvingen, men først etter at rettighetskategorien er avgjort. Spleis måtte da hente dem tidligere og bli mellomledd for data den selv ikke bruker. Det er det ADR 0005 forkaster.

## Konsekvenser

- sp-rettighetskategori må få tilgang til Aareg: scope i Entra ID, `accessPolicy.outbound` og godkjenning fra teamet som eier Aareg.
- Svarer ikke Aareg, svarer ikke sp-rettighetskategori på behovet. Påminnelsen fra Spleis sender det på nytt.
- sp-rettighetskategori lagrer arbeidsforhold, som er personopplysninger, og må slette dem på samme måte som de andre dataene om personen.
