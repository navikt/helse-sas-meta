# Avslå dager etter oppholdskravet i sp-avslagsdager

[Tickets](../tickets/avslagsdager-oppholdskrav/) · [ADR 0005](../adr/0005-spleis-lagrer-vurderings-id-per-avslagsdag.md) · [ADR 0006](../adr/0006-sp-avslagsdager-sender-ikke-subsumsjoner.md)

## Problem

Saksbehandler kan ikke avslå enkeltdager fordi personen har oppholdt seg utenfor Norge eller EØS uten at et unntak gjelder (folketrygdloven § 8-9). I dag gjør Spleis dager med utenlandsopphold fra søknaden om til ukjente dager og gir varselet RV_SØ_8. Saksbehandler kan bare overstyre dagene til dagtypene som finnes, og ingen av dem gir avslag etter § 8-9. Vurderingen, hjemmelen og begrunnelsen blir ikke lagret noe sted der de kan vises og etterprøves.

## Løsning

Oppholdskravet er det første løpende vilkåret, altså et vilkår som vurderes for hver dag. Saksbehandler velger dager i dagoversikten i Speil, svarer på spørsmål om oppholdet og skriver en begrunnelse. Speil sender vurderingen til sp-avslagsdager. Appen utleder utfallet, lagrer vurderingen og sender to meldinger i samme transaksjon. `saksbehandlerhandling` går til spesialist, som legger handlingen i totrinnsvurderingen. `avslagsdager_endret` går til Spleis med vurderings-ID-en og alle dagene som er vurdert. Spleis lagrer hvilken vurdering som gjelder for hver dag, og revurderer periodene som overlapper.

Når Spleis beregner en periode, sender den behovet `Avslagsdager` med vurderings-ID-ene som gjelder i perioden, i samme runde som ytelsene. Løsningen gir dagene som er avslått. Spleis fyller avslagstidslinjen på behandlingen fra løsningen med kilden `sp-avslagsdager`, og dagene blir avviste dager med den nye begrunnelsen `Oppholdskrav`. Avslagsdagen gjelder personen. Spleis lagrer koblingen mellom dag og vurdering på personen, så alle yrkesaktiviteter får den samme dagen avslått, også de som kommer senere. Saksbehandler kan gjøre om et avslag med en ny vurdering der vilkåret er oppfylt. Ingen vurdering slettes.

Visningen av saksbehandlerhandlingen i Speil henter feltene fra sp-avslagsdager, slik visningen av manuell opptjening henter dem fra sp-vilkarsproving.

## Brukerhistorier

