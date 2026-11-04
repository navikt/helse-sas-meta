# Fastsette sykepengegrunnlag i sp-sykepengegrunnlag

[Tickets](../tickets/fastsette-sykepengegrunnlag/) · [ADR 0008](../adr/0008-inntekt-og-sykepengegrunnlag-er-to-domenetjenester.md) · [ADR 0009](../adr/0009-avviksvurderingen-gjores-nar-grunnlaget-fastsettes.md) · [ADR 0010](../adr/0010-pensjonsgivende-inntekt-hentes-fra-sigrun.md) · [Spec: avklare inntekt](avklare-inntekt.md)

## Problem

Sykepengegrunnlaget er spredt på fire tjenester:

- Spleis fastsetter det, i objektet `Inntektsgrunnlag`.
- Spinnvill gjør avviksvurderingen, men først når Spesialist får godkjenningsbehovet. Den knyttes til Spleis' `vilkårsgrunnlagId`, som endres hver gang Spleis kopierer vilkårsgrunnlaget.
- Spesialist lagrer skjønnsfastsettelsen og begrunnelsen, og lager varselet om avvik.
- Spregulering finner grunnlag med feil grunnbeløp ved å se på 6G i `utkast_til_vedtak`, og ber Spleis regulere.

Ingen tjeneste eier sykepengegrunnlaget og historikken. Det er vanskelig å se hva et vedtak bygde på, og hver endring må gjøres i flere repoer. For selvstendig næringsdrivende bygger grunnlaget på tall som sykepengesoknad-backend har lagt på søknaden, og de kan ikke hentes på nytt. Kombinerte kategorier, Inaktiv, dagpenger, frilansere og vernepliktige skal få egne regler for grunnlaget senere, og det er ikke noe sted å bygge dem.

## Løsning

En ny tjeneste, sp-sykepengegrunnlag, fastsetter sykepengegrunnlaget én gang per skjæringstidspunkt ut fra rettighetskategorien og inntektsavklaringen fra sp-inntekt. Tjenesten eier avviksvurderingen, skjønnsfastsettelsen og grunnbeløpsreguleringen. Skjønnsfastsettelsen er det eneste stedet tjenesten tar imot tall fra saksbehandler. Korrigerte inntekter og deaktiverte arbeidsforhold hører til inntektsavklaringen.

Spleis får en ny tilstand, `AvventerSykepengegrunnlag`, etter `AvventerRettighetskategori`. Der spør Spleis tjenesten og får tilbake en sykepengegrunnlag-ID. Spleis lagrer bare ID-en i vilkårsgrunnlaget. Når Spleis beregner, henter den tallene med behovet `SykepengegrunnlagResultat` i `AvventerHistorikk`.

I første versjon fastsetter tjenesten bare for arbeidstakere og selvstendig næringsdrivende. For arbeidstakere skal resultatet være det samme som i dag. For selvstendig næringsdrivende bygger grunnlaget på pensjonsgivende inntekt som sp-inntekt har hentet fra Sigrun, ikke på tallene på søknaden.

Alle endringer som starter i tjenesten, altså skjønnsfastsettelse og grunnbeløpsregulering, gir hendelsen `endret_sykepengegrunnlag`, og Spleis revurderer. Endringer i inntektsavklaringen går gjennom Spleis (se specen for inntektsavklaring). Et nytt sykepengegrunnlag lages bare når resultatet endres.

Godkjenningsbehovet og `avsluttet_med_vedtak` får sykepengegrunnlag-ID-en, og Spesialist henter dataene fra tjenesten. `vedtak_fattet` fra Spesialist blir som før.

Alle vilkårsgrunnlag får en sykepengegrunnlag-ID, også de som finnes fra før. Tjenesten lager grunnlagene bak de gamle ID-ene med backfill fra spleis-api, Spinnvill og Spesialist.

### Faser

