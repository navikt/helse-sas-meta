# Maksdato og forbrukte sykepengedager til konsumenter

## Problem

Flere team utenfor sykepengeområdet trenger å vite hvor lenge en person kan få sykepenger.

- **AAP** trenger maksdato for å prioritere hvilke saker som skal behandles først. Det haster. AAP henter allerede utbetalte perioder fra spøkelse, men spøkelse gir ingen maksdato, ingen forbrukte dager og ingen gjenstående dager.
- **Modia personoversikt** (Team Personoversikt) vil vise maksdato til veiledere som snakker direkte med borgeren. Her må tallene være riktige, slik at ingen blir stående uten ytelse fordi de fikk feil informasjon. Personoversikt fjernet maksdato i 2021 fordi den hadde for mange feil. Den kom fra Infotrygd.
- **Modia sykefraværsoppfølging** (team eSYFO) viser i dag en maksdato fra tjenesten `sykepengedager-informasjon`. Den slår sammen Spleis og Infotrygd ved å velge raden med senest TOM, uten noen garanti for at resultatet er riktig.

Spleis beregner maksdato, forbrukte og gjenstående dager ved hvert vedtak og tar med utbetalte dager fra Infotrygd. Verdiene sendes ut på `tbd.utbetaling`, men bare når det fattes et vedtak. Spøkelse leser topicet, men lagrer bare gjenstående dager per utbetaling og bruker ikke vedtak uten utbetaling (avslag). Infotrygd har sin egen maksdato (`is10_max`), men vi vet ikke hvor god den er, og sparkel sender den ikke videre.

Maksdatoen endrer seg over tid, også uten nye vedtak. Den er derfor alltid et estimat, gitt en bestemt dato og en forutsetning om sammenhengende sykdom.

## Løsning

Spøkelse får et nytt REST-oppslag per person som gir **forbrukte og gjenstående sykepengedager per en dato**, og en **estimert maksdato** regnet ut fra disse. Svaret bygger bare på **fattede vedtak**, både vedtak med utbetaling og vedtak uten utbetaling (avslag). Svaret sier selv hva det bygger på, hvor langt vi har vurdert, og hvor sikkert det er.

Svaret har to deler, og hver del har sin egen kvalitet:

- **Fakta-del**: `forbrukteDager`, `gjenståendeDager`, `vurdertTilOgMed`, `sisteKjenteUtbetalteDag` og `grunnlag: FATTEDE_VEDTAK`.
- **Prognose-del**: `estimertMaksdato`, regnet fra fakta-delen under forutsetning av sammenhengende sykdom. Prognosen er alltid et estimat.

Kvaliteten er `SIKKER`, `ESTIMAT` eller `UKJENT`, med maskinlesbare `årsaker`. `SIKKER` betyr «korrekt ut fra de vedtakene som er fattet». Det er ikke usikkert at det finnes søknader som venter eller saker som er under behandling. Det dekkes av forutsetningen om fattede vedtak.

Hvilke svar en konsument får, avhenger av tilgangsrollen:

- **AAP** får alle svar, også `ESTIMAT`, med kvalitet og årsaker.
- **Veilederflatene** får bare fakta-delen når den er `SIKKER`. Ellers får de `UKJENT` med årsak, aldri et estimert antall dager. Tjenesten håndhever dette, ikke konsumenten.

### Faser

1. **AAP.** Spøkelse lager en ny modell av vedtakene fra `tbd.utbetaling` og gir ut det nye oppslaget. Bare Spleis-data brukes. Infotrygd-perioder fra sparkel brukes bare til å oppdage at Spleis' opptelling er utdatert. Vi måler hvor stor andel av oppslagene som ender i hver årsakskategori.
2. **Skyggesammenligning med Infotrygd.** `sparkel-sykepengeperioder-api` gir ut `is10_max`. Spøkelse sammenligner den med Spleis' beregning for personer med historikk i begge systemene, og logger avvik som metrikker, men bruker den ikke i svaret. Sammen med fagfolk avgjør vi ut fra tallene om Infotrygds maksdato skal brukes for personer som bare har vedtak i Infotrygd. Den vil i så fall aldri gi mer enn `ESTIMAT`.
3. **Modia personoversikt.** Personoversikt tar i bruk oppslaget bak en toggle. Først må fagpersoner gå manuelt gjennom et tilfeldig utvalg svar merket `SIKKER`, også personer med historikk i Infotrygd. Kravet er null feil i forbrukte dager. Personoversikt viser bare vår maksdato og bruker ikke `slutt` fra Sykepenger_v2.
4. **eSYFO.** Modia sykefraværsoppfølging går over til samme kilde, slik at to veilederflater ikke viser ulik maksdato for samme person.

