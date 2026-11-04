# Graderte andre ytelser fra saksbehandler

[Tickets](../tickets/graderte-andre-ytelser/) · [ADR 0007](../adr/0007-spleis-lagrer-versjon-av-graderte-andre-ytelser.md)

## Problem

En person kan ha en annen ytelse fra Nav, for eksempel foreldrepenger eller omsorgspenger, som dekker en del av en sykedag. Saksbehandler kan i dag bare gjøre hele dagen om til en annen ytelse med en overstyring av tidslinjen, og da får personen avslag for hele dagen. Saksbehandler har ingen måte å si at 20 % av dagen er dekket av foreldrepenger, og at dette skal gå ut over sykepengene. Spleis kan regne ut et trekk fra sykdomsgraden, men bare bak en toggle i dev og med et format som ingen app sender. sp-andre-ytelser lagrer fordelinger fra Speil, men løsningen på behovet har ingen versjon og ikke noe trekk, og valideringen godtar fordelinger som ikke går opp.

## Løsning

Saksbehandler lager en fordeling av dagen i dagoversikten i Speil. Fordelingen gjelder én yrkesaktivitet og deler dagen i sykdom, arbeid og graderte andre ytelser, til sammen 100 %. Saksbehandler velger om ytelsene tas fra sykdommen eller fra arbeidet. Eksempel: personen er 50 % sykmeldt og har 20 % foreldrepenger og 20 % omsorgspenger. Tar saksbehandler begge fra sykdommen, blir fordelingen 10 % syk, 20 % foreldrepenger, 20 % omsorgspenger og 50 % arbeid.

Speil sender fordelingen til sp-andre-ytelser sammen med sykdomsgraden saksbehandler så før fordelingen. sp-andre-ytelser validerer, lagrer en ny hendelse med ny `versjon` og sender `saksbehandlerhandling` (totrinn) og `graderte_andre_ytelser_endret` i samme transaksjon. Dette finnes allerede, bortsett fra sykdomsgraden før fordeling og den strengere valideringen.

Spleis revurderer fra `fom` i meldingen. Når Spleis beregner, sender den behovet `GraderteAndreYtelserForBeregning` med beregningsperioden. Løsningen gir per yrkesaktivitet den gjeldende versjonen og, for hver dag, trekket fra sykdomsgraden og sykdomsgraden før fordeling. Spleis lagrer versjonen for behandlingens egen yrkesaktivitet på endringen i behandlingen, bruker trekket som `trekkFraSykdomsgrad` i `Økonomi` og lagrer `trekkFraSykdomsgrad` per utbetalingsdag. Den justerte sykdomsgraden er Spleis' sykdomsgrad minus trekket, aldri under 0. Når sykdomsgraden før fordeling ikke stemmer med Spleis' sykdomsgrad, lager Spleis et varsel som stopper automatisk behandling.

Specen beskriver bare kontrakten mellom Speil og sp-andre-ytelser. Visningen og skjemaet i Speil er beskrevet i ticketene.

## Brukerhistorier