Fasene er felles med sp-inntekt og står i [specen for inntektsavklaring](avklare-inntekt.md#faser). For sp-sykepengegrunnlag betyr de dette:

1. Ingenting. sp-inntekt rulles ut først.
2. **Backfill og skyggekjøring.** Spleis går gjennom `AvventerSykepengegrunnlag` og spør `SykepengegrunnlagResultat` i `AvventerHistorikk` med den deterministiske ID-en, uten å bruke svaret. Oppslaget gir backfill av grunnlaget fra Spleis. Tjenesten sammenligner det med sin egen fastsettelse for samme skjæringstidspunkt og logger forskjeller. Vi går ikke videre før skyggekjøringen er stille for arbeidstakere over tid.
3. **Bytte.** Spleis bruker svaret på `SykepengegrunnlagResultat` i beregningen. Tjenesten gjør avviksvurderingen og tar imot skjønnsfastsettelser. Spesialist slutter å sende `Avviksvurdering`. Grunnbeløpsreguleringen skrus på i tjenesten, og Spregulering skrus av.
4. **Rydde opp.** Backfill, `Inntektsgrunnlag` i Spleis, Spinnvill, Spregulering, `sykepengegrunnlagsfakta` i hendelsene fra Spleis og skjønnsfastsettelsen i Spesialist fjernes.

## Brukerhistorier

### Spleis

1. Som Spleis vil jeg få fastsatt sykepengegrunnlaget for et skjæringstidspunkt før vilkårsprøving, slik at grunnlaget har én eier.
2. Som Spleis vil jeg gå gjennom `AvventerSykepengegrunnlag` på vei fra `AvventerRettighetskategori`, slik at alle sykefraværstilfeller som skal vilkårsprøves eller revurderes med nye inntekter, får et grunnlag.
3. Som Spleis vil jeg sende skjæringstidspunktet, inntektsavklarings-ID-en og rettighetskategori-ID-en i behovet, slik at tjenesten ikke trenger noe annet fra meg.
4. Som Spleis vil jeg lagre bare sykepengegrunnlag-ID-en i vilkårsgrunnlaget, slik at tjenesten er den eneste eieren av grunnlaget.
5. Som Spleis vil jeg hente tallene beregningen trenger med `SykepengegrunnlagResultat` i `AvventerHistorikk`, slik at jeg ikke har en egen kopi som kan bli utdatert.
6. Som Spleis vil jeg få fastsatt årsinntekt per yrkesaktivitet, sykepengegrunnlaget, 6G og grunnbeløpet i svaret, slik at beregningen av dagsatsen, 6G-begrensningen og minsteinntekten virker som i dag.
7. Som Spleis vil jeg lage varselet RV_IV_2 når svaret sier at grunnlaget må skjønnsfastsettes, slik at saksbehandler får beskjed som i dag.
8. Som Spleis vil jeg forkaste sykefraværstilfellet med RV_IV_12 når grunnlaget ikke kan fastsettes fordi selvstendig næringsdrivende mangler pensjonsgivende inntekt, slik at saken går til Infotrygd som i dag.
9. Som Spleis vil jeg forkaste med RV_IV_13 når en selvstendig næringsdrivende har inntekt fra et arbeidsforhold på skjæringstidspunktet, slik at kombinerte saker går til Infotrygd som i dag.
10. Som Spleis vil jeg revurdere når jeg får `endret_sykepengegrunnlag`, slik at skjønnsfastsettelser og grunnbeløpsregulering slår gjennom i utbetalingen.
11. Som Spleis vil jeg sende sykepengegrunnlag-ID-en i godkjenningsbehovet og `avsluttet_med_vedtak`, slik at Spesialist kan hente dataene selv.
12. Som Spleis vil jeg gi alle eksisterende vilkårsgrunnlag en deterministisk sykepengegrunnlag-ID med en JSON-migrering, slik at ingen skjæringstidspunkt mangler ID.
13. Som Spleis vil jeg slutte å ta imot `skjønnsmessig_fastsettelse` og `grunnbeløpsregulering` etter byttet, slik at grunnlaget bare kan endres i tjenesten.
14. Som Spleis vil jeg sende behovene på nytt ved påminnelse når de ikke er besvart, slik at midlertidige feil i tjenesten ikke stopper saken.
15. Som utvikler vil jeg at Spleis lager sitt eget `Inntektsgrunnlag` fram til opprydningen, slik at vi kan sammenligne og gå tilbake.

### Fastsettelse

16. Som sp-sykepengegrunnlag vil jeg slå opp inntektsavklaringen i sp-inntekt og rettighetskategorien med `RettighetskategoriResultat`, slik at jeg har alt jeg trenger for å fastsette grunnlaget.
17. Som sp-sykepengegrunnlag vil jeg regne om månedsinntekten for hver arbeidsgiver til årsinntekt på samme måte som Spleis, slik at resultatet blir det samme for arbeidstakere.
18. Som sp-sykepengegrunnlag vil jeg bruke den korrigerte inntekten fra inntektsavklaringen i stedet for inntekten fra inntektsmeldingen eller a-ordningen, slik at saksbehandlers korrigering slår gjennom.
19. Som sp-sykepengegrunnlag vil jeg holde deaktiverte arbeidsforhold utenfor grunnlaget, slik at de ikke gir inntekt.
20. Som sp-sykepengegrunnlag vil jeg fastsette grunnlaget for selvstendig næringsdrivende etter § 8-35 med pensjonsgivende inntekt fra inntektsavklaringen og grunnbeløpet på skjæringstidspunktet, slik at grunnlaget bygger på Sigrun.
21. Som sp-sykepengegrunnlag vil jeg begrense sykepengegrunnlaget til 6G ut fra grunnbeløpet på skjæringstidspunktet, slik at begrensningen er som i dag.
22. Som sp-sykepengegrunnlag vil jeg svare med utfallet «ikke fastsatt» og en årsak når grunnlaget ikke kan fastsettes, slik at Spleis kan forkaste med riktig varsel.
23. Som sp-sykepengegrunnlag vil jeg la behovet være ubesvart og logge feil når hovedkategorien er en jeg ikke kan fastsette for, slik at vi oppdager det i stedet for å fastsette feil grunnlag.
24. Som sp-sykepengegrunnlag vil jeg gi samme ID tilbake når en ny fastsettelse gir samme resultat som den gjeldende, slik at Spleis ikke revurderer uten grunn.
25. Som sp-sykepengegrunnlag vil jeg lagre hver fastsettelse med inntektsavklarings-ID-en, rettighetskategori-ID-en, tidspunktet og kodeversjonen, slik at vi kan se hva grunnlaget bygde på.

### Avviksvurdering

26. Som sp-sykepengegrunnlag vil jeg gjøre avviksvurderingen når jeg fastsetter grunnlaget for arbeidstakere, slik at avviket er kjent før beregningen.
27. Som sp-sykepengegrunnlag vil jeg sammenligne summen av omregnet årsinntekt med sammenligningsgrunnlaget fra inntektsavklaringen, slik at regelen er som i Spinnvill.
28. Som sp-sykepengegrunnlag vil jeg regne et avvik på mer enn 25 % som for stort, slik at grensen er som i dag.
29. Som sp-sykepengegrunnlag vil jeg beholde avviksvurderingen og skjønnsfastsettelsen når summen av omregnet årsinntekt er endret med mindre enn én krone, slik Spinnvill gjør i dag.
30. Som sp-sykepengegrunnlag vil jeg fjerne skjønnsfastsettelsen og vurdere avviket på nytt når summen er endret med én krone eller mer, slik at saksbehandler må vurdere grunnlaget på nytt.
31. Som sp-sykepengegrunnlag vil jeg ikke gjøre avviksvurdering for selvstendig næringsdrivende ennå, slik som i dag.

### Skjønnsfastsettelse

32. Som saksbehandler vil jeg skjønnsfastsette sykepengegrunnlaget med årsinntekt per arbeidsgiver, type, årsak, lovhjemmel og begrunnelse, slik som i dag.
33. Som saksbehandler vil jeg at skjønnsfastsettelsen gjelder alle arbeidsgiverne eller ingen, slik som i dag.
34. Som saksbehandler vil jeg at skjønnsfastsettelsen krever totrinnsvurdering, slik som i dag.
35. Som saksbehandler vil jeg se sykepengegrunnlaget, avviksvurderingen og sammenligningsgrunnlaget i Speil, slik som i dag.
36. Som saksbehandler vil jeg se historikken over skjønnsfastsettelser for skjæringstidspunktet, slik at jeg ser hvem som endret hva, og når.
37. Som sp-sykepengegrunnlag vil jeg lage et nytt grunnlag med kilde `saksbehandler` og sende `endret_sykepengegrunnlag` og `saksbehandlerhandling` gjennom en outbox, slik at Spleis revurderer og Spesialist legger til totrinnsvurdering.

### Grunnbeløpsregulering

38. Som sp-sykepengegrunnlag vil jeg finne gjeldende grunnlag som er fastsatt med et grunnbeløp som ikke lenger gjelder for skjæringstidspunktet, slik at grunnlaget blir regulert når et nytt grunnbeløp er vedtatt.
39. Som sp-sykepengegrunnlag vil jeg lage et nytt grunnlag med riktig grunnbeløp og sende `endret_sykepengegrunnlag`, slik at Spleis revurderer som når Spregulering ber om det i dag.
40. Som utvikler vil jeg kunne starte reguleringen for hånd, slik at vi kan regulere med en gang et nytt grunnbeløp er lagt inn.
41. Som utvikler vil jeg få en melding i Slack med hvor mange grunnlag som er regulert, slik som fra Spregulering i dag.

### Spesialist og vedtaket

42. Som Spesialist vil jeg hente sykepengegrunnlaget med ID-en fra godkjenningsbehovet og `avsluttet_med_vedtak`, slik at jeg har dataene jeg trenger uten at Spleis sender dem.
43. Som Spesialist vil jeg lage `vedtak_fattet` med de samme feltene som i dag, slik at Sporbar og spre-gosys ikke merker byttet.
44. Som Spesialist vil jeg hente begrunnelsen for skjønnsfastsettelsen fra sp-sykepengegrunnlag, slik at den kommer med i vedtaket som i dag.
45. Som Spesialist vil jeg slutte å sende `Avviksvurdering` og lage RV_IV_2 etter byttet, slik at avviket bare vurderes ett sted.

### Backfill og skyggekjøring

46. Som sp-sykepengegrunnlag vil jeg lage grunnlag for deterministiske ID-er med tallene fra spleis-api, slik at de gamle skjæringstidspunktene får et grunnlag som stemmer med utbetalingen.
47. Som sp-sykepengegrunnlag vil jeg hente avviksvurderingene fra Spinnvill og koble dem til grunnlaget med `vilkårsgrunnlagId`, slik at avviket følger med.
48. Som sp-sykepengegrunnlag vil jeg hente skjønnsfastsettelsene med begrunnelse fra Spesialist og koble dem til grunnlaget med meldingsreferanse-ID-en, slik at begrunnelsen følger med.
49. Som sp-sykepengegrunnlag vil jeg kjøre backfill ved `person_avstemming` og ved oppslag på ukjente ID-er, og føre en migreringslogg, slik som sp-rettighetskategori.
50. Som utvikler vil jeg at tjenesten sammenligner sin egen fastsettelse med grunnlaget fra Spleis for samme skjæringstidspunkt og logger forskjellene, slik at vi vet at arbeidstakere får samme resultat som i dag før vi bytter.
51. Som utvikler vil jeg at tjenesten sammenligner sin egen avviksvurdering med avviksvurderingen fra Spinnvill, slik at vi vet at avviket blir det samme.
52. Som utvikler vil jeg se forskjellene for selvstendig næringsdrivende for seg, slik at forventede forskjeller fordi grunnlaget bygger på Sigrun, ikke skjuler feil for arbeidstakere.

### Drift

53. Som Spock vil jeg påminne perioder i `AVVENTER_SYKEPENGEGRUNNLAG` etter én time.
54. Som utvikler vil jeg få melding i Slack fra spammer når en periode er påminnet mange ganger i `AVVENTER_SYKEPENGEGRUNNLAG`.
55. Som saksbehandler vil jeg se perioder i `AvventerSykepengegrunnlag` som «Forbereder godkjenning» i Speil.

## Beslutninger om implementasjon

### Ny tjeneste: sp-sykepengegrunnlag

- Ny Kotlin-app med egen Postgres-database, satt opp etter sykepenger-standarden og etter mønsteret fra sp-vilkarsproving og sp-rettighetskategori.
- Lagringen skiller mellom et sykepengegrunnlag og fastsettelsene bak det, etter prinsippet i ADR 0006. Et sykepengegrunnlag har ID, fødselsnummer, skjæringstidspunkt, kilde (`automatisk`, `saksbehandler`, `grunnbeløpsregulering`, `spleis` eller `infotrygd`), tidspunkt og resultatet. En fastsettelse er én gjennomgang: inntektsavklarings-ID-en, rettighetskategori-ID-en, tidspunktet og kodeversjonen. Gjeldende grunnlag er det nyeste for person og skjæringstidspunkt.
- Resultatet er fastsettelsesmåten, grunnbeløpet, 6G, beregningsgrunnlaget, sykepengegrunnlaget, grunnlaget per yrkesaktivitet, avviksvurderingen og skjønnsfastsettelsen. To fastsettelser har samme resultat når alle disse er like. Da føyes fastsettelsen til det gjeldende grunnlaget, og ID-en er den samme.
- Modellen fastsetter per yrkesaktivitet, med en egen fastsettelsesmåte for hver type: arbeidstaker etter §§ 8-28 til 8-30 og selvstendig næringsdrivende etter § 8-35. Nye typer, for eksempel frilanser, Inaktiv og dagpenger, og kombinasjoner etter §§ 8-41 til 8-43 legges til som nye fastsettelsesmåter, uten å endre kontrakten med Spleis.
- Beregningene flyttes fra Spleis og Spinnvill uten å endre reglene:
  - omregning av månedsinntekt til årsinntekt, også gjennomsnittet av de tre månedene fra a-ordningen
  - § 8-35 for selvstendig næringsdrivende, med G-justering per år, tak på 6G og 12G og gjennomsnitt av tre år
  - 6G-begrensningen med grunnbeløpet på skjæringstidspunktet
  - at skjønnsfastsettelsen gjelder alle arbeidsgivere eller ingen
  - avviksvurderingen fra Spinnvill, med grensen på 25 % og grensen på én krone for ny vurdering
- Tjenesten har sin egen tabell over grunnbeløp med de samme verdiene som Spleis. Når et nytt grunnbeløp er vedtatt, legges det inn begge steder. Spleis trenger fortsatt grunnbeløpet til andre regler, blant annet minsteinntekt.

### Behovet `Sykepengegrunnlag`

- Inn:
  - `fødselsnummer`: string
  - `Sykepengegrunnlag.skjæringstidspunkt`: dato
  - `Sykepengegrunnlag.inntektsavklaringId`: UUID
  - `Sykepengegrunnlag.rettighetskategoriId`: UUID
- Ut:
  - `@løsning.Sykepengegrunnlag.id`: UUID
  - `@løsning.Sykepengegrunnlag.utfall`: `FASTSATT` eller `IKKE_FASTSATT`
  - `@løsning.Sykepengegrunnlag.årsak`: `MANGLER_PENSJONSGIVENDE_INNTEKT` eller `INNTEKT_FRA_ANNEN_YRKESAKTIVITET`, bare når `utfall` er `IKKE_FASTSATT`
- Tjenesten henter inntektsavklaringen med `GET /api/inntektsavklaringer/{inntektsavklaringId}` i sp-inntekt og hovedkategorien med behovet `RettighetskategoriResultat` på rapiden, med det opprinnelige behovet i `opprinneligBehov`. Begge svarene caches, fordi innholdet bak en ID aldri endres.
- `ARBEIDSTAKER` fastsettes etter reglene for arbeidstakere, og `SELVSTENDIG_NÆRINGSDRIVENDE` etter § 8-35. For `ARBEIDSTAKER_OG_SELVSTENDIG_NÆRINGSDRIVENDE` svarer ikke tjenesten, og feilen logges. Spleis forkaster slike tilfeller i `AvventerRettighetskategori`.
- `MANGLER_PENSJONSGIVENDE_INNTEKT` betyr at inntektsavklaringen har færre enn tre fastsatte år. `INNTEKT_FRA_ANNEN_YRKESAKTIVITET` betyr at en selvstendig næringsdrivende har aktive arbeidsforhold med inntekt i inntektsavklaringen.
- Et grunnlag med utfallet `IKKE_FASTSATT` lagres også, slik at vi kan se hvorfor.
- Svarer ikke sp-inntekt eller sp-rettighetskategori, svarer ikke tjenesten.

### Behovet `SykepengegrunnlagResultat`

- Inn:
  - `fødselsnummer`: string
  - `SykepengegrunnlagResultat.sykepengegrunnlagId`: UUID
- Ut, under `@løsning.SykepengegrunnlagResultat`:
  - `fastsettelse`: `ETTER_HOVEDREGEL`, `ETTER_SKJØNN` eller `I_INFOTRYGD`
  - `grunnbeløp`: desimaltall, årlig grunnbeløp som er brukt
  - `seksG`: desimaltall
  - `beregningsgrunnlag`: desimaltall
  - `sykepengegrunnlag`: desimaltall, begrenset til 6G
  - `begrensetTil6G`: boolean
  - `yrkesaktiviteter`: liste med objekter:
    - `type`: `ARBEIDSTAKER` eller `SELVSTENDIG`
    - `organisasjonsnummer`: string, bare for `ARBEIDSTAKER`
    - `omregnetÅrsinntekt`: desimaltall
    - `fastsattÅrsinntekt`: desimaltall, skjønnsfastsatt årsinntekt hvis den finnes, ellers omregnet årsinntekt
  - `deaktiverteArbeidsforhold`: liste med organisasjonsnumre
  - `avviksvurdering`: `{ avviksprosent: desimaltall, harAkseptabeltAvvik: boolean }` eller null. Den er null for selvstendig næringsdrivende og for grunnlag fra Infotrygd.
  - `trengerSkjønnsfastsettelse`: boolean. Den er `true` når avviket ikke er akseptabelt og `fastsettelse` ikke er `ETTER_SKJØNN`.
- Finnes ikke ID-en, kjører tjenesten backfill for personen synkront og svarer. Finnes ID-en heller ikke i Spleis, svarer ikke tjenesten, og feilen logges.

### Hendelsen `endret_sykepengegrunnlag`

- Felter: `fødselsnummer` (string), `skjæringstidspunkt` (dato), `sykepengegrunnlagId` (UUID) og `manuellVurdering` (boolean, `true` for skjønnsfastsettelse).
- Spleis behandler hendelsen med den samme mekanismen som `endret_opptjeningsvurdering`. Den kopierer vilkårsgrunnlaget med den nye ID-en og revurderer sykefraværstilfellet. Ukjente skjæringstidspunkter ignoreres.
- Hendelsen publiseres gjennom en outbox, bare etter at grunnlaget er lagret.

### Endringer i Spleis

- Ny tilstand `AvventerSykepengegrunnlag` mellom `AvventerRettighetskategori` og `AvventerVilkårsprøving`. Med fullt vilkårsgrunnlag går perioden videre til `AvventerHistorikkRevurdering`, se specen for inntektsavklaring.
- Spleis lagrer sykepengegrunnlag-ID-en i det minimale vilkårsgrunnlaget, eller i en kopi av det fulle.
- De fulle vilkårsgrunnlagene får feltet `sykepengegrunnlagId`, som aldri er tomt:
  - En JSON-migrering setter det på alle eksisterende vilkårsgrunnlag, både fra Spleis og fra Infotrygd, til `UUID.nameUUIDFromBytes("$vilkårsgrunnlagId:Sykepengegrunnlag")`.
  - Før byttet får alle fulle vilkårsgrunnlag som Spleis lager eller kopierer, den deterministiske ID-en fra sin egen `vilkårsgrunnlagId`. Det sikrer at backfill gir tjenesten nøyaktig det grunnlaget Spleis brukte.
  - Etter byttet beholder det fulle vilkårsgrunnlaget ID-en fra tjenesten.
- Ved `IKKE_FASTSATT` forkaster Spleis hele sykefraværstilfellet med RV_IV_12 for `MANGLER_PENSJONSGIVENDE_INNTEKT` og RV_IV_13 for `INNTEKT_FRA_ANNEN_YRKESAKTIVITET`. Spleis velger varselet med en uttømmende `when` over årsakene. Før byttet ignorerer Spleis utfallet, fordi den bruker sitt eget grunnlag.
- `AvventerHistorikk` og `AvventerHistorikkRevurdering` sender `SykepengegrunnlagResultat` sammen med de andre behovene.
  - Før byttet brukes ikke svaret.
  - Etter byttet bruker Spleis `fastsattÅrsinntekt` per yrkesaktivitet, `sykepengegrunnlag`, `seksG` og `grunnbeløp` i beregningen, i stedet for `Inntektsgrunnlag`. Arbeidsgivere med søknad som mangler i `yrkesaktiviteter`, får varselet de får i dag.
  - Er `trengerSkjønnsfastsettelse` `true`, lager Spleis RV_IV_2 på behandlingen. Varselkoden tas i bruk igjen.
- Godkjenningsbehovet og `avsluttet_med_vedtak` får feltet `sykepengegrunnlagId`. `sykepengegrunnlagsfakta` sendes fortsatt fram til opprydningen, slik at Spesialist kan bytte når det passer. `utkast_til_vedtak` er uendret fram til opprydningen.
- Etter byttet avviser Spleis `skjønnsmessig_fastsettelse` og `grunnbeløpsregulering`.
- Etter byttet lager ikke Spleis grunnlaget for selvstendig næringsdrivende fra søknaden, og RV_IV_12 kommer bare fra løsningen. Varslene for varig endring, ny i arbeidslivet og avvikling på søknaden er uendret.
- Spleis lager sitt eget `Inntektsgrunnlag` fram til opprydningen, slik at vi kan skru av togglen. Det gjelder ikke endringer som er gjort i tjenestene etter byttet.
- Tilstanden heter `AVVENTER_SYKEPENGEGRUNNLAG` i `TilstandType`, i `TilstandTypeData`, i `VedtaksperiodetilstandDto` og i `SpannerPersonDto`. Det er én tilstand for førstegangsbehandling og revurdering. spleis-api mapper den til `Periodetilstand.ForberederGodkjenning`.
- spleis-api tar med `sykepengegrunnlagId` og `inntektsavklaringId` i vilkårsgrunnlaget til Speil. Etter opprydningen sender den ikke inntektene.

### Skyggekjøring

- Når tjenesten lager et grunnlag fra backfill med kilde `spleis` for et skjæringstidspunkt der den også har sin egen automatiske fastsettelse, sammenligner den `beregningsgrunnlag`, `sykepengegrunnlag`, `seksG` og `fastsattÅrsinntekt` per yrkesaktivitet. Har den en avviksvurdering fra Spinnvill for samme vilkårsgrunnlag, sammenligner den også `avviksprosent` og `harAkseptabeltAvvik`.
- Forskjellene logges som advarsel uten personopplysninger i meldingen. Detaljene går til Team Logs, etter skillen for sykepenger-logging. Arbeidstakere og selvstendig næringsdrivende logges hver for seg.
- Tallene telles også med en metrikk per utfall (`likt` eller `ulikt`) og type, slik at vi kan følge skyggekjøringen i Grafana.

### Skjønnsfastsettelse

- Endepunkt for Speil: `POST /api/personer/{pseudoId}/sykefravaerstilfeller/{skjæringstidspunkt}/skjonnsfastsettelse`, med tilgangskontroll per person og auditlogging. Innholdet er det samme som i dagens endepunkt i Spesialist:
  - `type`: `OMREGNET_ÅRSINNTEKT`, `RAPPORTERT_ÅRSINNTEKT` eller `ANNET`
  - `årsak`, `begrunnelseMal`, `begrunnelseFritekst` og `begrunnelseKonklusjon`: string
  - `lovhjemmel`: `{ paragraf: string, ledd: string eller null, bokstav: string eller null, lovverk: string, lovverksversjon: string }`
  - `arbeidsgivere`: liste med `organisasjonsnummer` (string) og `årlig` (desimaltall)
- Svaret er `{ "sykepengegrunnlagId": UUID }`. Endepunktet svarer 404 når skjæringstidspunktet ikke har sykepengegrunnlag, og 400 når grunnlaget ikke er for arbeidstakere, eller når ikke alle arbeidsgiverne i grunnlaget er med.
- Skjønnsfastsettelsen gir et nytt grunnlag med kilde `saksbehandler` og en ny `endringId`. Outboxen sender `endret_sykepengegrunnlag` og `saksbehandlerhandling`. `saksbehandlerhandling` har de samme feltene som fra sp-inntekt, med `handlingId` lik `endringId` og `handlingType: SKJØNNSFASTSATT_SYKEPENGEGRUNNLAG`. Spesialist får den nye verdien i `HandlingType`, og Speil går til sp-sykepengegrunnlag for visningen.
- `GET /api/personer/{pseudoId}/saksbehandlerhandlinger/{handlingId}/visning` gir `{ felter: [...] }` med felter av typen `TEKST` og `LISTE`, som i sp-vilkarsproving.
- `GET /api/personer/{pseudoId}/sykepengegrunnlag/{sykepengegrunnlagId}` gir Speil:
  - `id`, `skjæringstidspunkt`, `kilde`, `opprettet`, `inntektsavklaringId` og `rettighetskategoriId`
  - feltene fra `SykepengegrunnlagResultat`
  - `sammenligningsgrunnlag`: `{ totalbeløp, arbeidsgivere: [{ organisasjonsnummer, beløp, inntekter: [{ måned, beløp, type, fordel, beskrivelse }] }] }` eller null
  - `skjønnsfastsettelse`: `{ endringId, type, årsak, begrunnelseMal, begrunnelseFritekst, begrunnelseKonklusjon, lovhjemmel, saksbehandlerIdent, tidspunkt, arbeidsgivere: [{ organisasjonsnummer, årlig, fraÅrlig }] }` eller null
  - `selvstendig`: `{ pensjonsgivendeInntekter: [{ år, beløp, justertBeløp }], beregningsgrunnlag }` eller null. `justertBeløp` er beløpet etter G-justering og taket på 6G og 12G.
  - `historikk`: liste med `sykepengegrunnlagId`, `tidspunkt`, `kilde` og `saksbehandlerIdent` (string eller null) for skjæringstidspunktet

### API for Spesialist

- `GET /api/sykepengegrunnlag/{sykepengegrunnlagId}` med maskin-til-maskin-token. Finnes ikke ID-en, kjører tjenesten backfill og svarer 404 hvis den fortsatt ikke finnes. Svaret er `{ sykepengegrunnlagId, skjæringstidspunkt, sykepengegrunnlagsfakta, avviksvurdering, skjønnsfastsettelse }`:
  - `sykepengegrunnlagsfakta` har nøyaktig samme form som feltet med samme navn i godkjenningsbehovet fra Spleis i dag, slik at Spesialist kan lage `vedtak_fattet` uten endringer:
    - `sykepengegrunnlag` og `6G`: desimaltall
    - `fastsatt`: `EtterHovedregel`, `EtterSkjønn` eller `IInfotrygd`
    - `arbeidsgivere`: liste med `arbeidsgiver` (organisasjonsnummer), `omregnetÅrsinntekt`, `skjønnsfastsatt` (bare ved `EtterSkjønn`) og `inntektskilde` (`Arbeidsgiver`, `AOrdningen` eller `Saksbehandler`). Mangler ved `IInfotrygd` og er tom for selvstendig.
    - `selvstendig`: `{ pensjonsgivendeInntekter: [{ årstall, beløp }], beregningsgrunnlag }` eller null
  - `avviksvurdering`: `{ avviksprosent: desimaltall, innrapportertÅrsinntekt: desimaltall, arbeidsgivere: [{ organisasjonsnummer, innrapportertÅrsinntekt }] }` eller null. Det er det Spesialist i dag henter fra Spinnvill til `vedtak_fattet`.
  - `skjønnsfastsettelse`: det samme objektet som i svaret til Speil, eller null. Spesialist bruker det til begrunnelsene i `vedtak_fattet`.
- Godkjenningsbehovet får feltet `Godkjenning.sykepengegrunnlagId` (UUID), og `avsluttet_med_vedtak` får feltet `sykepengegrunnlagId` (UUID) på toppnivå.
- Spesialist henter grunnlaget når den får godkjenningsbehovet og `avsluttet_med_vedtak` med `sykepengegrunnlagId`. Svarer ikke tjenesten, prøver Spesialist igjen, slik den gjør med andre oppslag.
- Etter byttet sender ikke Spesialist `Avviksvurdering` og lager ikke RV_IV_2. Endepunktet for skjønnsfastsettelse i Spesialist fjernes etter byttet, og tabellene blir liggende som historikk fram til opprydningen.

### Grunnbeløpsregulering

- En jobb i tjenesten kjører ved `midnatt` og ved den manuelle hendelsen `kjør_grunnbeløpsregulering`. Den finner gjeldende grunnlag med kilde forskjellig fra `infotrygd` der grunnbeløpet som er brukt, ikke er grunnbeløpet som gjelder for skjæringstidspunktet i dag. Skjæringstidspunkter før 21. september 2020 hoppes over, som i Spregulering.
- For hvert grunnlag lager jobben et nytt grunnlag med kilde `grunnbeløpsregulering` og det nye grunnbeløpet, og sender `endret_sykepengegrunnlag` med `manuellVurdering: false`. Skjønnsfastsettelsen og avviksvurderingen blir med uendret.
- Jobben sender en oppsummering til Slack, som Spregulering gjør.
- Jobben skrus på ved byttet. Spregulering skrus av i samme runde.

### Backfill

- Backfill følger mønsteret fra sp-rettighetskategori: `SpleisClient`, `PersonAvstemmingService` og en migreringslogg. Den bruker `POST /api/sykepengegrunnlag` i spleis-api, se specen for inntektsavklaring.
- Grunnlag fra backfill lagres med ID-en fra Spleis, kilde `spleis` eller `infotrygd` og tidspunktet `opprettet` fra Spleis. Lagringen er idempotent på ID.
- Ny endpoint i Spinnvill: `POST /api/avviksvurderinger` med `{ "fødselsnummer": string }`. Svaret er `{ "avviksvurderinger": [...] }` med:
  - `avviksvurderingId` (UUID), `skjæringstidspunkt` (dato), `opprettet` (tidspunkt) og `avviksprosent` (desimaltall)
  - `vilkårsgrunnlagIder`: liste med UUID, fra koblingstabellen og de lagrede behovene
  - `beregningsgrunnlag`: `{ totalbeløp, omregnedeÅrsinntekter: [{ organisasjonsnummer, beløp }] }`
  - `sammenligningsgrunnlag`: `{ totalbeløp, innrapporterteInntekter: [{ arbeidsgiverreferanse, inntekter: [{ årMåned, beløp, inntektstype, fordel, beskrivelse }] }] }`
  Slettede avviksvurderinger og avviksvurderinger med kilde `INFOTRYGD` tas ikke med.
- Ny endpoint i Spesialist: `POST /api/skjonnsfastsettelser` med `{ "fødselsnummer": string }`. Svaret er en liste med `meldingsreferanseId` (UUID), `skjæringstidspunkt`, `opprettet`, `saksbehandlerIdent`, `type`, `årsak`, `begrunnelseMal`, `begrunnelseFritekst`, `begrunnelseKonklusjon`, `lovhjemmel` og `arbeidsgivere` (`organisasjonsnummer`, `årlig` og `fraÅrlig`).
- Tjenesten kobler avviksvurderingen til grunnlaget med `vilkårsgrunnlagId`, og skjønnsfastsettelsen med `meldingsreferanseId` fra spleis-api. Mangler en kobling, lagres grunnlaget uten den, og det logges.
- Backfill kjører ved `person_avstemming` og ved `SykepengegrunnlagResultat` for en ukjent ID.

### Endringer i Spock, spammer og Speil

- Spock: `AVVENTER_SYKEPENGEGRUNNLAG` legges i gruppen med påminnelse etter én time.
- spammer: `AVVENTER_SYKEPENGEGRUNNLAG` legges til i `interessanteTilstander`.
- Speil: sykepengegrunnlaget, avviksvurderingen og skjønnsfastsettelsen hentes fra sp-sykepengegrunnlag bak en toggle som skrus på ved byttet.

## Beslutninger om testing

- Gode tester sjekker ytre oppførsel: behov inn, løsninger og hendelser ut, innholdet i API-svarene og tilstander, varsler og utbetalinger i Spleis. De tester ikke interne klasser.
- **sp-sykepengegrunnlag, på rapid- og REST-nivå.** Testene sender behov og `person_avstemming` inn, svarer på `RettighetskategoriResultat` og sjekker løsningen, hendelsene og databasen. sp-inntekt, spleis-api, Spinnvill og Spesialist fakes i HTTP-klientene, og databasen er ekte Postgres. Testene dekker:
  - én og flere arbeidsgivere, inntektsmelding og a-ordningen, korrigert inntekt og deaktivert arbeidsforhold
  - 6G-begrensning
  - selvstendig næringsdrivende med tre år, med inntekt over 6G og 12G, og med færre enn tre fastsatte år
  - selvstendig næringsdrivende med inntekt fra et arbeidsforhold
  - kombinert hovedkategori, som gir ubesvart behov
  - samme resultat, som gir samme ID
  - avvik under og over 25 %, og en endring på under én krone, som beholder avviksvurderingen og skjønnsfastsettelsen
  - skjønnsfastsettelse med og uten alle arbeidsgiverne
  - grunnbeløpsregulering
  - backfill, med og uten avviksvurdering og skjønnsfastsettelse
  - skyggesammenligningen, med og uten forskjeller
  - `SykepengegrunnlagResultat` for en ukjent ID
- **Beregningsreglene.** Tilfellene i testene for `Inntektsgrunnlag`, `SelvstendigFaktaavklartInntekt` og grunnbeløpet i Spleis og for avviksvurderingen i Spinnvill flyttes med og kjøres mot domenet i tjenesten. De skal gi de samme tallene.
- **Spleis, e2e i sykepenger-model.** Testene svarer på `Sykepengegrunnlag` og `SykepengegrunnlagResultat` med testløsninger og sjekker tilstander, forkasting, varsler og utbetaling. Scenarioene dekker:
  - togglene for skyggekjøring og bytte, av og på
  - `IKKE_FASTSATT` med begge årsakene
  - `trengerSkjønnsfastsettelse`
  - `endret_sykepengegrunnlag`
  - 6G-begrensning og minsteinntekt med tallene fra løsningen
  - at `skjønnsmessig_fastsettelse` og `grunnbeløpsregulering` avvises etter byttet
  - påminnelse

  Tester å bygge videre på: `EndretVurderingPåSkjæringstidspunktTest` og testene for skjønnsmessig fastsettelse og grunnbeløpsregulering.
- **Spleis, serde, migrering og spleis-api.** Det samme som for inntektsavklaringen.
- **Behovkontrakt.** `Sykepengegrunnlag`, `SykepengegrunnlagResultat` og de nye feltene i godkjenningsbehovet og `avsluttet_med_vedtak` legges inn i `BehovkontraktTest`.
- **Spesialist.** Testene sjekker at `vedtak_fattet` blir likt med data fra tjenesten og med `sykepengegrunnlagsfakta` fra Spleis, og at `Avviksvurdering` ikke sendes etter byttet.
- **Skyggekjøringen** er beviset for at arbeidstakere får samme resultat som i dag. Vi bytter ikke før den har vært stille for arbeidstakere i dev og prod over en periode vi blir enige om.

## Utenfor omfang

- Fastsettelse for kombinerte kategorier, Inaktiv, dagpenger, frilansere, vernepliktige og de andre særreglene i kapittel 8.
- Avviksvurdering og varig endring for selvstendig næringsdrivende.
- Å flytte minsteinntekt (§ 8-3) ut av Spleis.
- Sykepengegrunnlag som endrer seg i løpet av et sykefraværstilfelle (§§ 8-50 og 8-52).
- Refusjon og inntektsendringer under sykefraværet.
- Endringer i `vedtak_fattet` og i konsumentene av den.

## Andre merknader

- **Åpent spørsmål:** Skal sp-sykepengegrunnlag sende subsumsjonsmeldinger for §§ 8-10, 8-30 og 8-35, slik Spleis og Spinnvill gjør i dag, eller er det lagrede grunnlaget sporingen? Spinnvill sender i dag subsumsjoner for § 8-30, så å slutte er en endring for spre-subsumsjon.
- **Åpent spørsmål:** Hvor lenge skal skyggekjøringen ha vært stille før vi bytter, og hvilke forskjeller kan vi forklare og godta?
- **Åpent spørsmål:** Har Spinnvill koblinger til `vilkårsgrunnlagId` for alle avviksvurderinger som er brukt i et vedtak? `vilkårsgrunnlag_kobling` er beskrevet som midlertidig. Mangler koblinger, kan vi bruke `vilkarsgrunnlag_per_avviksvurdering` i Spesialist i tillegg.
- **Åpent spørsmål:** Har alle skjønnsfastsettelser i Spleis en meldingsreferanse-ID som Spesialist kjenner igjen? Backfill av begrunnelsene er avhengig av det. Det samme spørsmålet står i [specen for inntektsavklaring](avklare-inntekt.md#andre-merknader) og må sjekkes før backfill bygges.
- **Åpent spørsmål:** Hvem andre enn Spregulering og Spesialist leser `sykepengegrunnlagsfakta` i `utkast_til_vedtak`, `avsluttet_med_vedtak` og godkjenningsbehovet? Det må vi vite før opprydningen.
- Etter byttet kan vi ikke rulle tilbake ved å skru av togglen uten å miste skjønnsfastsettelser og grunnbeløpsreguleringer gjort i tjenesten.