1. Som saksbehandler vil jeg velge én eller flere dager i dagoversikten og avslå dem etter § 8-9, slik at personen ikke får sykepenger for dager med opphold utenfor Norge eller EØS.
2. Som saksbehandler vil jeg kunne velge dager som ikke henger sammen, slik at jeg kan avslå akkurat de dagene personen var i utlandet.
3. Som saksbehandler vil jeg bare få tilbud om å avslå dager som ellers kunne gitt utbetaling, slik at jeg ikke avslår dager uten virkning.
4. Som saksbehandler vil jeg svare på om personen er EØS-borger, slik at riktig setning i første ledd blir vurdert.
5. Som saksbehandler vil jeg svare på om personen oppholdt seg i et område der oppholdskravet er oppfylt, slik at appen kan utlede utfallet etter første ledd.
6. Som saksbehandler vil jeg oppgi om et unntak i andre ledd gjelder, enten medlemskap etter §§ 2-5, 2-6 eller 2-8, eller innleggelse i helseinstitusjon, slik at dagene ikke avslås når unntaket gjelder.
7. Som saksbehandler vil jeg oppgi om oppholdet er godkjent etter tredje ledd, slik at dagene ikke avslås når personen har fått godkjent opphold på inntil fire uker.
8. Som saksbehandler vil jeg skrive en fritekstbegrunnelse, slik at beslutter og senere saksbehandlere forstår vurderingen.
9. Som saksbehandler vil jeg kunne legge ved journalposter, for eksempel søknaden om utenlandsopphold, slik at dokumentasjonen henger sammen med vurderingen.
10. Som saksbehandler vil jeg få en tydelig feilmelding når svarene ikke henger sammen eller noe mangler, slik at jeg kan rette det før vurderingen lagres.
11. Som saksbehandler vil jeg gjøre om et avslag ved å vurdere de samme dagene på nytt med et utfall der vilkåret er oppfylt, slik at feil kan rettes.
12. Som saksbehandler vil jeg at en omgjøring blir en ny saksbehandlerhandling, slik at historikken viser både avslaget og omgjøringen.
13. Som saksbehandler vil jeg at avslaget gjelder alle yrkesaktivitetene til personen, selv om jeg avslår fra dagoversikten til én av dem, slik at oppholdskravet vurderes én gang for personen.
14. Som saksbehandler vil jeg se de avslåtte dagene som avviste dager med begrunnelsen oppholdskrav i dagoversikten, slik at jeg ser at avslaget er tatt med i beregningen.
15. Som saksbehandler vil jeg se handlingen i listen over saksbehandlerhandlinger, slik at jeg vet hva jeg har gjort i saken.
16. Som beslutter vil jeg at avslaget krever totrinnsvurdering, slik at to personer har sett på et avslag som påvirker utbetalingen.
17. Som beslutter vil jeg åpne visningen av handlingen og se dagene, svarene, utfallet per vilkår, begrunnelsen og journalpostene, slik at jeg kan kontrollere vurderingen.
18. Som saksbehandler vil jeg at handlingen knyttes til behandlingen jeg jobbet i, slik at saksbildet viser den der den hører hjemme.
19. Som saksbehandler uten skrivetilgang vil jeg få nei når jeg prøver å avslå dager, slik at bare saksbehandlere med tilgang kan endre saken.
20. Som saksbehandler uten tilgang til personen vil jeg få nei både når jeg avslår og når jeg åpner visningen, slik at personvernet holder.
21. Som sp-avslagsdager vil jeg utlede vilkårsvurderingene fra svarene, slik at samme logikk gir utfall, visning og validering.
22. Som sp-avslagsdager vil jeg lagre hver vurdering som en ny rad med alle dagene, svarene, vilkårsvurderingene, begrunnelsen, journalpostene, saksbehandleren, tidspunktet og behandlingen, slik at vurderingen kan etterprøves uten subsumsjonsmeldinger.
23. Som saksbehandler vil jeg at den gjeldende vurderingen for en dag er den nyeste vurderingen som omfatter dagen, slik at en omgjøring erstatter avslaget uten at noe slettes.
24. Som sp-avslagsdager vil jeg lagre vurderingen og legge begge meldingene i outboxen i samme transaksjon, slik at spesialist og Spleis alltid får vite om vurderingen.
25. Som sp-avslagsdager vil jeg svare på behovet `Avslagsdager` med de avslåtte dagene i hver vurdering Spleis spør om, slik at Spleis får utfallet uten å lagre det selv.
26. Som sp-avslagsdager vil jeg svare med en tom liste når ingen av vurderingene har avslåtte dager, slik at Spleis kan gå videre.
27. Som Spleis vil jeg lagre vurderings-ID-en for hver dag i `avslagsdager_endret` på personen, slik at en ny vurdering erstatter den forrige for de samme dagene.
28. Som Spleis vil jeg at en behandling som opprettes etter meldingen, får vurderings-ID-ene for dagene sine, slik at en ny arbeidsgiver også får avslaget.
29. Som Spleis vil jeg spørre etter avslagsdagene med vurderings-ID-ene som gjelder i perioden, i samme runde som ytelsene, slik at utfallet alltid kommer fra sp-avslagsdager.
30. Som Spleis vil jeg fylle avslagstidslinjen fra løsningen og erstatte alle avslagsdager med kilden `sp-avslagsdager` i perioden, slik at en omgjøring fjerner avslaget.
31. Som Spleis vil jeg gjøre de avslåtte dagene om til avviste dager med begrunnelsen `Oppholdskrav`, slik at de ikke gir utbetaling og vedtaksbrevet viser hjemmelen.
32. Som Spleis vil jeg starte revurdering av perioder som overlapper dagene i `avslagsdager_endret`, slik at perioder som er beregnet eller utbetalt, får avslaget med.
33. Som Spleis vil jeg at en overstyring av tidslinjen ikke fjerner avslagsdager med kilden `sp-avslagsdager`, slik at sp-avslagsdager er eneste kilde for avslag etter § 8-9.
34. Som Spleis vil jeg at behovet `Avslagsdager` står bak en toggle, slik at vi kan rulle ut i dev før prod.
35. Som spesialist vil jeg ta imot `saksbehandlerhandling` med `handlingType` `AVSLAGSDAGER_ENDRET`, slik at handlingen lagres og legges i totrinnsvurderingen.
36. Som Speil vil jeg hente visningen av `AVSLAGSDAGER_ENDRET` fra sp-avslagsdager, slik at saksbehandler og beslutter ser detaljene.
37. Som utvikler vil jeg at opprydding-dev sletter vurderingene til en person i dev, slik at testpersoner kan brukes på nytt.