1. Som saksbehandler vil jeg fordele en dag for én yrkesaktivitet mellom sykdom, arbeid og én eller flere graderte andre ytelser, slik at sykepengene blir riktige når personen har en annen ytelse samme dag.
2. Som saksbehandler vil jeg velge om ytelsene tas fra sykdommen eller fra arbeidet, slik at fordelingen gjenspeiler personens situasjon.
3. Som saksbehandler vil jeg kunne registrere flere ulike ytelser samme dag, for eksempel foreldrepenger og omsorgspenger, slik at alle ytelsene kommer med.
4. Som saksbehandler vil jeg få en feilmelding når fordelingen ikke summerer til 100 %, slik at jeg ikke lagrer en dag som ikke går opp.
5. Som saksbehandler vil jeg få en feilmelding når den justerte sykdomsgraden blir 0 eller høyere enn sykdomsgraden jeg så, slik at en dag som er helt dekket av en annen ytelse, i stedet blir registrert som annen ytelse.
6. Som saksbehandler vil jeg få en feilmelding når arbeidsgraden blir høyere enn før fordelingen, slik at ytelsene bare tas fra sykdom eller arbeid og ikke flytter sykdom over til arbeid.
7. Som saksbehandler vil jeg få en feilmelding når en ytelse har en grad utenfor 1–99, slik at registreringen er meningsfull.
8. Som saksbehandler vil jeg kunne fjerne graderte andre ytelser fra en dag, slik at jeg kan rette en feil.
9. Som saksbehandler vil jeg få beskjed hvis noen andre har endret fordelingene etter at jeg hentet dem, slik at jeg ikke overskriver endringene deres.
10. Som saksbehandler vil jeg se fordelingen for hver dag i dagoversikten, slik at jeg ser hva som er registrert.
11. Som beslutter vil jeg at en fordeling krever totrinnsvurdering, slik at to personer har sett på en endring som påvirker utbetalingen.
12. Som beslutter vil jeg se historikken for hver dag med hvem som endret, når og notatet til beslutter, slik at jeg kan kontrollere endringen.
13. Som saksbehandler uten skrivetilgang vil jeg få nei når jeg prøver å fordele en dag, slik at bare saksbehandlere med tilgang kan endre saken.
14. Som sp-andre-ytelser vil jeg lagre sykdomsgraden saksbehandler så før fordelingen, slik at Spleis kan oppdage at sykdomsgraden er endret senere.
15. Som sp-andre-ytelser vil jeg regne ut trekket fra sykdomsgraden selv, slik at Spleis ikke trenger å vite hvor ytelsene ble tatt fra.
16. Som sp-andre-ytelser vil jeg svare på behovet med den gjeldende versjonen per yrkesaktivitet, slik at Spleis kan spore hvilke fordelinger en beregning bygde på.
17. Som sp-andre-ytelser vil jeg bare svare med dager innenfor perioden i behovet, og bare med yrkesaktiviteter som har dager der, slik at Spleis får akkurat det den trenger.
18. Som Spleis vil jeg sende behovet `GraderteAndreYtelserForBeregning` med beregningsperioden i samme runde som ytelsene, slik at fordelingene alltid er oppdaterte når jeg beregner.
19. Som Spleis vil jeg lese løsningen for arbeidstakere, frilansere, selvstendig næringsdrivende og arbeidsledige, slik at alle yrkesaktiviteter kan få et trekk.
20. Som Spleis vil jeg bruke trekket som `trekkFraSykdomsgrad` for dagen og yrkesaktiviteten, slik at den justerte sykdomsgraden gir utbetalingen.
21. Som Spleis vil jeg aldri gi en justert sykdomsgrad under 0, slik at et for stort trekk ikke gir negativ utbetaling.
22. Som Spleis vil jeg sjekke 20 %-regelen mot totalgraden etter trekket, slik som i dag, slik at regelen gjelder samlet over alle arbeidsgivere.
23. Som Spleis vil jeg telle en dag med justert sykdomsgrad over 0 som en hel forbrukt sykepengedag, slik som for andre graderte dager.
24. Som Spleis vil jeg lagre versjonen for behandlingens yrkesaktivitet på endringen i behandlingen, slik at det går an å se i ettertid hvilke fordelinger et vedtak bygde på.
25. Som Spleis vil jeg lagre `trekkFraSykdomsgrad` for hver utbetalingsdag, slik at et vedtak kan leses uten å spørre sp-andre-ytelser.
26. Som Spleis vil jeg lese utbetalingsdager uten `trekkFraSykdomsgrad` som 0, slik at gamle data virker som før.
27. Som Spleis vil jeg lage et varsel når sykdomsgraden før fordeling ikke er lik min sykdomsgrad for dagen, slik at saksbehandler fordeler dagen på nytt før vedtaket fattes.
28. Som Spleis vil jeg revurdere fra `fom` i `graderte_andre_ytelser_endret`, slik at perioder som er beregnet eller utbetalt, får fordelingen med.
29. Som Spleis vil jeg behandle en behandling uten versjon som en behandling uten graderte andre ytelser, slik at eksisterende behandlinger virker som før.
30. Som utvikler vil jeg fjerne `Toggle.GraderteAndreYtelser` når sp-andre-ytelser svarer i prod, slik at koden bare har én vei.

## Beslutninger om implementasjon

### Begreper

Se [GLOSSARY.md](../../GLOSSARY.md), seksjonen «Andre ytelser»: sykdomsgrad, justert sykdomsgrad, annen ytelse, gradert annen ytelse, fordeling av dagen og trekk fra sykdomsgrad.

### Ansvar

