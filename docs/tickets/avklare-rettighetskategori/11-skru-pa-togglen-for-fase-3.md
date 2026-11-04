# 11: Skru på togglen for fase 3

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 3

**Repo:** `spleis`, `sp-rettighetskategori`

**Hva er laget:** Fase 3 er prøvd med togglen på i dev. `Toggle.ValidereRettighetskategori` og miljøvariabelen `VALIDERE_RETTIGHETSKATEGORI` er fjernet, og oppførselen med togglen på er permanent og rullet ut i prod. Spleis bruker rettighetskategorien i `AvventerRettighetskategori` og `AvventerHistorikk`, og beholder RV_SØ_53 for søknader som fortsatt skal forkastes ved mottak. Ikke alle personer trenger å ha fått backfill før aktivering, fordi oppslag på ukjente ID-er kjører backfill. Backfill beholdes til ticket 12.

**Blokkeres av:** [09: Forkaste kombinerte rettighetskategorier i Spleis](09-forkaste-kombinerte-kategorier.md), [10: Konsistenssjekk av rettighetskategori i `AvventerHistorikk`](10-konsistenssjekk-i-avventer-historikk.md)

**Status:** ferdig

## Akseptansekriterier

- [x] Togglen og miljøvariabelen er fjernet. Dagens oppførsel med togglen på er permanent, og testene bruker ikke togglen.
- [ ] Scenarioene fra specen er verifisert ende til ende i dev med ekte søknader: bare AT, bare SN, AT og SN som overlapper skjæringstidspunktet, AT og SN som ligger inntil hverandre med samme skjæringstidspunkt, selvstendig forlengelse av et arbeidstakertilfelle og forlengelse av et vilkårsgrunnlag fra før fase 1.
- [x] Vi har tall for forkastinger med RV_SØ_53 før fase 3 aktiveres i prod.
- [x] Backfill er rullet ut i prod, og spørsmålet om forkastede perioder er avklart, se ticket 08.
- [x] Endringen er deployet og fase 3 er aktiv i prod.
- [ ] Forkastinger med RV_RK_1, RV_RK_2 og RV_SØ_53 til sammen etter aktivering er sammenlignet med forkastingene med RV_SØ_53 fra før, og avvikene er forklart. Vi teller forkastede sykefraværstilfeller, ikke perioder eller varsler. RV_RK_1 gis bare til perioden som utløser forkastingen, se avviket dokumentert i ticket 09. RV_RK_3 er et varsel, ikke en forkasting, og inngår ikke i summen. Avviket for perioder som ligger inntil hverandre, er beskrevet i specen.
- [ ] Vi følger med på `RettighetskategoriResultat` som går til spleis-api, og på behov som ikke blir besvart.
- [x] Ingen hovedkategori er lagret i Spleis. Person-JSON-en har bare rettighetskategori-ID-en.
- [ ] En kompatibel versjon for tilbakerulling er valgt. Ved tilbakerulling med togglen av kan perioder som venter på `RettighetskategoriResultat`, gå videre ved påminnelse.

## Status før fjerning av togglen

Togglen er på i dev. Teamet har kjørt ende-til-ende-scenarioer med to søknader samtidig, med den første perioden til godkjenning før den andre søknaden kommer, og med vedtak på den første før den andre kommer. Det finnes en baseline for RV_SØ_53. Dette bekrefter ikke at alle scenarioene i akseptansekriteriene er gjennomført.

Ticket 08 dokumenterer backfill i prod og kontroll av et utvalg hovedkategorier, også der bare forkastede perioder bruker vilkårsgrunnlaget.

## Implementert

Togglen er fjernet fra produksjonskode, tester og dev-manifestet. Forkastingen med RV_RK_1, konsistenssjekken med RV_RK_2, varselet RV_RK_3 og de gjenværende sjekkene for RV_SØ_53 bruker nå oppførselen som tidligere var bak togglen. Nye ytelsesbehov inneholder alltid `RettighetskategoriResultat`. Null-håndteringen for svar på eldre behov er beholdt.

Endringene er gjennomgått etter rebasen 4. november og beholder den avtalte oppførselen. Den nye kontrakttesten for graderte andre ytelser manglet `RettighetskategoriResultat` blant forventede behov; denne forventningen er lagt til uten å endre produksjonskoden.

Etter rebasen passerer 119 målrettede modelltester og 14 mappingtester for ytelser. `BehovkontraktTest` og `PåminnelserTest` kompilerer, men de 20 databaseavhengige testene stopper ved databaseoppstart fordi agentmiljøet nekter Docker-tilgang. Kontrakttestrettingen må derfor bekreftes ved kjøring i et miljø med Docker-tilgang.

Teamet bekreftet 4. november 2026 at endringen er rullet ut i prod, og ba om å lukke ticketen. Ticketen er ferdig. Uavkryssede kontrollpunkter er ikke dokumentert som gjennomført her og beholdes som oppfølging.

## Aktivering og tilbakerulling

Fase 3 er aktivert i prod ved ordinær deploy av kodeendringen, uten en egen toggle-aktivering. Før/etter-sammenligning og observasjon følges opp av teamet.

Etter fjerningen kan fase 3 ikke slås av med en miljøvariabel. Ved behov deployer vi en kjent kompatibel versjon som fortsatt har `ValidereRettighetskategori`, med togglen av. Versjonen må støtte rettighetskategori-ID-er, minimale vilkårsgrunnlag og `AVVENTER_RETTIGHETSKATEGORI`. Vi går ikke tilbake til en versjon fra før disse ble innført. Påminnelse kan da sende ytelsesbehovet på nytt uten `RettighetskategoriResultat`.

Behov som ble sendt før aktiveringen uten `RettighetskategoriResultat`, kan fortsatt besvares og behandles. Denne overgangskompatibiliteten beholdes. Ubesvarte nye behov sendes på nytt ved påminnelse, som før.

## Kjent risiko som følges opp separat

Hullet med svar for utdaterte søknadssett fra ticket 09 rettes ikke i denne oppgaven. En periode kan spørre med én søknad og så spørre på nytt med både AT og SN. Kommer svaret på det første behovet først, kan Spleis ta det imot fordi vedtaksperiode og skjæringstidspunkt stemmer. Perioden går videre, og svaret med kombinasjonen ignoreres fordi perioden har forlatt `AvventerRettighetskategori`.

`KombinertTest` dokumenterer AT-først-varianten, der perioden senere forkastes med RV_IV_13 i stedet for RV_RK_1 før vilkårsprøving. Ticket 09 beskriver også at SN først, fulgt av AT uten inntektsmelding, kan feile med «Fant ikke noen periode i forventet tilstand». SN-først-varianten er ikke bekreftet med en egen kjøring i denne oppgaven. Risikoen beholdes etter uttrykkelig avgrensning av toggle-fjerningen.