## Beslutninger om implementasjon

### sp-avslagsdager: domenet

- Domenet følger mønsteret for manuell opptjening i sp-vilkarsproving: svar inn, utledede vilkårsvurderinger ut. Hver vilkårsvurdering har vilkårskode, utfall (`Oppfylt` eller `IkkeOppfylt`), vurderingstidspunkt, kilde og lovreferanse.
- Lovreferansen har samme form som i sp-vilkarsproving: `lov`, `paragraf`, `avsnitt`, `setning`, `bokstav` og `iKraftFra`.
- Vilkårskodene for § 8-9:

  | Vilkårskode | Lovreferanse |
  |---|---|
  | `OPPHOLD_I_NORGE_EØS_ELLER_AVTALELAND` | § 8-9 første ledd, første setning |
  | `OPPHOLD_I_NORGE_IKKE_EØS_BORGER` | § 8-9 første ledd, andre setning |
  | `UNNTAK_MEDLEM_ETTER_2_5_2_6_2_8` | § 8-9 andre ledd, bokstav a |
  | `UNNTAK_INNLAGT_HELSEINSTITUSJON` | § 8-9 andre ledd, bokstav b |
  | `UNNTAK_GODKJENT_OPPHOLD_INNTIL_FIRE_UKER` | § 8-9 tredje ledd |

- Svarene og hvordan vilkårsvurderingene utledes:
  1. `eøsBorger` velger vilkårskoden for første ledd. Ja gir `OPPHOLD_I_NORGE_EØS_ELLER_AVTALELAND`, og nei gir `OPPHOLD_I_NORGE_IKKE_EØS_BORGER`.
  2. `oppholdIGodkjentOmråde` gir utfallet for første ledd. Er det oppfylt, vurderes ikke andre og tredje ledd.
  3. `unntakAndreLedd` er påkrevd når første ledd ikke er oppfylt. `MEDLEM_ETTER_2_5_2_6_2_8` eller `INNLAGT_I_HELSEINSTITUSJON` gir den tilhørende vilkårskoden oppfylt, og tredje ledd vurderes ikke. `INGEN` gir begge vilkårskodene i andre ledd ikke oppfylt.
  4. `godkjentOppholdInntilFireUker` er påkrevd når `unntakAndreLedd` er `INGEN`. Svaret gir utfallet for tredje ledd.
  5. Det samlede utfallet er `Oppfylt` når første ledd eller ett av unntakene er oppfylt. Ellers er det `IkkeOppfylt`.
- Appen holder ikke regnskap med de fire ukene i løpet av tolv måneder etter tredje ledd. Saksbehandler vurderer det selv.
- En vurdering har ID, fødselsnummer, `behandlingId`, dagene, svarene, vilkårsvurderingene, det samlede utfallet, fritekstbegrunnelsen, journalpost-ID-ene, saksbehandlerens ident og vurderingstidspunktet. Hver vurdering er en ny rad, og ingen rader endres eller slettes, unntatt i opprydding-dev.
- Den gjeldende vurderingen for en dag er den nyeste som omfatter dagen. En dag er en avslagsdag når den gjeldende vurderingen har utfallet `IkkeOppfylt`. Spleis holder rede på hvilken vurdering som gjelder, ut fra rekkefølgen på `avslagsdager_endret` (ADR 0005). Meldingene har fødselsnummeret som nøkkel og kommer derfor i rekkefølge.
- Appen validerer ikke dagtypen, fordi den ikke kjenner tidslinjen. Speil sørger for at bare relevante dager kan velges.