- sp-andre-ytelser eier fordelingene, historikken og reglene for en fordeling. Den regner ut trekket fra sykdomsgraden: `trekkFraSykdomsgrad = sykdomsgradFørFordeling − sykdomsgrad`.
- Spleis eier sykdomsgraden og regner ut den justerte sykdomsgraden: `max(0, sykdomsgrad − trekkFraSykdomsgrad)`. Spleis lagrer ikke fordelingene, bare versjonen og `trekkFraSykdomsgrad`.
- Graderte andre ytelser ligger ikke på sykdomstidslinjen. En dag som er helt dekket av en annen ytelse, registreres som annen ytelse med en overstyring av tidslinjen, som i dag.

### sp-andre-ytelser: REST-API for Speil

`POST /api/personer/{personPseudoId}/graderte-andre-ytelser` beholder formen sin. Hver dag får det nye feltet `sykdomsgradFørFordeling`:

| Felt | Type | Betydning |
|---|---|---|
| `dato` | dato | Dagen |
| `andreYtelserGrader` | map fra ytelsestype til heltall | Graden for hver gradert annen ytelse. Tom map betyr at dagen ikke har graderte andre ytelser. |
| `sykdomsgrad` | heltall | Justert sykdomsgrad etter fordelingen |
| `arbeidsgrad` | heltall | Arbeidsgrad etter fordelingen |
| `sykdomsgradFørFordeling` | heltall | Sykdomsgraden saksbehandler så i Speil før fordelingen. Påkrevd. |

Ytelsestypene er `FORELDREPENGER`, `SVANGERSKAPSPENGER`, `OMSORGSPENGER`, `PLEIEPENGER` og `OPPLARINGSPENGER`. `GET` på samme sti returnerer `sykdomsgradFørFordeling` på hver dag og på dagene i hendelsene. Hendelsene får også `fraSykdomsgradFørFordeling`, som de andre `fra`-feltene.

### sp-andre-ytelser: regler for en fordeling

Hver dag i en forespørsel valideres for seg. En dag er gyldig når alt dette gjelder:

1. `1 ≤ sykdomsgradFørFordeling ≤ 100`.
2. `sykdomsgrad + arbeidsgrad + summen av andreYtelserGrader = 100`.
3. Hver grad i `andreYtelserGrader` er mellom 1 og 99.
4. `1 ≤ sykdomsgrad ≤ sykdomsgradFørFordeling` og `0 ≤ arbeidsgrad`. Uten den siste delen ville en negativ arbeidsgrad gått gjennom regel 2 og 5, for eksempel 50 før fordeling, sykdomsgrad 50, foreldrepenger 60 og arbeidsgrad −10.
5. `arbeidsgrad ≤ 100 − sykdomsgradFørFordeling`, altså at arbeidsgraden ikke øker.
6. Hvis `andreYtelserGrader` er tom, er `sykdomsgrad = sykdomsgradFørFordeling`. Slik fjerner saksbehandler graderte andre ytelser fra en dag, og trekket blir 0.

Regel 2 og 5 sammen gir at trekket er mellom 0 og summen av ytelsene. Feilkodene `NEGATIV_GRAD` og `TOTAL_GRAD_OVER_100` erstattes av disse, med HTTP 400 og ProblemDetails som i dag:

| Feilkode | Regel |
|---|---|
| `GRAD_UTENFOR_GRENSER` | 1, 3 eller 4 |
| `SUM_ER_IKKE_100` | 2 |
| `YTELSER_MANGLER_TREKK` | 6 |
| `ARBEIDSGRAD_OKER` | 5 |

Regel 6 følger egentlig av regel 2, 4 og 5: uten ytelser er arbeidsgraden `100 − sykdomsgrad`, så en lavere sykdomsgrad betyr alltid at arbeidsgraden øker. Den sjekkes likevel før regel 5, slik at saksbehandler får en mer presis feilmelding.

`MANGLER_ENDRINGER` (400) og `UTDATERT_TILSTAND` (409) er som før. Rekkefølgen er validering, så versjonssjekk, så lagring.

En dag i en hendelse erstatter dagen med samme dato, som i dag. Det gir én gjeldende fordeling per dag og yrkesaktivitet.

### sp-andre-ytelser: lagring

`sykdomsgradFørFordeling` lagres på hver dag i hendelsen (`data_json`), sammen med `fraSykdomsgradFørFordeling`. Hendelsestabellen endres ikke. Se Andre merknader om eksisterende hendelser uten feltet.

