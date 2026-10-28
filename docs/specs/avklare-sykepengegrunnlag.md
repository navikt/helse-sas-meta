# Avklare sykepengegrunnlag i sp-sykepengegrunnlag

[Tickets](../tickets/avklare-sykepengegrunnlag/index.md)

[ADR 0001](../adr/0001-spleis-lagrer-bare-id-for-rettighetskategori.md) · [ADR 0002](../adr/0002-alle-vilkarsgrunnlag-far-rettighetskategori-id.md) · [ADR 0003](../adr/0003-minimalt-vilkarsgrunnlag-for-rettighetskategori.md) · [ADR 0004](../adr/0004-spleis-lagrer-bare-id-for-sykepengegrunnlaget.md) · [Spec for rettighetskategori](avklare-rettighetskategori.md)

## Problem

Sykepengegrunnlaget avgjøres i dag på tre steder. Spleis fastsetter årsinntektene, beregningsgrunnlaget og sykepengegrunnlaget når vilkårsgrunnlaget lages. Spinnvill gjør avviksvurderingen, men først når Spesialist ber om den ved godkjenning, etter at Spleis har beregnet. Spesialist tar imot skjønnsfastsettelsen og sender beløpene til Spleis. Ingen tjeneste eier hele avgjørelsen, og historikken er spredt.

For selvstendig næringsdrivende bruker Spleis den pensjonsgivende inntekten som står på søknaden. Vi vil hente den fra Sigrun selv, slik at vi vet hvilke data avgjørelsen bygger på.

Vi trenger sykepengegrunnlaget som en egen avgjørelse med én eier, på samme måte som rettighetskategorien og opptjeningen.

## Løsning

En ny tjeneste, sp-sykepengegrunnlag, avgjør sykepengegrunnlaget per skjæringstidspunkt. Spleis får en ny tilstand, `AvventerSykepengegrunnlag`, mellom `AvventerRettighetskategori` og `AvventerVilkårsprøving`. Der spør Spleis tjenesten og sender med rettighetskategori-ID-en og hvilken inntektsmelding som gjelder for hver arbeidsgiver. Tjenesten fastsetter årsinntektene, beregningsgrunnlaget og sykepengegrunnlaget, og gjør avviksvurderingen for arbeidstaker. Spleis lagrer bare ID-en (ADR 0004) og slår opp beløpene med ID-en når den trenger dem.

Første versjon gjelder hovedkategoriene Arbeidstaker og Selvstendig næringsdrivende. For arbeidstaker henter tjenesten inntektsmeldingene fra Spedisjon og inntektene fra a-ordningen. For selvstendig næringsdrivende henter tjenesten pensjonsgivende inntekt fra Sigrun og beregner sykepengegrunnlaget etter § 8-35 selv.

Saksbehandler skjønnsfastsetter og overstyrer inntekt og arbeidsforhold i Speil, og Speil sender dette direkte til sp-sykepengegrunnlag, slik den gjør med opptjening i sp-vilkarsproving. Hver endring gir en ny avgjørelse med ny ID, som viser til avgjørelsen den bygger på. Spleis får den nye ID-en og revurderer.

Alle vilkårsgrunnlag skal ha en sykepengegrunnlag-ID, også de som finnes fra før. Spleis gir eksisterende vilkårsgrunnlag en deterministisk ID med en JSON-migrering, og sp-sykepengegrunnlag lager avgjørelsene bak ID-ene med backfill fra spleis-api og Spesialist.

### Faser

Vi ruller ut i fire faser, som for rettighetskategori. Hver fase rulles ut i dev før prod.

1. **Lage ID-er og regne i skygge.** Alle vilkårsgrunnlag får sykepengegrunnlag-ID. Spleis går gjennom `AvventerSykepengegrunnlag` og lagrer ID-en, men beregner fortsatt med sitt eget inntektsgrunnlag. Spesialist og Spinnvill gjør avviksvurderingen som i dag. sp-sykepengegrunnlag avgjør og lagrer, og logger forskjellene mot Spleis og Spinnvill.
2. **Backfill av historikken.** sp-sykepengegrunnlag lager avgjørelser for ID-er som bare finnes i Spleis.
3. **Ta i bruk.** Spleis beregner med beløpene fra tjenesten, gir RV_IV_2 og forkaster med RV_IV_12 ut fra tjenesten. Speil viser sykepengegrunnlaget fra tjenesten og sender skjønnsfastsettelser og overstyringer av inntekt og arbeidsforhold dit. Spesialist slutter å be om avviksvurdering fra Spinnvill.
4. **Rydde opp.** Vi fjerner Spinnvill, avvikskoden og skjønnsflyten i Spesialist, Spleis' egen fastsettelse av inntekt og backfill.

## Brukerhistorier

### Spleis, ny tilstand

1. Som Spleis vil jeg få avgjort sykepengegrunnlaget for et sykefraværstilfelle etter rettighetskategorien og før vilkårsprøving, slik at vilkårsprøvingen og beregningen bruker et grunnlag med én eier.
2. Som Spleis vil jeg alltid gå gjennom `AvventerSykepengegrunnlag` på vei til `AvventerVilkårsprøving` og `AvventerVilkårsprøvingRevurdering`, og stole på at tjenesten gir samme ID for samme input, slik at Spleis ikke trenger egen logikk for når den skal spørre.
3. Som Spleis vil jeg sende rettighetskategori-ID-en i behovet, slik at tjenesten vet om grunnlaget gjelder arbeidstaker eller selvstendig næringsdrivende uten at Spleis lagrer hovedkategorien.
4. Som Spleis vil jeg sende én rad per arbeidsgiver med en periode som ikke er forkastet og har samme skjæringstidspunkt, med referanse-ID-en til inntektsmeldingen som gjelder, slik at Spleis fortsatt avgjør hvilken inntektsmelding som gjelder.
5. Som Spleis vil jeg sende arbeidsgiveren uten inntektsmelding når jeg har bestemt at inntekten fra a-ordningen skal brukes, slik at tjenesten vet at den skal bruke skatteopplysningene.
6. Som Spleis vil jeg sende behovet uten arbeidsgivere for selvstendig næringsdrivende, slik at tjenesten henter inntekten fra Sigrun.
7. Som Spleis vil jeg lagre ID-en fra løsningen i det minimale vilkårsgrunnlaget for skjæringstidspunktet, slik at ID-en gjelder hele sykefraværstilfellet og er tilgjengelig når vilkårsgrunnlaget lages.
8. Som Spleis vil jeg at det fulle vilkårsgrunnlaget tar med seg sykepengegrunnlag-ID-en fra det minimale, slik at det bare finnes ett vilkårsgrunnlag per skjæringstidspunkt.
9. Som Spleis vil jeg gå gjennom `AvventerSykepengegrunnlag` på nytt når en ny eller korrigert inntektsmelding endrer hvilken inntektsmelding som gjelder, slik at tjenesten lager en ny avgjørelse som revurderingen bygger på.
10. Som Spleis vil jeg sende behovet på nytt ved påminnelse når det ikke er besvart, slik at midlertidige feil i tjenesten, Spedisjon, a-ordningen eller Sigrun ikke stopper saken.
11. Som Spleis vil jeg sende sykepengegrunnlag-ID-en i godkjenningsbehovet, slik at Spesialist og sp-sykepengegrunnlag kan knytte godkjenningen til avgjørelsen.