### sp-avslagsdager: REST

Endepunktene bruker rammeverket fra sp-vilkarsproving, med OpenAPI og `KallKontekst.medPerson`. `personId` er personens pseudo-ID.

- `POST /api/personer/{personId}/vurderinger/oppholdskrav`, med `Tilgang.Skriv`.
  - Request:
    - `behandlingId: UUID`
    - `dager: List<LocalDate>` (minst én dag, uten duplikater)
    - `eøsBorger: Boolean`
    - `oppholdIGodkjentOmråde: Boolean`
    - `unntakAndreLedd: String?` (`MEDLEM_ETTER_2_5_2_6_2_8`, `INNLAGT_I_HELSEINSTITUSJON` eller `INGEN`)
    - `godkjentOppholdInntilFireUker: Boolean?`
    - `fritekstbegrunnelse: String` (kan ikke være tom)
    - `journalpostId: List<String>` (kan være tom, samme navn som i sp-vilkarsproving)
  - Response 200: `{ "vurderingId": UUID }`.
  - Feil:
    - `PersonIkkeFunnet` (404)
    - `ManglerTilgang` (403)
    - `DagerMangler` (400)
    - `UnntakAndreLeddMangler` (400)
    - `GodkjentOppholdInntilFireUkerMangler` (400)
    - `FritekstbegrunnelseMangler` (400)
- `GET /api/personer/{personId}/saksbehandlerhandlinger/{handlingId}/visning`, med `Tilgang.Les`.
  - `handlingId` er vurderings-ID-en. Svarer 404 når vurderingen ikke finnes eller gjelder en annen person.
  - Response: `{ "felter": [ ... ] }` med feltene `TEKST` (`tittel`, `tekst`) og `LISTE` (`tittel`, `elementer`), som i sp-vilkarsproving.
  - Feltene, i denne rekkefølgen:
    - dagene, som en liste med sammenhengende perioder
    - utfallet
    - vilkårsvurderingene med lovreferanse og utfall, som en liste
    - fritekstbegrunnelsen
    - journalpostene, som en liste

### sp-avslagsdager: rapid

Meldingene publiseres gjennom en outbox med leader election, kopiert fra sp-vilkarsproving. Begge bruker fødselsnummeret som nøkkel.

- `saksbehandlerhandling` (ut, til spesialist):
  - `fødselsnummer: String`
  - `saksbehandlerIdent: String`
  - `handlingId: UUID` (vurderings-ID-en)
  - `handlingType: "AVSLAGSDAGER_ENDRET"`
  - `kreverTotrinnsvurdering: true`
  - `tidspunkt: Instant`
  - `behandlingId: UUID`
  - Ikke `skjæringstidspunkt`.
- `avslagsdager_endret` (ut, til Spleis):
  - `fødselsnummer: String`
  - `vurderingId: UUID`
  - `perioder: List<{ "fom": LocalDate, "tom": LocalDate }>`, alle dagene i vurderingen gruppert til sammenhengende perioder. Meldingen har ikke utfallet.
- Behovet `Avslagsdager` (inn, fra Spleis):
  - Inn: `fødselsnummer: String` og `Avslagsdager.vurderingIder: List<UUID>` (minst én).
  - Løsning: `@løsning.Avslagsdager.avslagsdager`, en liste med `{ "vurderingId": UUID, "dato": LocalDate, "vilkårskoder": List<String> }`. Listen har én oppføring per dag i hver vurdering der det samlede utfallet er `IkkeOppfylt`. `vilkårskoder` er vilkårskodene med utfall `IkkeOppfylt` i vurderingen. Vurderinger med utfallet `Oppfylt` gir ingen oppføringer. Er det ingen avslåtte dager, er listen tom.
  - En ukjent vurderings-ID er en feil. Appen svarer ikke, og feilen logges.

### sp-avslagsdager: database og drift