### Behov `GraderteAndreYtelserForBeregning`

Spleis sender behovet i samme runde som de andre ytelsene i `Ytelser`. Inndata er som i dag:

| Felt | Type |
|---|---|
| `fødselsnummer` | streng |
| `GraderteAndreYtelserForBeregning.fom` | dato, første dag i beregningsperioden |
| `GraderteAndreYtelserForBeregning.tom` | dato, siste dag i beregningsperioden |

Løsningen er `@løsning.GraderteAndreYtelserForBeregning`, en liste med ett element per yrkesaktivitet som har minst én dag i perioden. En tom liste betyr at ingenting er registrert i perioden.

| Felt | Type | Betydning |
|---|---|---|
| `yrkesaktivitetstype` | `ARBEIDSTAKER`, `FRILANS`, `SELVSTENDIG` eller `ARBEIDSLEDIG` | |
| `organisasjonsnummer` | streng eller `null` | Satt for `ARBEIDSTAKER`, ellers `null` |
| `versjon` | UUID | Den gjeldende versjonen for yrkesaktiviteten, altså versjonen til den siste hendelsen. Den gjelder hele hendelsesloggen, ikke bare dagene i perioden. |
| `dager` | liste | Dager i perioden, sortert på dato |
| `dager[].dato` | dato | |
| `dager[].trekkFraSykdomsgrad` | heltall 0–99 | `sykdomsgradFørFordeling − sykdomsgrad` |
| `dager[].sykdomsgradFørFordeling` | heltall 1–100 | |

Løsningen kan fortsatt ha `andreYtelserGrader`, `sykdomsgrad` og `arbeidsgrad` på hver dag. Spleis leser dem ikke.

### Meldingen `graderte_andre_ytelser_endret`

Formatet er som i dag: `fødselsnummer`, `fom`, `yrkesaktivitetstype` og `organisasjonsnummer`. Spleis leser bare `fødselsnummer` og `fom`, og revurderer alle yrkesaktiviteter fra `fom`. Det gjør Spleis allerede.

### Spleis: lese løsningen

- Mottaket av `Ytelser` leser formatet over. `ARBEIDSTAKER` med organisasjonsnummer blir arbeidstaker hos arbeidsgiveren, og `FRILANS`, `SELVSTENDIG` og `ARBEIDSLEDIG` blir de tilsvarende yrkesaktivitetene. Mottaket kjenner ikke `ARBEIDSLEDIG` i dag.
- Trekket blir tidslinjen per yrkesaktivitet som byggerne av utbetalingstidslinjen allerede bruker. Den inneholder trekket og sykdomsgraden før fordeling per dag.
- Trekket brukes som `trekkFraSykdomsgrad` i `Økonomi`. Feltet het `andreYtelserGrad` før, men det er trekket fra sykdomsgraden og ikke graden til ytelsene, så det får navnet fra ordlisten. 20 %-regelen og forbruket av sykepengedager er som i dag.

### Spleis: versjoner på endringen i behandlingen

- `Endring.graderteAndreYtelserId` settes til `versjon` for yrkesaktiviteten som vedtaksperioden tilhører. Feltet finnes allerede, men blir ikke satt i dag. Det er tomt når løsningen ikke har noe element for yrkesaktiviteten.
- Endringen lagrer ikke versjonene til de andre yrkesaktivitetene, selv om totalgraden avhenger av dem. Spleis beregner overlappende perioder samlet, og endringene i de andre behandlingene lagrer sine egne versjoner. Til sammen gir endringene den samme sporingen.
- Feltet lagres med serde og i DTO-ene. Endringer som er lagret før dette, har ikke feltet.

### Spleis: `trekkFraSykdomsgrad` i økonomien

`andreYtelserGrad` i `Økonomi` får navnet `trekkFraSykdomsgrad`. `ØkonomiUtDto` og `ØkonomiInnDto` får `trekkFraSykdomsgrad`. Serde lagrer feltet per utbetalingsdag. Når feltet mangler, leses det som 0.

### Spleis: varsel