### Spleis, ta i bruk avgjørelsen (fase 3)

12. Som Spleis vil jeg forkaste hele sykefraværstilfellet i `AvventerSykepengegrunnlag` når løsningen sier at sykepengegrunnlaget ikke kan fastsettes fordi det finnes færre enn tre ferdiglignede år, med RV_IV_12, slik at sjekken skjer der dataene eies.
13. Som Spleis vil jeg slutte å gi RV_IV_12 når søknaden kommer inn, når togglen for fase 3 er på, slik at det bare finnes én vei for regelen.
14. Som Spleis vil jeg slå opp beløpene med `SykepengegrunnlagResultat` i `AvventerVilkårsprøving`, slik at jeg kan vurdere minsteinntekt etter §§ 8-3 og 8-47 med sykepengegrunnlaget fra tjenesten.
15. Som Spleis vil jeg slå opp beløpene med `SykepengegrunnlagResultat` sammen med ytelsene i `AvventerHistorikk` og `AvventerHistorikkRevurdering`, slik at hver beregning bruker den gjeldende avgjørelsen.
16. Som Spleis vil jeg beregne dagsatsen per arbeidsgiver med den fastsatte årsinntekten fra oppslaget, slik at utbetalingen bygger på tjenestens avgjørelse.
17. Som Spleis vil jeg ta med ghost-arbeidsforhold fra oppslaget i beregningen og gi RV_VV_2 når det finnes ghost-arbeidsforhold, slik at flere arbeidsforhold virker som i dag.
18. Som Spleis vil jeg gi RV_IV_2 i `AvventerHistorikk` når oppslaget sier at grunnlaget er fastsatt etter hovedregelen og avviket er over 25 prosent, slik at saksbehandler må skjønnsfastsette før perioden kan godkjennes.
19. Som Spleis vil jeg ta imot `endret_sykepengegrunnlag` og revurdere fra skjæringstidspunktet med den nye ID-en, slik at skjønnsfastsettelser og overstyringer fra saksbehandler får virkning.
20. Som Spleis vil jeg slutte å lage eget inntektsgrunnlag for nye vilkårsgrunnlag når togglen for fase 3 er på, slik at beløpene bare finnes i tjenesten.
21. Som Spleis vil jeg slutte å sende `sykepengegrunnlagsfakta` i godkjenningsbehovet når togglen for fase 3 er på, slik at Spesialist vet at grunnlaget kommer fra tjenesten.
22. Som Spleis vil jeg fortsatt ta imot refusjonsdelen av `overstyr_inntekt_og_refusjon`, slik at refusjon blir værende i Spleis.
23. Som Spleis vil jeg fortsatt vurdere tilkommen inntekt selv, slik at den virker som i dag.

### Spleis, ID-er på alle vilkårsgrunnlag

24. Som Spleis vil jeg gi alle eksisterende vilkårsgrunnlag en deterministisk sykepengegrunnlag-ID med en JSON-migrering, slik at ingen skjæringstidspunkt mangler ID når beregningen begynner å slå opp.
25. Som Spleis vil jeg lage den deterministiske ID-en når et nytt vilkårsgrunnlag lages uten ID fra tjenesten, for eksempel fra Infotrygd eller med togglen for fase 1 av, slik at feltet aldri er tomt.
26. Som Spleis vil jeg gi et vilkårsgrunnlag en ny deterministisk ID når jeg selv endrer inntektsgrunnlaget i fase 1 og 2, slik at én ID aldri står for to ulike sett med beløp.
27. Som Spleis vil jeg tilby et endepunkt i spleis-api som gir alle sykepengegrunnlag-ID-ene til en person med beløpene, slik at tjenesten kan kjøre backfill.

### sp-sykepengegrunnlag, avgjøre

28. Som sp-sykepengegrunnlag vil jeg slå opp hovedkategorien med rettighetskategori-ID-en hos sp-rettighetskategori, slik at jeg vet hvilke regler som gjelder.
29. Som sp-sykepengegrunnlag vil jeg la behovet være ubesvart og logge feil når hovedkategorien er en annen enn Arbeidstaker eller Selvstendig næringsdrivende, slik at vi oppdager det i stedet for å avgjøre feil.
30. Som sp-sykepengegrunnlag vil jeg hente inntektsmeldingene fra Spedisjon med referanse-ID-ene, slik at jeg får hele inntektsmeldingen uten at Spleis må sende den.
31. Som sp-sykepengegrunnlag vil jeg be om inntektene fra a-ordningen for de tre månedene før skjæringstidspunktet og om arbeidsforholdene, slik at jeg kan fastsette inntekt uten inntektsmelding og finne ghost-arbeidsforhold.
32. Som sp-sykepengegrunnlag vil jeg fastsette omregnet årsinntekt fra inntektsmeldingen eller fra a-ordningen etter de samme reglene som Spleis bruker i dag, slik at resultatet blir det samme.
33. Som sp-sykepengegrunnlag vil jeg avgjøre ghost-arbeidsforhold etter de samme reglene som Spleis bruker i dag, slik at beregningsgrunnlaget får med de samme arbeidsforholdene.
34. Som sp-sykepengegrunnlag vil jeg be om sammenligningsgrunnlaget for de tolv månedene før måneden med skjæringstidspunktet, slik at jeg kan gjøre avviksvurderingen.
35. Som sp-sykepengegrunnlag vil jeg gjøre avviksvurderingen for arbeidstaker som en del av den første avgjørelsen, slik at avviket er kjent før Spleis beregner.
36. Som sp-sykepengegrunnlag vil jeg ikke gjøre avviksvurdering for selvstendig næringsdrivende, slik at § 8-30 andre ledd bare brukes for arbeidstaker.
37. Som sp-sykepengegrunnlag vil jeg hente pensjonsgivende inntekt fra Sigrun fra året før skjæringstidspunktet og bakover, og hoppe over år som ikke er ferdiglignet, til jeg har tre ferdiglignede år, slik at jeg bruker de tre siste ferdiglignede årene etter § 8-35.
38. Som sp-sykepengegrunnlag vil jeg regne et ferdiglignet år uten pensjonsgivende inntekt som 0 kroner, slik at snittet blir riktig.
39. Som sp-sykepengegrunnlag vil jeg ikke gå lenger tilbake enn 2017, slik at jeg ikke spør etter år Sigrun ikke har.
40. Som sp-sykepengegrunnlag vil jeg summere lønn, lønn bare pensjonsdel, næring og næring fra fiske, fangst eller familiebarnehage på tvers av skatteordningene, slik at hele den pensjonsgivende inntekten er med.
41. Som sp-sykepengegrunnlag vil jeg G-justere og avgrense etter samme formel og avrunding som Spleis, slik at skyggeregningen gir 0 kroner forskjell når årene er de samme.
42. Som sp-sykepengegrunnlag vil jeg gi utfallet «færre enn tre ferdiglignede år» når jeg ikke finner tre ferdiglignede år, slik at Spleis kan forkaste.
43. Som sp-sykepengegrunnlag vil jeg begrense sykepengegrunnlaget til 6G og si om det er begrenset, slik at Spleis og Speil ikke må regne det ut selv.