- Nye tabeller for vurderinger og dagene i hver vurdering. Behovet slår opp på vurderings-ID.
- opprydding-dev sletter vurderingene til personen før den publiserer `person_slettet`.
- Ingen subsumsjonsmeldinger (ADR 0006).

### Spleis

- Ny `Begrunnelse.Oppholdskrav` med hjemmel § 8-9. Den mappes ut overalt der `AvslåttMeldingTilNavDag` mappes ut: dto, hendelser, behandlings-API, Spanner og Speil-API.
- Ny river for `avslagsdager_endret`. Spleis lagrer koblingen mellom dag og vurderings-ID på personen. For hver dag i `perioder` erstatter den nye vurderings-ID-en den forrige. Spleis starter så revurdering av vedtaksperioder som overlapper dagene, for alle yrkesaktiviteter.
- Koblingen kopieres til behandlingen når en behandling opprettes eller revurderes, for dagene i perioden. Det gjelder også behandlinger som opprettes etter meldingen. Behandlingen lagrer vurderings-ID-ene den bygde på.
- Nytt behov `Avslagsdager` i samme runde som ytelsene, med de forskjellige vurderings-ID-ene som gjelder for dagene i perioden. Har ingen dager i perioden en vurderings-ID, sendes ikke behovet. Behovet står bak en ny toggle.
- Avslagstidslinjen på behandlingen fylles fra løsningen. Spleis tar bare med dager i perioden der vurderings-ID-en i løsningen er den som gjelder for dagen. Avslagsdager med kilden `sp-avslagsdager` i perioden erstattes. Alle vilkårskodene for § 8-9 gir `Begrunnelse.Oppholdskrav`. En ukjent vilkårskode er en feil, og Spleis går ikke videre med løsningen.
- `OverstyrTidslinje` fjerner bare avslagsdager med kilden `Saksbehandler`. Avslagsdager med kilden `sp-avslagsdager` blir liggende (ADR 0005).
- Rapid-ACL for sp-avslagsdager finnes allerede.

### Spesialist

- Ny `HandlingType.AVSLAGSDAGER_ENDRET` i domenet, `ApiHandlingType` og mappingen mellom dem. `SaksbehandlerhandlingRiver` godtar den nye verdien.
- Begrunnelsen for avviste dager kommer fra Spleis' API for Speil gjennom spesialist-klienten til snapshotet (`ApiDag`). Spleis sender den nye verdien som `Oppholdskrav` i `BegrunnelseDTO`. Spesialist legger til `Oppholdskrav` i begrunnelsene i klienten, `OPPHOLDSKRAV` i `ApiDag` og mappingen mellom dem. Spesialist må ha dette i drift før togglen i Spleis skrus på, ellers kan ikke snapshotet leses.

### Speil

- Ny backend `avslagsdager` med proxy-ruter, orval-klient fra OpenAPI-spesifikasjonen og outbound og scope i `deploy/{dev,prod}.yml`. Først bare i dev.
- I dagoversikten kan saksbehandler velge dager og åpne et skjema for avslag etter § 8-9 med spørsmålene, begrunnelsen og journalpostene. Skjemaet sender `POST` til sp-avslagsdager med `behandlingId` til behandlingen som vises. Avslaget sendes i et eget kall, ikke sammen med overstyringen av tidslinjen til spesialist.
- Speil viser `Oppholdskrav` som tekst for avviste dager.
- `AVSLAGSDAGER_ENDRET` får tekst i listen over saksbehandlerhandlinger og henter visningen fra `avslagsdager`.

### Rekkefølge for utrulling

1. sp-avslagsdager tar imot vurderinger, svarer på behovet og sender meldingene.
2. Spesialist godtar `AVSLAGSDAGER_ENDRET`. Dette må være ute før appen sender sin første `saksbehandlerhandling`, ellers feiler riveren.
3. Spleis tar imot `avslagsdager_endret` og sender behovet bak toggle, først i dev.
4. Speil, først i dev.

## Beslutninger om testing