Et nytt varsel i serien `RV_AY` med teksten «Sykdomsgraden er endret etter fordeling av dagen. Fordel dagen på nytt.» Spleis lager varselet på vedtaksperioden når minst én dag i perioden for behandlingens yrkesaktivitet har en `sykdomsgradFørFordeling` som ikke er lik Spleis' sykdomsgrad for dagen. En dag som ikke er en sykedag i Spleis, har sykdomsgrad 0 i denne sammenligningen. Varselet stopper automatisk behandling, som andre varsler.

### Utrulling

1. sp-andre-ytelser tar i bruk de nye reglene og svarer med det nye formatet i dev og prod.
2. Spleis tar i bruk det nye formatet bak `Toggle.GraderteAndreYtelser`, som bare er på i dev.
3. Når sp-andre-ytelser svarer i prod, fjernes togglen i Spleis. Speil har sin egen toggle for skjemaet.

## Beslutninger om testing

- Gode tester sjekker oppførsel utenfra: hva API-et svarer, hva som publiseres på rapiden, og hva Spleis utbetaler og varsler. De sjekker ikke interne datastrukturer.
- sp-andre-ytelser:
  - Validatoren testes med én test per regel og grensene rundt den, blant annet en dag uten ytelser og en dag der alt er tatt fra arbeidet. Bygg videre på `GraderteAndreYtelserValidatorTest`.
  - API-et testes med `testApplication` for nye feilkoder og for at `sykdomsgradFørFordeling` lagres og vises. Bygg videre på `GraderteAndreYtelserPostApiTest` og `GraderteAndreYtelserApiTest`.
  - Behovsløseren testes med `TestRapid` for `versjon`, trekk, sykdomsgrad før fordeling, avgrensning til perioden og flere yrkesaktiviteter. Bygg videre på `GraderteAndreYtelserBehovRiverTest`.
- Spleis:
  - Mottaket testes med det nye formatet for alle yrkesaktivitetstypene. Bygg videre på `YtelserRiverTest` og `YtelserRiverMappingTest`. Behovet er med i `BehovkontraktTest`.
  - E2e-tester med testløsninger dekker trekk fra sykdom, trekk som er større enn sykdomsgraden, to arbeidsgivere der bare én har et trekk og 20 %-regelen mot totalgraden, varsel ved endret sykdomsgrad, revurdering etter `graderte_andre_ytelser_endret`, versjonen på endringen og togglen av og på. Bygg videre på `GraderteAndreYtelserTest` i `e2e/andre_ytelser`.
  - Serde testes for `trekkFraSykdomsgrad` og versjonen, med gamle data uten feltene.

## Utenfor omfang

- Automatisk henting av graderte andre ytelser fra andre systemer. sp-andre-ytelser skal eie også disse senere.
- Dager som er helt dekket av en annen ytelse. De registreres som annen ytelse på sykdomstidslinjen, som i dag.
- Overlapp mellom ytelser, der for eksempel 20 % foreldrepenger og 20 % omsorgspenger til sammen dekker 30 %.
- Nytt navn på `utbetalingsgrad` i `Økonomi`.
- Endringer i Spesialist. Spesialist har allerede fjernet sin løsning og tar imot `saksbehandlerhandling` som før.

## Andre merknader

- **Eksisterende hendelser uten `sykdomsgradFørFordeling`.** Funksjonen er ikke i bruk. Vi antar at det bare finnes testdata i dev, og at de kan slettes med en migrering i sp-andre-ytelser. Sjekk at prod er tom før migreringen kjøres der.
- **Overlapp senere.** Hvis ytelser kan overlappe, er den samlede andelen andre ytelser `100 − sykdomsgrad − arbeidsgrad`. Regel 2 endres til at summen av ytelsene er minst like stor som den samlede andelen, og regel 3 til at hver ytelse er høyst like stor. Kontrakten med Spleis og de lagrede dataene er de samme.
- **Eksisterende varsler om andre ytelser.** Spleis lager allerede varsler som `RV_AY_5` når foreldrepenger og andre ytelser er utbetalt i samme periode. De påvirkes ikke av denne specen.
- **Åpent spørsmål: hva sykdomstidslinjen er.** Sykdomstidslinjen inneholder i dag både sykedager og dager som ferie, permisjon, arbeid og annen ytelse. Den viser altså hva dagen er i sykepengesammenheng, ikke bare om personen var syk. Vi har ikke tatt stilling til om det er riktig, fordi graderte andre ytelser ikke ligger på sykdomstidslinjen i noen av tolkningene.