### sp-sykepengegrunnlag, lagre og svare

44. Som sp-sykepengegrunnlag vil jeg lagre hver avgjørelse som en ny rad med person, skjæringstidspunkt, kilde, vurderingstidspunkt, input og dataene avgjørelsen bygger på, slik at historikken kan etterprøves.
45. Som sp-sykepengegrunnlag vil jeg returnere den gjeldende ID-en når jeg får samme rettighetskategori-ID og samme inntektsmeldinger for samme skjæringstidspunkt, uten å hente noe på nytt, slik at påminnelser ikke lager nye avgjørelser.
46. Som sp-sykepengegrunnlag vil jeg lage en ny automatisk avgjørelse når inputen er endret, slik at nye inntektsmeldinger blir vurdert.
47. Som sp-sykepengegrunnlag vil jeg aldri erstatte en avgjørelse fra saksbehandler med en automatisk avgjørelse for samme input, slik at skjønnsfastsettelser og overstyringer står seg.
48. Som sp-sykepengegrunnlag vil jeg la behovet være ubesvart når Spedisjon, sp-rettighetskategori, a-ordningen eller Sigrun ikke svarer eller mangler data, slik at Spleis prøver igjen.
49. Som sp-sykepengegrunnlag vil jeg svare på oppslag fra ID til beløp, slik at Spleis kan beregne uten egen kopi.

### Saksbehandler, Speil og Spesialist

50. Som saksbehandler vil jeg se sykepengegrunnlaget, beregningsgrunnlaget, sammenligningsgrunnlaget og avviket i Speil, hentet fra sp-sykepengegrunnlag, slik at jeg ser det tjenesten har avgjort.
51. Som saksbehandler vil jeg se de pensjonsgivende inntektene fra Sigrun for selvstendig næringsdrivende, slik at jeg kan etterprøve beregningen.
52. Som saksbehandler vil jeg skjønnsfastsette sykepengegrunnlaget i Speil når avviket er over 25 prosent, slik at perioden kan godkjennes.
53. Som saksbehandler vil jeg overstyre inntekten til en arbeidsgiver i Speil, slik at feil inntekt kan rettes.
54. Som saksbehandler vil jeg deaktivere og aktivere ghost-arbeidsforhold i Speil, slik at arbeidsforhold som ikke skal telle, holdes utenfor.
55. Som saksbehandler vil jeg at refusjon fortsatt overstyres som i dag, slik at refusjonen ikke påvirkes av flyttingen.
56. Som Spesialist vil jeg få `saksbehandlerhandling` fra sp-sykepengegrunnlag ved skjønnsfastsettelse og overstyring, slik at jeg kan kreve totrinnsvurdering som i dag.
57. Som Spesialist vil jeg hente sykepengegrunnlaget fra sp-sykepengegrunnlag når godkjenningsbehovet mangler `sykepengegrunnlagsfakta`, slik at `vedtak_fattet` får de samme faktaene som i dag.
58. Som Spesialist vil jeg slutte å be om `Avviksvurdering` når godkjenningsbehovet mangler `sykepengegrunnlagsfakta`, slik at Spinnvill ikke lenger trengs.
59. Som Spesialist vil jeg tilby et endepunkt med avviksvurderingene til en person knyttet til vilkårsgrunnlag, slik at tjenesten kan ta dem med i backfill.

### Overstyring i sp-sykepengegrunnlag

60. Som sp-sykepengegrunnlag vil jeg lagre en skjønnsfastsettelse som en ny avgjørelse som bygger på den forrige, uten ny avviksvurdering, slik at avviksvurderingen hører til den første avgjørelsen.
61. Som sp-sykepengegrunnlag vil jeg lagre en overstyring av inntekt eller arbeidsforhold som en ny avgjørelse som bygger på den forrige, med ny avviksvurdering mot det samme sammenligningsgrunnlaget, slik at avviket følger det nye beregningsgrunnlaget.
62. Som sp-sykepengegrunnlag vil jeg fjerne en tidligere skjønnsfastsettelse når inntekten eller arbeidsforholdene overstyres, slik det skjer i Spleis i dag.
63. Som sp-sykepengegrunnlag vil jeg sende `endret_sykepengegrunnlag` til Spleis og `saksbehandlerhandling` til Spesialist med en outbox, slik at meldingene sendes selv om rapiden er nede et øyeblikk.

### Skygge og backfill

64. Som utvikler vil jeg at sp-sykepengegrunnlag sammenligner sin avgjørelse med `sykepengegrunnlagsfakta` i godkjenningsbehovet i fase 1 og 2 og logger forskjellene, slik at vi ser om tjenesten avgjør som Spleis.
65. Som utvikler vil jeg at sp-sykepengegrunnlag sammenligner avviksprosenten sin med løsningen fra Spinnvill i fase 1 og 2, slik at vi ser om avviksvurderingen blir lik.
66. Som utvikler vil jeg se for selvstendig næringsdrivende hvilke år og beløp som er ulike mellom Sigrun og søknaden, slik at vi forstår forskjellene.
67. Som sp-sykepengegrunnlag vil jeg hente historikken for personen ved hver `person_avstemming` og lagre ID-ene som mangler, slik at ID-er Spleis har laget siden sist får backfill.
68. Som sp-sykepengegrunnlag vil jeg hente historikken synkront når jeg får et oppslag på en ID jeg ikke kjenner, slik at Spleis og Speil får svar før personen har fått backfill.
69. Som sp-sykepengegrunnlag vil jeg ta med avviksvurderingen fra Spesialist i backfill, slik at eldre saker viser avviket i Speil.
70. Som sp-sykepengegrunnlag vil jeg føre en migreringslogg per person, slik at vi vet når alle har fått backfill.