## Brukerhistorier

### Felles for alle konsumenter

1. Som konsument vil jeg slå opp en person med fødselsnummer og få forbrukte og gjenstående sykepengedager, slik at jeg vet hvor mye av retten personen har brukt.
2. Som konsument vil jeg få vite hvilken dato tallene gjelder for (`vurdertTilOgMed`), slik at jeg ser hvor gammelt grunnlaget er.
3. Som konsument vil jeg få siste kjente utbetalte dag (`sisteKjenteUtbetalteDag`), slik at jeg ser hvor langt personen har fått utbetalt.
4. Som konsument vil jeg få vite at svaret bare bygger på fattede vedtak (`grunnlag: FATTEDE_VEDTAK`), slik at jeg forstår at søknader som venter og saker under behandling ikke er med.
5. Som konsument vil jeg at også vedtak uten utbetaling (avslag) er med i grunnlaget, slik at `vurdertTilOgMed` viser hvor langt Nav faktisk har vurdert, ikke bare hvor langt det er utbetalt.
6. Som konsument vil jeg få en estimert maksdato (`estimertMaksdato`), slik at jeg kan si omtrent når sykepengene tar slutt hvis personen fortsetter å være syk.
7. Som konsument vil jeg at den estimerte maksdatoen alltid ligger i samme objekt som forbrukte dager og `vurdertTilOgMed`, slik at jeg ikke kan hente den ut og vise den alene som et faktum.
8. Som konsument vil jeg at feltet heter `estimertMaksdato` og ikke `maksdato`, slik at ingen tror datoen er endelig.
9. Som konsument vil jeg at gjenstående dager og estimert maksdato tar hensyn til at retten er begrenset etter fylte 67 år og stopper ved 70 år, slik at jeg ikke viser for mange gjenstående dager for eldre personer.
10. Som konsument vil jeg få kvaliteten (`SIKKER`, `ESTIMAT` eller `UKJENT`) for fakta-delen og prognose-delen hver for seg, slik at jeg kan stole på tallene selv om datoen er usikker.
11. Som konsument vil jeg få maskinlesbare årsaker når svaret ikke er `SIKKER`, slik at jeg kan vise eller håndtere hver situasjon riktig.
12. Som konsument vil jeg få `INGEN_UTBETALING_SIDEN` med `sisteKjenteUtbetalteDag` når det er mer enn 26 uker siden siste utbetalte dag, slik at jeg ikke viser en gammel og misvisende maksdato.
13. Som konsument vil jeg at statusen for lang pause bare beskriver det vi vet, og ikke lover noe om rett ved ny sykdom, slik at jeg ikke gir borgeren feil forventninger. At personen ikke har fått utbetalt, betyr ikke at hen har vært arbeidsfør.
14. Som konsument vil jeg få et tydelig svar om at det ikke er registrert sykepenger når verken Spleis eller Infotrygd har noe på personen, slik at jeg skiller «ingenting» fra «vet ikke».
15. Som konsument vil jeg få `UKJENT` med årsak `KILDE_UTILGJENGELIG` når Infotrygd ikke svarer, slik at jeg aldri får «ingen sykepenger» bare fordi en kilde var nede.
16. Som konsument vil jeg få `UKJENT` med årsak `KUN_INFOTRYGD` når personen bare har vedtak i Infotrygd, slik at jeg vet at vi ikke kan regne ut dagene selv.
17. Som konsument vil jeg få årsak `NYERE_INFOTRYGD_UTBETALING` når Infotrygd har utbetalt etter siste vedtak i Spleis, slik at jeg vet at Spleis' opptelling er utdatert.
18. Som konsument vil jeg få `UKJENT` med årsak `INKONSISTENT_GRUNNLAG` hvis forbrukte dager er ulike på tvers av arbeidsgivere for samme `tom`, slik at jeg aldri får et tall som kan være feil.
19. Som konsument vil jeg at tallene kommer fra vedtaket med senest `tom`, slik at jeg får den nyeste vurderingen.
20. Som konsument vil jeg at en revurdering erstatter tidligere versjon av samme vedtak, slik at tallene ikke bygger på utdaterte vurderinger.
21. Som konsument vil jeg at annullerte utbetalinger ikke regnes med, slik at tallene ikke bygger på vedtak som er trukket tilbake.
22. Som konsument vil jeg slå opp personer uansett om de har sak i Spleis eller ikke, slik at jeg ikke trenger å vite på forhånd hvor personen er behandlet.

