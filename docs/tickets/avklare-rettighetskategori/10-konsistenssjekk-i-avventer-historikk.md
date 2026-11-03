# 10: Konsistenssjekk av rettighetskategori i `AvventerHistorikk`

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 3

**Repo:** `spleis`

**Hva skal lages:** Med togglen for fase 3 på forkaster Spleis perioder der hovedkategorien ikke stemmer med periodens yrkesaktivitetstype. Det gjelder også forlengelser og revurderinger, som ikke går gjennom vilkårsprøving, og perioder med vilkårsgrunnlag fra før fase 1. En selvstendig forlengelse av et sykefraværstilfelle med hovedkategorien Arbeidstaker blir forkastet med det nye varselet RV_RK_2 når den ikke fanges før. I dag forkastes den med RV_SØ_53. Kommer den etter at skjæringstidspunktet har fullt vilkårsgrunnlag, eller etter at den første perioden i tilfellet har spurt, forkastes den fortsatt med RV_SØ_53 når søknaden kommer inn (ticket 09).

**Blokkeres av:** [06: Rulle ut fase 1](06-rulle-ut-fase-1.md), [08: Backfill av historikken i sp-rettighetskategori](08-backfill-i-sp-rettighetskategori.md)

**Status:** ferdig

## Akseptansekriterier

- [x] `AvventerHistorikk` slår opp hovedkategorien med `RettighetskategoriResultat` sammen med ytelsene, slik opptjening gjør.
- [x] Ny varselkode `RV_RK_2("Perioden har en annen yrkesaktivitetstype enn rettighetskategorien")`.
- [x] Stemmer ikke hovedkategorien med periodens yrkesaktivitetstype, forkastes perioden med RV_RK_2.
- [x] Konsistenssjekken er ikke det som forkaster de andre periodene i et kombinert sykefraværstilfelle. De forkastes i mottaket av løsningen i `AvventerRettighetskategori` (ticket 09) og kommer aldri til `AvventerHistorikk`.
- [x] `AvventerHistorikk` er det eneste stedet Spleis slår opp hovedkategorien med `RettighetskategoriResultat`. Spleis slår alltid opp hovedkategorien når togglen er på. Det finnes ingen vei utenom sjekken for perioder uten rettighetskategori-ID.
- [x] `RettighetskategoriResultat` er lagt inn i `BehovkontraktTest`.
- [x] Er `RettighetskategoriResultat` ubesvart, står perioden i `AvventerHistorikk` og sender behovet på nytt ved påminnelse.
- [x] Tester dekker konsistenssjekken: enhetstester for alle kombinasjoner av hovedkategori og yrkesaktivitetstype (`YtelserRettighetskategoriTest`), og e2e-tester for en forlengelse av et vilkårsgrunnlag fra før fase 1 med deterministisk ID, en forlengelse der hovedkategorien ikke stemmer, og en revurdering der hovedkategorien ikke stemmer. E2e-testen med AT 1.–31. januar og SN 1.–28. februar er flyttet til ticket 09, fordi den krever at RV_SØ_53 ikke kjører før skjæringstidspunktet har fullt vilkårsgrunnlag.

## Merknader fra implementasjonen

- Togglen heter `ValidereRettighetskategori` (`VALIDERE_RETTIGHETSKATEGORI`).
- Hovedkategorien Arbeidstaker og selvstendig næringsdrivende stemmer ikke med noen yrkesaktivitetstype og gir RV_RK_2. Slike tilfeller skal være forkastet med RV_RK_1 før de kommer hit.
- I `AvventerHistorikkRevurdering` blir RV_RK_2 et varsel, som andre funksjonelle feil i revurdering.
- En periode som feiler konsistenssjekken, forkastes før den beregnes. Ellers blir den beregnet mot et vilkårsgrunnlag uten inntekt for yrkesaktivitetstypen, og det gir misvisende varsler som RV_VV_4.
- Er `RettighetskategoriResultat` ikke sendt med i behovet, for eksempel fordi behovet ble sendt før togglen ble skrudd på, hopper Spleis over sjekken. Påminnelse sender behovet på nytt med det nye feltet.
- Togglen skal ikke skrus på før ticket 09 er ferdig.