### Drift

71. Som Spock vil jeg påminne perioder i `AVVENTER_SYKEPENGEGRUNNLAG` etter én time, slik at ubesvarte behov sendes på nytt like raskt som andre behov.
72. Som utvikler vil jeg få melding i Slack fra spammer når en periode er påminnet mange ganger i `AVVENTER_SYKEPENGEGRUNNLAG`, slik at vi oppdager perioder som står fast.
73. Som saksbehandler vil jeg se perioder i `AvventerSykepengegrunnlag` som «Forbereder godkjenning» i Speil.

## Beslutninger om implementasjon

### Ny tjeneste: sp-sykepengegrunnlag

- Ny Kotlin-app med egen Postgres-database, satt opp etter sykepenger-standarden, med samme moduler som sp-rettighetskategori: appen, `migreringer` og `opprydding-dev`. Appen har Rapids & Rivers for behov og hendelser og et REST-API for Speil og Spesialist, slik sp-vilkarsproving har.
- Appen får Azure-tilgang til Spedisjon, sp-rettighetskategori, Sigrun (`team-inntekt.sigrun`), spleis-api og Spesialist. Den tar imot kall fra Speil (OBO) og Spesialist (maskin-til-maskin). Kall fra Speil sjekkes mot populasjonstilgangskontroll, som i sp-vilkarsproving.
- Lagringen følger sp-rettighetskategori. Hver avgjørelse er en ny rad med:
  - ID, fødselsnummer, skjæringstidspunkt og rettighetskategori-ID
  - kilde: `automatisk`, `saksbehandler` eller `spleis`
  - vurderingstidspunkt, og `opprettet`, som databasen setter
  - input: arbeidsgivernes organisasjonsnummer med referanse-ID til inntektsmeldingen eller ingen
  - `byggerPå`: ID-en til avgjørelsen den bygger på, eller ingen
  - `fastsatt` og `utfall`, se kontrakten under
  - yrkesaktivitetene med omregnet og fastsatt årsinntekt, inntektskilde, ghost og deaktivert
  - beregningsgrunnlag, sykepengegrunnlag, 6G og om grunnlaget er begrenset
  - avviksvurderingen med sammenligningsgrunnlaget per arbeidsgiver og måned, for automatiske avgjørelser for arbeidstaker
  - svarene fra Sigrun per år og felt, med G-verdiene som er brukt, for selvstendig næringsdrivende
  - saksbehandlerens ident, begrunnelser og lovhjemmel ved skjønnsfastsettelse og overstyring
- Gjeldende avgjørelse er den med nyest vurderingstidspunkt for person og skjæringstidspunkt, som i sp-rettighetskategori.

### Behov `Sykepengegrunnlag`

- Inn:
  - `fødselsnummer`: tekst
  - `Sykepengegrunnlag.skjæringstidspunkt`: dato
  - `Sykepengegrunnlag.rettighetskategoriId`: UUID
  - `Sykepengegrunnlag.arbeidsgivere`: liste, tom for selvstendig næringsdrivende. Hver rad har `organisasjonsnummer` (tekst) og `inntektsmelding` (UUID, Spedisjons `@id`, eller `null` når inntekten fra a-ordningen skal brukes).
- Løsning:
  - `@løsning.Sykepengegrunnlag.id`: UUID
  - `@løsning.Sykepengegrunnlag.utfall`: `FASTSATT` eller `FÆRRE_ENN_TRE_FERDIGLIGNEDE_ÅR`
- Inputen er rettighetskategori-ID-en og settet med arbeidsgiver og inntektsmelding. Er inputen den samme som for den gjeldende avgjørelsen, eller for avgjørelsen den gjeldende bygger på, svarer tjenesten med den gjeldende ID-en uten å hente noe. Ellers lager den en ny automatisk avgjørelse. En avgjørelse fra backfill har ingen input, så det første behovet etter backfill gir en ny avgjørelse.
- Tjenesten slår opp hovedkategorien synkront hos sp-rettighetskategori (se under).
  - Arbeidstaker: tjenesten henter inntektsmeldingene fra Spedisjon og ber om a-ordningen og arbeidsforholdene med behovene under. Den fastsetter omregnet årsinntekt per arbeidsgiver, finner ghost-arbeidsforhold, gjør avviksvurderingen og lagrer.
  - Selvstendig næringsdrivende: tjenesten henter fra Sigrun og beregner etter § 8-35.
  - Andre hovedkategorier: tjenesten svarer ikke, og feilen logges.
- For å hente fra a-ordningen og Aa-registeret sender tjenesten egne behov, som det opprinnelige behovet følger med i, slik sp-vilkarsproving gjør med `ArbeidsforholdV2`. Behovene og feltene er de samme som Spleis og Spinnvill bruker i dag, så de eksisterende løserne kan svare:
  - `InntekterForSykepengegrunnlag` med `skjæringstidspunkt`, `beregningStart` og `beregningSlutt` (de tre månedene før måneden med skjæringstidspunktet)
  - `ArbeidsforholdV2` med `skjæringstidspunkt`
  - `Sammenligningsgrunnlag` med `skjæringstidspunkt`, `beregningsperiodeFom` og `beregningsperiodeTom` (de tolv månedene før måneden med skjæringstidspunktet)
- Reglene for omregnet årsinntekt, skatteopplysninger, ghost-arbeidsforhold og avviksvurdering flyttes fra Spleis og Spinnvill uten endringer.

### Behov `SykepengegrunnlagResultat`