### AAP

23. Som AAP vil jeg få forbrukte dager, gjenstående dager og estimert maksdato også når svaret er `ESTIMAT`, slik at jeg kan prioritere saker selv om tallene ikke er helt sikre.
24. Som AAP vil jeg få Spleis' tall merket `ESTIMAT` med årsak `NYERE_INFOTRYGD_UTBETALING` når Infotrygd har utbetalt etter siste vedtak i Spleis, slik at jeg kan bruke tallet med forbehold.
25. Som AAP vil jeg få Spleis' tall merket `ESTIMAT` med årsak `KILDE_UTILGJENGELIG` når Infotrygd ikke svarer, slik at prioriteringen ikke stopper opp.
26. Som AAP vil jeg bruke den samme tilgangen til spøkelse som jeg har i dag, slik at jeg kommer raskt i gang.
27. Som AAP vil jeg få det nye oppslaget uten å vente på endringer i Spleis eller sporbar, slik at behovet mitt blir løst raskt.
28. Som AAP vil jeg at `/utbetalte-perioder-aap` virker som før, slik at det jeg har i dag ikke brekker.

### Veilederflatene (Modia personoversikt og senere Modia sykefraværsoppfølging)

29. Som veileder vil jeg bare se forbrukte dager og estimert maksdato når fakta-delen er `SIKKER`, slik at jeg aldri gir borgeren et tall som kan være feil.
30. Som veileder vil jeg se en forklaring når tallene ikke kan vises, slik at jeg kan si til borgeren hvorfor og henvise videre.
31. Som veileder vil jeg alltid se forutsetningen, for eksempel «Gjelder vedtak fattet t.o.m. <dato>», slik at jeg forklarer borgeren hva tallene bygger på.
32. Som veileder vil jeg se at maksdatoen er estimert og forutsetter sammenhengende sykdom, slik at borgeren ikke tror datoen er endelig.
33. Som Team Personoversikt vil jeg at tjenesten selv holder usikre tall unna meg, slik at en feil i vår kode ikke kan føre til at et estimat vises.
34. Som Team Personoversikt vil jeg ha én kilde til maksdato, slik at vi ikke må slå sammen Spleis og Infotrygd selv.
35. Som Team Personoversikt vil jeg ha en toggle for visningen, slik at vi raskt kan skru den av hvis vi oppdager feil.
36. Som Team Personoversikt vil jeg vite at tallene er verifisert av fagpersoner før vi viser dem, slik at vi ikke gjentar feilene fra 2021.
37. Som team eSYFO vil jeg kunne hente fra samme kilde senere, slik at sykefraværsoppfølging og personoversikt viser det samme for samme person.

### Team tbd

38. Som team tbd vil jeg se hvor stor andel av oppslagene som ender i hver årsakskategori, slik at vi vet hvor stort problemet med Infotrygd er.
39. Som team tbd vil jeg få en alarm når `INKONSISTENT_GRUNNLAG` oppstår, slik at feil i dataflyten blir undersøkt. Forbrukte dager telles per person og skal være like på tvers av arbeidsgivere.
40. Som team tbd vil jeg sammenligne Infotrygds maksdato med Spleis' beregning i produksjon uten å bruke den i svaret, slik at vi kan måle kvaliteten før vi bestemmer oss.
41. Som team tbd vil jeg avgjøre bruk av Infotrygds maksdato sammen med fagfolk ut fra målte tall, slik at vi ikke setter en grense for «godt nok» uten data.
42. Som team tbd vil jeg at Infotrygds maksdato aldri gir mer enn `ESTIMAT`, slik at vi ikke lover mer enn vi kan stå inne for.
43. Som fagperson vil jeg gå gjennom et tilfeldig utvalg svar merket `SIKKER` før veilederflatene tar dem i bruk, slik at vi vet at de er riktige.
44. Som fagperson vil jeg at utvalget har med personer med historikk i Infotrygd, slik at overgangen mellom systemene blir prøvd.

## Beslutninger om implementasjon

### Spøkelse