- Gode tester sjekker ytre oppførsel: HTTP inn og ut, meldinger og behov på rapiden, innholdet i databasen og tidslinjen i Spleis. De sjekker ikke interne klasser.
- **sp-avslagsdager, domenet.** Enhetstester av utledningen fra svar til vilkårsvurderinger og samlet utfall, for hver gren: første ledd oppfylt, hvert av unntakene i andre ledd, tredje ledd oppfylt og ikke oppfylt, og ugyldige kombinasjoner av svar. Tester å bygge videre på: `ManuellOpptjeningsvurderingTest`.
- **sp-avslagsdager, REST.** Testene kaller endepunktene gjennom Ktor-appen og sjekker svaret, databasen og outboxen. De dekker gyldig avslag, omgjøring, hver valideringsfeil, 401 uten token, 403 uten skrivetilgang og 403 når tilgangsmaskinen avslår. Visningen testes for avslag og omgjøring, ukjent `handlingId` og en vurdering som gjelder en annen person. Tester å bygge videre på: testene i `infra/rest` og `OpptjeningsvurderingManuellVurderingE2ETest` i sp-vilkarsproving.
- **sp-avslagsdager, rapid.** Testene sender behovet `Avslagsdager` og sjekker løsningen. De dekker én og flere vurderings-ID-er, en vurdering med utfallet `Oppfylt` og en ukjent vurderings-ID. Databasen er ekte Postgres. Tester å bygge videre på: riverstestene i `infra/kafka` i sp-vilkarsproving.
- **Spleis, e2e i sykepenger-model.** Testene sender `avslagsdager_endret`, svarer på behovet med testløsninger og sjekker vurderings-ID-ene i behovet og utbetalingstidslinjen. De dekker:
  - avslag i en periode før beregning
  - avslag etter utbetaling, som gir revurdering
  - omgjøring
  - to arbeidsgivere, der begge får dagen avslått
  - en ny periode etter avslaget, som får avslaget gjennom behovet
  - en overstyring av tidslinjen som ikke fjerner avslaget
  - toggle av og på

  Tester å bygge videre på: `AvslåttMeldingTilNavdagTest` og `EndretVurderingPåSkjæringstidspunktTest`.
- **Spleis, behovkontrakt.** Det nye behovet legges inn i `BehovkontraktTest`.
- **Spesialist.** Riverstesten for `saksbehandlerhandling` får et tilfelle med `AVSLAGSDAGER_ENDRET`.
- **Speil.** Komponenttester for skjemaet: validering, svar som vises eller skjules, og kallet som sendes.

## Utenfor omfang

- Automatisk vurdering av § 8-9, for eksempel ut fra utenlandsopphold i søknaden.
- Regnskap med de fire ukene i løpet av tolv måneder etter tredje ledd.
- Andre løpende vilkår enn § 8-9.
- Å flytte `AvslattMeldingTilNavdag` fra overstyringen av tidslinjen til sp-avslagsdager.
- Et eget sted i Speil for løpende vilkår på personnivå. Avslaget gjøres fra dagoversikten til én yrkesaktivitet til designer har sett på det.
- Subsumsjonsmeldinger (ADR 0006).

## Andre merknader

- Begrepene følger `GLOSSARY.md`: løpende vilkår, avslagsdag og vurdering av løpende vilkår.
- ADR 0005 forklarer hvorfor Spleis bare lagrer vurderings-ID per dag og henter utfallet med et behov. ADR 0006 forklarer hvorfor appen ikke sender subsumsjonsmeldinger.
- I dag gir utenlandsopphold i søknaden ukjente dager og varselet RV_SØ_8, og Spleis logger subsumsjonen § 8-9 første ledd som ikke oppfylt. Det endres ikke.
- Åpent spørsmål: Teksten på spørsmålene og svaralternativene i skjemaet skal avklares med designer. Feltnavnene i kontrakten står seg uansett.
- Åpent spørsmål: Skal Spleis logge en subsumsjon for avviste dager med begrunnelsen `Oppholdskrav`, slik den gjør for andre avviste dager? Det må vi sjekke i Spleis før implementasjonen.
- Åpent spørsmål: Trenger Speil et endepunkt som gir gjeldende vurdering per dag, for eksempel for å fylle ut skjemaet ved omgjøring? Vi lar det vente til vi ser behovet.
- Spesialist må ha `AVSLAGSDAGER_ENDRET` i drift før sp-avslagsdager sender sin første `saksbehandlerhandling`. Ellers blir meldingen avvist.