- Inn: `fødselsnummer` og `SykepengegrunnlagResultat.sykepengegrunnlagId` (UUID).
- Løsningen er `@løsning.SykepengegrunnlagResultat` med:
  - `skjæringstidspunkt`: dato
  - `fastsatt`: `ETTER_HOVEDREGEL`, `ETTER_SKJØNN` eller `I_INFOTRYGD`
  - `yrkesaktiviteter`: liste. Hver rad har:
    - `yrkesaktivitetstype`: `ARBEIDSTAKER` eller `SELVSTENDIG`
    - `organisasjonsnummer`: tekst, `null` for selvstendig
    - `ghost`: boolsk
    - `deaktivert`: boolsk
    - `omregnetÅrsinntekt`: desimaltall
    - `fastsattÅrsinntekt`: desimaltall
    - `inntektskilde`: `INNTEKTSMELDING`, `A_ORDNINGEN`, `SAKSBEHANDLER`, `SKJØNN`, `SIGRUN` eller `INFOTRYGD`
  - `beregningsgrunnlag`, `sykepengegrunnlag` og `seksG`: desimaltall
  - `begrensetTil6G`: boolsk
  - `harAkseptabeltAvvik`: boolsk, eller `null` når avviket ikke er vurdert (selvstendig næringsdrivende, Infotrygd og backfill uten avviksvurdering)
- Alle beløp er årlige beløp i kroner.
- Kjenner ikke tjenesten ID-en, kjører den backfill for personen synkront, som `RettighetskategoriResultat`. Finnes ID-en heller ikke i Spleis, svarer ikke tjenesten, og feilen logges.

### Nytt endepunkt i sp-rettighetskategori

- `GET /api/rettighetskategorier/{rettighetskategoriId}`, maskin-til-maskin, bare for sp-sykepengegrunnlag. Svaret har `hovedkategori` (`ARBEIDSTAKER`, `SELVSTENDIG_NÆRINGSDRIVENDE` eller `ARBEIDSTAKER_OG_SELVSTENDIG_NÆRINGSDRIVENDE`) og `skjæringstidspunkt` (dato). Ukjent ID gir backfill først, som i `RettighetskategoriResultat`, og 404 hvis ID-en heller ikke finnes i Spleis.

### Sigrun

- Tjenesten kaller `POST /api/v1/pensjonsgivendeinntektforfolketrygden` med `personident`, `inntektsaar` og `rettighetspakke` `navSykepenger` i body, og med Azure client credentials, som sykepengesoknad-backend.
- Tjenesten begynner på året før skjæringstidspunktet og går bakover. År som ikke er ferdiglignet, hoppes over. Et ferdiglignet år uten pensjonsgivende inntekt teller som 0 kroner. Tjenesten stopper ved tre ferdiglignede år og går ikke lenger tilbake enn 2017. Finner den ikke tre, er utfallet `FÆRRE_ENN_TRE_FERDIGLIGNEDE_ÅR`.
- Den pensjonsgivende inntekten for et år er summen av `pensjonsgivendeInntektAvLoennsinntekt`, `pensjonsgivendeInntektAvLoennsinntektBarePensjonsdel`, `pensjonsgivendeInntektAvNaeringsinntekt` og `pensjonsgivendeInntektAvNaeringsinntektFraFiskeFangstEllerFamiliebarnehage` for alle skatteordningene.
- G-justeringen og avgrensningen er den samme som i Spleis i dag: G på skjæringstidspunktet, gjennomsnittlig G for inntektsåret, inntekt opp til 6G teller fullt, inntekt mellom 6G og 12G teller med en tredel, og inntekt over 12G teller ikke. Snittet av de tre årene er beregningsgrunnlaget, og avrundingen er den samme som i Spleis.
- Varig endring, ny i arbeidslivet, avvikling og de andre svarene på søknaden er ikke med i avgjørelsen. Spleis behandler dem når søknaden kommer inn, som i dag.

### Hendelser fra sp-sykepengegrunnlag

- `endret_sykepengegrunnlag` til Spleis: `fødselsnummer`, `skjæringstidspunkt` (dato), `sykepengegrunnlagId` (UUID) og `manuellVurdering` (boolsk, alltid `true` i første versjon). Spleis tar imot hendelsen med den eksisterende mekanismen for endret vurdering på skjæringstidspunkt, sammen med `endret_opptjeningsvurdering`, `endret_medlemskapsvurdering` og `endret_forsikringsvurdering`.
- `saksbehandlerhandling` til Spesialist med de samme feltene som fra sp-vilkarsproving: `fødselsnummer`, `skjæringstidspunkt`, `saksbehandlerIdent`, `kreverTotrinnsvurdering` (alltid `true`), `handlingId`, `handlingType` og `tidspunkt`. `HandlingType` får de nye verdiene `SKJØNNSFASTSATT_SYKEPENGEGRUNNLAG`, `OVERSTYRT_INNTEKT` og `OVERSTYRT_ARBEIDSFORHOLD`.
- Begge sendes med en outbox, som i sp-vilkarsproving.

### REST-API i sp-sykepengegrunnlag

For Speil, med OBO og populasjonstilgangskontroll:

- `GET /api/personer/{personPseudoId}/sykepengegrunnlag/{sykepengegrunnlagId}` gir avgjørelsen:
  - `id`, `skjæringstidspunkt`, `kilde`, `vurderingstidspunkt`, `byggerPå`, `fastsatt`, `utfall`
  - `yrkesaktiviteter` som i `SykepengegrunnlagResultat`
  - `beregningsgrunnlag`, `sykepengegrunnlag`, `seksG`, `begrensetTil6G`
  - `avviksvurdering`: `avviksprosent`, `harAkseptabeltAvvik`, `maksimaltTillattAvvik` og `sammenligningsgrunnlag` med `totalt` og `arbeidsgivere`. Hver arbeidsgiver har `organisasjonsnummer` og `måneder` med `måned` (år og måned) og `beløp`. Feltet er `null` når avviket ikke er vurdert. For en skjønnsfastsettelse er det avviksvurderingen i avgjørelsen den bygger på.
  - `pensjonsgivendeInntekter`: liste med `år`, `beløp` og `ferdiglignet`, eller `null` for arbeidstaker
  - `skjønnsfastsettelse`: `type`, `årsak`, `begrunnelseMal`, `begrunnelseFritekst`, `begrunnelseKonklusjon`, `lovhjemmel` og `saksbehandlerIdent`, eller `null`
- `POST /api/personer/{personPseudoId}/sykepengegrunnlag/{sykepengegrunnlagId}/skjonnsfastsettelse` med:
  - `type`: `OMREGNET_ÅRSINNTEKT`, `RAPPORTERT_ÅRSINNTEKT` eller `ANNET`
  - `årsak`, `begrunnelseMal`, `begrunnelseFritekst` og `begrunnelseKonklusjon`: tekst
  - `lovhjemmel`: `paragraf`, `ledd`, `bokstav`, `lovverk` og `lovverksversjon`
  - `arbeidsgivere`: liste med `organisasjonsnummer` og `årlig`