- Spøkelse eier oppslaget. Vi lager ingen ny app.
- Oppslaget er REST per person. Vi bruker ikke Kafka, fordi prognosen endrer seg med tiden uten at det skjer noen hendelse, og fordi vi vil samle logikken på ett sted.
- Utviklerne velger om oppslaget blir et eget endepunkt eller en del av et eksisterende. Kravet er at tjenesten selv sørger for at veilederflatene aldri får et usikkert tall, uansett mekanisme. Rollebasert filtrering med rollene vi har i dag (`aap-les`, `personoversikt-les`) er et akseptabelt valg.
- `/utbetalte-perioder-*` endres ikke.
- Spøkelse lager en ny modell av vedtakene fra `tbd.utbetaling`:
  - Både `utbetaling_utbetalt` og `utbetaling_uten_utbetaling` brukes. I dag lagres `utbetaling_uten_utbetaling` bare som rå melding.
  - For hvert vedtak lagres minst `tom`, `forbrukteSykedager`, `gjenståendeSykedager`, `foreløpigBeregnetSluttPåSykepenger` og siste utbetalte dag.
  - Nyeste versjon per `korrelasjonsId` gjelder, slik at revurderinger erstatter tidligere versjoner.
  - Annullerte utbetalinger regnes ikke med.
- Gjeldende vedtak per person er det fattede vedtaket med senest `tom`, også om det er et avslag.
- Hvis flere arbeidsgivere har vedtak med samme `tom`, kontrollerer spøkelse at forbrukte dager er like. Er de ulike, svarer spøkelse `UKJENT` med `INKONSISTENT_GRUNNLAG` og varsler. Dette er et tegn på feil, ikke en vanlig usikkerhet.
- Perioder innenfor arbeidsgiverperioden får ikke vedtak og kommer ikke på `tbd.utbetaling`. De bruker ikke av sykepengedagene og trengs ikke.
- Spøkelse henter Infotrygd-perioder fra `sparkel-sykepengeperioder-api`, slik det allerede gjør for `/utbetalte-perioder-aap`. I fase 1 brukes de bare til å avgjøre `KUN_INFOTRYGD` og `NYERE_INFOTRYGD_UTBETALING`.
- Hvis det har gått mer enn 26 uker siden `sisteKjenteUtbetalteDag`, svarer spøkelse med status `INGEN_UTBETALING_SIDEN` og ingen estimert maksdato.
- `estimertMaksdato` er Spleis' `foreløpigBeregnetSluttPåSykepenger` fra gjeldende vedtak. Den tar allerede hensyn til 248 dager, 60 dager etter fylte 67 år og 70-årsgrensen.
- Spøkelse registrerer en metrikk per årsakskategori per oppslag.

### Kvalitet

Fakta-delen er `SIKKER` når begge disse vilkårene er oppfylt:

1. Gjeldende vedtak er fra Spleis. Spleis har da beregnet med Infotrygd-historikken.
2. Infotrygd har ingen utbetalinger etter `vurdertTilOgMed` i gjeldende vedtak fra Spleis.

Ellers blir kvaliteten slik:

| Tilfelle | Årsak | AAP | Veilederflatene |
|---|---|---|---|
| Bare vedtak i Infotrygd | `KUN_INFOTRYGD` | `UKJENT` | `UKJENT` |
| Infotrygd har utbetalt etter siste vedtak i Spleis | `NYERE_INFOTRYGD_UTBETALING` | Spleis' tall som `ESTIMAT` | `UKJENT` |
| Infotrygd svarer ikke | `KILDE_UTILGJENGELIG` | Spleis' tall som `ESTIMAT` | `UKJENT` |
| Ulike forbrukte dager på tvers av arbeidsgivere | `INKONSISTENT_GRUNNLAG` | `UKJENT` | `UKJENT` |

Prognose-delen (`estimertMaksdato`) er alltid `ESTIMAT`. Veilederflatene får den bare når fakta-delen er `SIKKER`.

Vi sammenligner ikke med Infotrygds `is10_max` for å avgjøre `SIKKER`. Vi stoler ikke på kilden, og Spleis teller allerede de utbetalte dagene fra Infotrygd. Resultatet av skyggesammenligningen kan endre dette senere.

### Kontrakt

Formen på svaret, som et utkast. Feltnavn kan justeres, men innholdet er avgjort:

```json
{
  "status": "HAR_SYKEPENGER | INGEN_UTBETALING_SIDEN | INGEN_SYKEPENGER_REGISTRERT | UKJENT",
  "grunnlag": "FATTEDE_VEDTAK",
  "fakta": {
    "kvalitet": "SIKKER | ESTIMAT | UKJENT",
    "årsaker": ["NYERE_INFOTRYGD_UTBETALING"],
    "vurdertTilOgMed": "2026-10-15",
    "sisteKjenteUtbetalteDag": "2026-10-15",
    "forbrukteDager": 120,
    "gjenståendeDager": 128
  },
  "prognose": {
    "kvalitet": "ESTIMAT",
    "estimertMaksdato": "2027-04-13",
    "forutsetning": "SAMMENHENGENDE_SYKDOM"
  }
}
```

