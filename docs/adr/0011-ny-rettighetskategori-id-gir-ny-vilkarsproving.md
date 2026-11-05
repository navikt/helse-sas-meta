---
status: til vurdering
---

# En ny rettighetskategori-ID gir ny vilkårsprøving i Spleis

Når saksbehandler gjør en manuell vurdering av rettighetskategorien, sender sp-rettighetskategori `rettighetskategori_endret` med `fødselsnummer`, `skjæringstidspunkt`, `rettighetskategoriId` og `hovedkategori`. Spleis bytter ikke bare ID-en i vilkårsgrunnlaget, slik den gjør for `endret_opptjeningsvurdering`, `endret_forsikringsvurdering` og `endret_medlemskapsvurdering`. Spleis erstatter i stedet det fulle vilkårsgrunnlaget på skjæringstidspunktet med et minimalt vilkårsgrunnlag med den nye ID-en (ADR 0003), og starter en overstyring. `AvventerBlokkerendePeriode` og `AvventerRevurdering` går rett til `AvventerVilkårsprøving` eller `AvventerVilkårsprøvingRevurdering` når det minimale vilkårsgrunnlaget finnes, og periodene vilkårsprøves på nytt med den nye ID-en.

Grunnen er at opptjening og forsikring bygger på rettighetskategorien (ADR 0005). En ny rettighetskategori kan gi en ny opptjeningsvurdering og forsikringsvurdering. Hvis Spleis bare byttet ID-en, ville vilkårsgrunnlaget peke på en rettighetskategori som vurderingene i det ikke bygger på.

## Vurderte alternativer

- **Bytte ID-en i det fulle vilkårsgrunnlaget, som de andre `endret_*`-meldingene.** Det gjenbruker koden, men vurderingene i vilkårsgrunnlaget blir ikke gjort på nytt.
- **Gå tilbake til `AvventerRettighetskategori` og sende behovet `Rettighetskategori` på nytt.** Det krever ingen ny gren i tilstandene, men meldingen har allerede ID-en. En ny runde kunne også gitt en ny automatisk avgjørelse som erstatter den manuelle vurderingen før Spleis har brukt den.

## Konsekvenser

- Meldingen har hovedkategorien, slik løsningen på behovet har. Spleis forkaster perioder som ikke er revurderinger, når hovedkategorien ikke støttes, slik mottaket av løsningen gjør i dag (RV_RK_1).
- Alle perioder som ikke slutter før skjæringstidspunktet, berøres, på tvers av yrkesaktiviteter. Perioder med vedtak revurderes.
- Finnes bare et minimalt vilkårsgrunnlag, bytter Spleis ID-en i det. Finnes ingen vilkårsgrunnlag, eller bare et fra Infotrygd, logger Spleis og ignorerer meldingen. Samme ID som før gjør ingenting.
- En manuell vurdering gjelder bare til neste automatiske vurdering. Gir en ny automatisk vurdering en annen konklusjon, blir den en ny avgjørelse som erstatter den manuelle (ADR 0006).
- sp-rettighetskategori må sende meldingen sikkert. Den lagrer avgjørelsen og meldingen i samme transaksjon i en outbox, og bare lederen publiserer.