- `POST /api/personer/{personPseudoId}/sykepengegrunnlag/{sykepengegrunnlagId}/inntekt` med `arbeidsgivere`: liste med `organisasjonsnummer`, `årlig`, `begrunnelse`, `forklaring` og `lovhjemmel`.
- `POST /api/personer/{personPseudoId}/sykepengegrunnlag/{sykepengegrunnlagId}/arbeidsforhold` med `arbeidsforhold`: liste med `organisasjonsnummer`, `deaktivert`, `begrunnelse` og `forklaring`.
- De tre POST-endepunktene lager en ny avgjørelse som bygger på ID-en i stien, og svarer med `id`. Er ID-en i stien ikke den gjeldende for skjæringstidspunktet, svarer tjenesten med 409, slik at saksbehandler ikke overstyrer et utdatert grunnlag.

For Spesialist, maskin-til-maskin:

- `GET /api/sykepengegrunnlag/{sykepengegrunnlagId}` gir det samme som Speil-endepunktet.

### Endringer i Spleis

- Vilkårsgrunnlaget får feltet `sykepengegrunnlagId`, som aldri er tomt. En JSON-migrering setter det på alle eksisterende vilkårsgrunnlag, både fra Spleis og fra Infotrygd, til `UUID.nameUUIDFromBytes("$vilkårsgrunnlagId:Sykepengegrunnlag")`, som for rettighetskategori.
- Lages et vilkårsgrunnlag uten ID fra tjenesten, bruker Spleis den deterministiske ID-en. Det gjelder vilkårsgrunnlag fra Infotrygd, perioder med togglen for fase 1 av og perioder som var forbi `AvventerSykepengegrunnlag` da togglen ble skrudd på.
- I fase 1 og 2 kan Spleis fortsatt endre inntektsgrunnlaget selv, for eksempel ved skjønnsfastsettelse og overstyring fra Spesialist. Da får det nye vilkårsgrunnlaget den deterministiske ID-en fra sin egen `vilkårsgrunnlagId`. Et kopiert vilkårsgrunnlag med uendret inntektsgrunnlag beholder ID-en. Slik står én ID aldri for to ulike sett med beløp.
- Det minimale vilkårsgrunnlaget (ADR 0003) får det valgfrie feltet `sykepengegrunnlagId` ved siden av `rettighetskategoriId`. Typen i JSON-en er fortsatt `Rettighetskategori`.
- Ny tilstand `AvventerSykepengegrunnlag` mellom `AvventerRettighetskategori` og `AvventerVilkårsprøving`, og tilsvarende før `AvventerVilkårsprøvingRevurdering`. Perioden går alltid gjennom tilstanden på vei til vilkårsprøving.
- Tilstanden sender behovet `Sykepengegrunnlag`:
  - Én rad per arbeidsgiver med en periode som ikke er forkastet og har samme skjæringstidspunkt. Hvert arbeidsforhold er en egen rad.
  - `inntektsmelding` er referanse-ID-en til hendelsen bak den faktaavklarte inntekten fra arbeidsgiveren som gjelder for skjæringstidspunktet. Er inntekten fra a-ordningen lagt til grunn, er feltet `null`.
  - Ingen rader for selvstendig næringsdrivende.
- Når løsningen kommer, lagrer Spleis ID-en i det minimale vilkårsgrunnlaget, og perioden går videre til `AvventerVilkårsprøving`. Det fulle vilkårsgrunnlaget tar med seg ID-en.
- Når en ny eller korrigert inntektsmelding endrer hvilken inntektsmelding som gjelder for et skjæringstidspunkt med fullt vilkårsgrunnlag, går perioden gjennom `AvventerSykepengegrunnlag` på vei til `AvventerVilkårsprøvingRevurdering`. Det nye vilkårsgrunnlaget får den nye ID-en.
- Godkjenningsbehovet får feltet `sykepengegrunnlagId` (UUID) fra fase 1.
- Tilstanden heter `AVVENTER_SYKEPENGEGRUNNLAG` i `TilstandType`, i `TilstandTypeData` i person-JSON, i `VedtaksperiodetilstandDto` og i `SpannerPersonDto`. spleis-api mapper den til `Periodetilstand.ForberederGodkjenning`, som `AVVENTER_RETTIGHETSKATEGORI`. Tilstanden og det nye feltet må være med i serde før togglen for fase 1 skrus på, fordi eldre versjoner av Spleis ikke kan lese dem.
- Togglen for fase 1 styrer overgangen til `AvventerSykepengegrunnlag`. Den fjernes før fase 3.

Med togglen for fase 3 på:

- Er utfallet `FÆRRE_ENN_TRE_FERDIGLIGNEDE_ÅR`, forkaster Spleis hele sykefraværstilfellet i `AvventerSykepengegrunnlag` med RV_IV_12, på samme måte som RV_RK_1 forkastes i `AvventerRettighetskategori`. Spleis lagrer ikke ID-en. RV_IV_12 når søknaden kommer inn, er slått av.
- `AvventerVilkårsprøving` og `AvventerVilkårsprøvingRevurdering` slår opp med `SykepengegrunnlagResultat` sammen med de andre behovene og vurderer minsteinntekten med sykepengegrunnlaget fra oppslaget. Det fulle vilkårsgrunnlaget får ikke eget inntektsgrunnlag.
- `AvventerHistorikk` og `AvventerHistorikkRevurdering` slår opp med `SykepengegrunnlagResultat` sammen med ytelsene. Beregningen bruker fastsatt årsinntekt per yrkesaktivitet, også ghost-arbeidsforhold, og sykepengegrunnlaget og 6G fra oppslaget. Det gjelder alle vilkårsgrunnlag, også de eldre og de fra Infotrygd, fordi alle har ID.
- Spleis gir RV_VV_2 når oppslaget har ghost-arbeidsforhold som ikke er deaktivert, som i dag.
- Spleis gir RV_IV_2 i `AvventerHistorikk` og `AvventerHistorikkRevurdering` når `fastsatt` er `ETTER_HOVEDREGEL` og `harAkseptabeltAvvik` er `false`. RV_IV_2 er avviklet i Spleis i dag og tas i bruk igjen med teksten «Har mer enn 25 % avvik». Spesialist og Speil kjenner allerede koden.
- `endret_sykepengegrunnlag` gir et nytt vilkårsgrunnlag med den nye ID-en og en revurdering fra skjæringstidspunktet, som `endret_opptjeningsvurdering`.
- Godkjenningsbehovet har ikke `sykepengegrunnlagsfakta`.
- Spleis ignorerer inntektsdelen av `overstyr_inntekt_og_refusjon` og tar imot refusjonsdelen som før. `skjønnsmessig_fastsettelse` og `overstyr_arbeidsforhold` fra Spesialist brukes ikke lenger.
- Spleis tar fortsatt imot inntektsmeldinger og lagrer hvilken inntektsmelding som gjelder og refusjonen, men bruker ikke beløpet i inntektsmeldingen til beregning.