- Når veilederflatene får `UKJENT`, er tallene og `estimertMaksdato` ikke med i svaret.
- `begrensning` (ordinær rett, begrenset rett etter fylte 67 år eller 70-årsgrensen) er ikke med i første versjon. Feltet finnes ikke på `tbd.utbetaling` i dag og vil kreve endringer i Spleis og sporbar. Vi legger det til hvis veilederflatene etterspør det under verifiseringen.

### Sparkel (fase 2)

- `sparkel-sykepengeperioder-api` gir ut Infotrygds maksdato (`is10_max`) per periode. Spørringen leser allerede feltet, men verdien kastes i dag.
- Maksdatoen hører til en rad i `is_periode_10`. Det er ikke sikkert at en slik rad tilsvarer ett sykefraværstilfelle. Det må skyggesammenligningen ta hensyn til.

### Andre team

- Modia personoversikt bruker ikke `slutt` fra Sykepenger_v2 som maksdato. De viser bare tallene fra spøkelse, og alltid sammen med forutsetningen.
- eSYFO går over i en senere fase. Vi endrer ikke `sykepengedager-informasjon`.

## Beslutninger om testing

- En god test sender inn det spøkelse faktisk får utenfra og sjekker det konsumenten faktisk får tilbake. Den tester ikke klasser eller DAO-er inne i spøkelse hver for seg.
- **Hovedstedet for testing er spøkelse-API-et fra ende til ende.** Vi bygger på E2E-basen spøkelse har i dag, som starter hele appen med `naisfulTestApp`, en ekte Postgres og tokens med roller, og som sammenligner JSON-svar.
  - Inn går `tbd.utbetaling`-meldinger som JSON, slik de ligger på topicet, og falske svar fra Infotrygd.
  - Ut kommer JSON-svaret, med token som har rollen `aap-les` eller `personoversikt-les`.
- Det trengs to nye muligheter i koden for å teste dette:
  - Håndteringen av `tbd.utbetaling`-meldinger må kunne kalles uten Kafka.
  - Infotrygd-klienten må kunne byttes ut når appen settes opp.
- Testene skal dekke minst:
  - vedtak med utbetaling og vedtak uten utbetaling (avslag), og at det med senest `tom` gjelder
  - revurdering som erstatter tidligere versjon, og annullering
  - flere arbeidsgivere med like og ulike forbrukte dager
  - alle årsakskodene, og forskjellen mellom AAP og veilederflatene for hver av dem
  - mer enn 26 uker siden siste utbetalte dag
  - ingen data i noen av kildene
  - Infotrygd som feiler
  - at `/utbetalte-perioder-aap` gir samme svar som før
- Eksisterende tester av samme type er E2E-testene av `/grunnlag` og `/utbetalte-perioder*` i spøkelse.
- **Fase 2:** Den eksisterende API-testen i `sparkel-sykepengeperioder-api` utvides til å vise at maksdato er med i svaret.
- Verifiseringen fagpersonene gjør før veilederflatene tar i bruk tallene, er en manuell akseptansetest og ikke en automatisk test.

## Utenfor omfang

- Endringer i hvordan Spleis beregner maksdato.
- Feltet `begrensning` i første versjon.
- Å ta hensyn til søknader som venter, eller saker under behandling. Det dekkes av forutsetningen om fattede vedtak.
- Å si noe om rett ved ny sykdom etter en lang pause.
- Å bruke Infotrygds maksdato i svaret før skyggesammenligningen er ferdig og vurdert.
- Kafka-utsending av maksdato.
- Endringer i `sykepengedager-informasjon`, ditt-sykefravaer eller andre visninger for borgeren.
- Analyse av maksdato i datavarehuset (`dvh_sykp`). Den kan gjøres parallelt, men er ikke et krav.

## Andre merknader

- Maksdato fra Infotrygd ble fjernet fra Modia personoversikt i 2021 fordi den hadde for mange feil (OPP-1326). Det er grunnen til at veilederflatene ikke får estimater.
- Spleis sammenlignet sin maksdato med Infotrygds i rundt to uker i 2020. Sammenligningen ble fjernet, og vi kjenner ikke resultatet.
- Det er usikkert om en revurdering kan ende som `utbetaling_uten_utbetaling` og dermed etterlate en gammel versjon. Utviklerne må sjekke dette når modellen lages.
- Datoene i kontrakten (`vurdertTilOgMed`, `sisteKjenteUtbetalteDag`) er kjernen i hvordan svaret skal forstås. Uten dem gir verken forbrukte dager eller estimert maksdato mening.