### Endepunkt i spleis-api for backfill

- `POST /api/sykepengegrunnlag` med `fødselsnummer` inn. For hver sykepengegrunnlag-ID i de fulle vilkårsgrunnlagene i historikken svarer det med:
  - `sykepengegrunnlagId`, `vilkårsgrunnlagId`, `skjæringstidspunkt`, `opprettet` (fra det første historikkinnslaget med ID-en, som i `OpptjeningApi`) og `kilde` (`SPLEIS` eller `INFOTRYGD`)
  - `fastsatt`, `yrkesaktiviteter`, `beregningsgrunnlag`, `sykepengegrunnlag`, `seksG` og `begrensetTil6G`, i samme form som i `SykepengegrunnlagResultat`
  - `pensjonsgivendeInntekter` for selvstendig næringsdrivende: liste med `år` og `beløp`
- Konsumentene av vilkårsgrunnlagshistorikken som hopper over det minimale vilkårsgrunnlaget, gjør det også her.

### Endringer i Spesialist

- Nytt endepunkt `POST /api/avviksvurderinger`, maskin-til-maskin, bare for sp-sykepengegrunnlag. Med `fødselsnummer` inn svarer det med en liste over avviksvurderingene til personen som er knyttet til et vilkårsgrunnlag:
  - `vilkårsgrunnlagId`, `avviksvurderingId`, `opprettet` og `avviksprosent`
  - `beregningsgrunnlag` med `totalt` og `omregnedeÅrsinntekter` (`arbeidsgiverreferanse` og `beløp`)
  - `sammenligningsgrunnlag` med `totalt` og `innrapporterteInntekter` (`arbeidsgiverreferanse` og `inntekter` med `årMåned` og `beløp`)
- Fra fase 3: Mangler godkjenningsbehovet `sykepengegrunnlagsfakta`, henter Spesialist sykepengegrunnlaget fra sp-sykepengegrunnlag med `sykepengegrunnlagId`. Spesialist bygger `sykepengegrunnlagsfakta` i `vedtak_fattet` i samme form som i dag og ber ikke om `Avviksvurdering`. Har godkjenningsbehovet `sykepengegrunnlagsfakta`, virker alt som i dag. Slik trenger Spesialist ingen egen toggle.
- `SaksbehandlerhandlingRiver` tar imot de nye verdiene i `HandlingType` og krever totrinnsvurdering, som for opptjening.
- Overstyring av refusjon er uendret.

### Endringer i Speil

- Fra fase 3, bak en egen toggle som skrus på sammen med togglen for fase 3 i Spleis:
  - Fanen Sykepengegrunnlag henter avgjørelsen fra sp-sykepengegrunnlag med `sykepengegrunnlagId` fra vilkårsgrunnlaget i stedet for beløpene fra Spleis og avviket fra Spesialist.
  - Skjønnsfastsettelse og overstyring av inntekt og arbeidsforhold sendes til sp-sykepengegrunnlag. Overstyring av refusjon går til Spesialist som før.
  - Ett skjema for inntekt og refusjon sender inntekten til sp-sykepengegrunnlag og refusjonen til Spesialist.
  - Selvstendig næringsdrivende viser de pensjonsgivende inntektene fra Sigrun.

### Skygge i fase 1 og 2

- sp-sykepengegrunnlag lytter på behovet `Godkjenning` uten å svare på det. Har avgjørelsen med `sykepengegrunnlagId` kilde `automatisk`, sammenligner tjenesten beløpene i `sykepengegrunnlagsfakta` med sine egne: per arbeidsgiver, sykepengegrunnlaget, 6G og de pensjonsgivende inntektene per år. Forskjellene logges og telles i en metrikk.
- Tjenesten lytter også på løsningen på `Avviksvurdering` fra Spinnvill. Den finner sykepengegrunnlag-ID-en med `vilkårsgrunnlagId` fra godkjenningsbehovet og sammenligner avviksprosenten.
- Avgjørelser med deterministisk ID sammenlignes ikke, fordi beløpene da kommer fra Spleis.

### Backfill av historikken i sp-sykepengegrunnlag

- Backfill følger mønsteret i sp-rettighetskategori: `person_avstemming` og synkront for ukjente ID-er i `SykepengegrunnlagResultat` og i REST-API-et.
- Tjenesten henter fra spleis-api og fra Spesialist og knytter avviksvurderingen til ID-en med `vilkårsgrunnlagId`. Avgjørelser fra backfill lagres med ID-en fra Spleis, kilde `spleis`, vurderingstidspunktet fra `opprettet` i Spleis og uten input. Lagringen er idempotent på ID.
- `byggerPå` er tom for avgjørelser fra backfill. Eldre skjønnsfastsettelser kommer med som beløp med `fastsatt` `ETTER_SKJØNN`, men uten begrunnelsene, som ligger i Spesialist.
- `person_avstemming` henter historikken hver gang, fordi Spleis kan lage nye deterministiske ID-er etter forrige avstemming.
- Migreringsloggen har én rad per backfill som lagrer minst én ny ID, med fødselsnummer, tidspunkt, antall ID-er fra Spleis og antall nye.

### Endringer i Spock og spammer

- Spock legger `AVVENTER_SYKEPENGEGRUNNLAG` i gruppen med påminnelse etter én time, sammen med `AVVENTER_VILKÅRSPRØVING` og `AVVENTER_RETTIGHETSKATEGORI`.
- spammer legger `AVVENTER_SYKEPENGEGRUNNLAG` til i `interessanteTilstander`.
- Begge må være deployet før togglen for fase 1 skrus på i dev.

### Fase 4

- Når migreringsloggen ikke får nye rader etter en full runde med `person_avstemming`, fjerner vi backfill i sp-sykepengegrunnlag og endepunktene i spleis-api og Spesialist.
- Spinnvill skrus av. Spesialist slutter å ta imot `Avviksvurdering`-løsningen og fjerner flyten for skjønnsfastsettelse og overstyring av inntekt og arbeidsforhold. Historikken for eldre overstyringer blir værende i Spesialist.
- Spleis fjerner togglen for fase 3, sin egen fastsettelse av inntekt, riverne for `skjønnsmessig_fastsettelse` og `overstyr_arbeidsforhold` og inntektsdelen av `overstyr_inntekt_og_refusjon`.

## Beslutninger om testing

- Gode tester sjekker ytre oppførsel: hendelser og behov inn, løsninger, hendelser og HTTP-svar ut, tilstander, forkasting og varsler. De sjekker ikke interne klasser eller hjelpefunksjoner.
- **Spleis, e2e i sykepenger-model.** Testene svarer på `Sykepengegrunnlag` og `SykepengegrunnlagResultat` med testløsninger og sjekker tilstand, behov, forkasting, varsler og utbetalte beløp. Scenarioene for fase 1 kjøres med togglen for fase 1 av og på, og scenarioene for fase 3 med togglen for fase 3 av og på. Scenarioer:
  - Én arbeidsgiver med inntektsmelding, og én arbeidsgiver med inntekt fra a-ordningen.
  - To arbeidsgivere med samme skjæringstidspunkt, og en arbeidsgiver med ghost-arbeidsforhold som gir RV_VV_2.
  - Selvstendig næringsdrivende, og selvstendig næringsdrivende med `FÆRRE_ENN_TRE_FERDIGLIGNEDE_ÅR` som forkaster hele sykefraværstilfellet med RV_IV_12.
  - Avvik over 25 prosent som gir RV_IV_2, og `endret_sykepengegrunnlag` med `ETTER_SKJØNN` som revurderer og fjerner grunnlaget for varselet.
  - En korrigert inntektsmelding etter vilkårsprøving som sender perioden gjennom `AvventerSykepengegrunnlag` og gir et nytt vilkårsgrunnlag med ny ID.
  - Utbetalingen med beløpene fra oppslaget er den samme som med Spleis' eget inntektsgrunnlag for de samme beløpene.
  - Minsteinntekt vurderes med sykepengegrunnlaget fra oppslaget.
  - Refusjonsdelen av `overstyr_inntekt_og_refusjon` virker som før.
  - JSON-migreringen gir den deterministiske ID-en, og en endring av inntektsgrunnlaget i Spleis i fase 1 gir ny ID.
- **sp-sykepengegrunnlag, integrasjonstester på rapiden.** In-memory rapid, falske HTTP-klienter for Spedisjon, sp-rettighetskategori, Sigrun, spleis-api og Spesialist, og ekte Postgres med Testcontainers, som i sp-rettighetskategori. Testene dekker idempotens, ny input, avviksvurderingen, beregningen for selvstendig næringsdrivende med år som ikke er ferdiglignet og år uten inntekt, ubesvart behov ved feil, backfill, skygge og REST-API-et med 409 for utdaterte ID-er. Beregningene for arbeidstaker og selvstendig næringsdrivende testes med de samme tilfellene som Spleis og Spinnvill har tester for i dag.
- **spleis-api.** Endepunktet for backfill testes som `POST /api/rettighetskategorier`.
- **Spesialist, e2e.** Testene i spesialist-e2e-tests sjekker at et godkjenningsbehov uten `sykepengegrunnlagsfakta` gir de samme `sykepengegrunnlagsfakta` i `vedtak_fattet` og ingen `Avviksvurdering`, med en falsk sp-sykepengegrunnlag. `saksbehandlerhandling` med de nye `HandlingType`-verdiene krever totrinnsvurdering.
- **sp-rettighetskategori.** Det nye endepunktet testes med REST-tester, med backfill for ukjent ID.

## Utenfor omfang

- Frilanser, arbeidsledig, inaktiv og alle kombinasjoner, også Arbeidstaker og selvstendig næringsdrivende (§ 8-41).
- Skjønnsfastsettelse for selvstendig næringsdrivende, for eksempel ved varig endring eller ny i arbeidslivet. Spleis forkaster disse når søknaden kommer inn, som i dag.
- Refusjon, tilkommen inntekt og minsteinntekt. De blir i Spleis.
- Å avgjøre hvilken inntektsmelding som gjelder, og å be arbeidsgiver om opplysninger. Det gjør Spleis som før.
- Spill-av-im. Vi antar at den er skrudd av før vi begynner.
- Å flytte begrunnelsene for eldre skjønnsfastsettelser fra Spesialist.
- Endringer i kontrakten for `vedtak_fattet`.

## Andre merknader

- **Avvik fra samtalen.** I utspørringen ble vi enige om at overstyringer skulle gå fra Speil via Spesialist, og at Spesialist skulle hente sykepengegrunnlaget for Speil. Begge deler skulle følge opptjening. Koden viser at opptjening gjør det annerledes: Speil kaller sp-vilkarsproving direkte, og Spesialist får `saksbehandlerhandling` for totrinnsvurdering. Specen følger opptjening. Dette bør bekreftes.
- **Sigrun og PGIF-008.** Regelen om at et ferdiglignet år uten inntekt teller som 0 kroner, forutsetter at feilkoden PGIF-008 betyr «ferdiglignet uten inntekt» og ikke «ikke ferdiglignet». Det må sjekkes mot feilkodene til Skatteetaten før implementasjonen. sykepengesoknad-backend tolker PGIF-006 som «ikke ferdiglignet».
- **Sammenligning for selvstendig næringsdrivende.** sykepengesoknad-backend regner ikke ut snittet lenger. Skyggen sammenligner derfor mot Spleis' beregning med inntekten på søknaden.
- **Omfanget i Spleis i fase 3.** Inntektsgrunnlaget brukes mange steder i Spleis, for eksempel i byggerne for Speil, i `UtkastTilVedtakBuilder` og i hendelser som `avsluttet_med_vedtak`. Ticketene for fase 3 må kartlegge alle som leser beløpene, og avgjøre om de skal bruke oppslaget eller slutte å sende beløpene.
- **Infotrygd.** Vilkårsgrunnlag fra Infotrygd får avgjørelser med `fastsatt` `I_INFOTRYGD` fra backfill. Nye vilkårsgrunnlag fra Infotrygd i fase 3 får den deterministiske ID-en og må ha backfill før oppslaget kan svare. Det skjer synkront ved oppslaget.
- **Åpne spørsmål om kontrakten:**
  - Skal `inntektskilde` skille mellom inntektsmelding fra LPS, Altinn og nav.no?
  - Skal Speil kunne vise historikken av avgjørelser for et skjæringstidspunkt med et eget endepunkt, eller holder det å følge `byggerPå`?
