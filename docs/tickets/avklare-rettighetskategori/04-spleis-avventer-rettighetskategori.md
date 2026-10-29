# 04: `AvventerRettighetskategori` i Spleis bak toggle

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 1

**Repo:** `spleis`

**Hva skal lages:** Når togglen for fase 1 er på, går perioder gjennom den nye tilstanden `AvventerRettighetskategori` på vei til vilkårsprøving. Spleis spør sp-rettighetskategori og får tilbake en rettighetskategori-ID og hovedkategorien. Spleis lagrer bare ID-en, i et minimalt vilkårsgrunnlag for skjæringstidspunktet. Det fulle vilkårsgrunnlaget i `AvventerVilkårsprøving` erstatter det minimale og tar med seg ID-en i stedet for den deterministiske. Se ADR 0003. Spleis bruker ikke hovedkategorien i løsningen ennå, og RV_SØ_53 kjører når søknaden kommer inn, som i dag. Når togglen er av, virker Spleis som før, og vilkårsgrunnlaget får deterministisk ID.

**Blokkeres av:** [03: Rettighetskategori-ID på alle vilkårsgrunnlag i Spleis](03-rettighetskategori-id-pa-alle-vilkarsgrunnlag.md). Behovkontrakten står i specen, og testene bruker testløsninger.

**Status:** pågår

## Akseptansekriterier

- [x] Med togglen på går perioden fra `AvventerBlokkerendePeriode` til `AvventerRettighetskategori` og videre til `AvventerVilkårsprøving` når løsningen kommer.
- [x] Med togglen på går revurdering gjennom `AvventerRettighetskategori` før `AvventerVilkårsprøvingRevurdering`.
- [x] Perioden går alltid gjennom tilstanden på vei til vilkårsprøving. Spleis sjekker ikke om skjæringstidspunktet allerede har rettighetskategori-ID.
- [x] Behovet `Rettighetskategori` har person, skjæringstidspunkt og én referanse-ID per yrkesaktivitet med samme skjæringstidspunkt. Hvert arbeidsforhold er en egen yrkesaktivitet.
- [x] For hver yrkesaktivitet velger Spleis den første perioden, det vil si perioden med tidligste fom blant periodene som ikke er forkastet og har samme skjæringstidspunkt. Perioden trenger ikke å overlappe skjæringstidspunktet.
- [x] For den første perioden sender Spleis referanse-ID-en til den siste sendte søknaden. Forlengelser er ikke med.
- [x] Løsningen har ID-en og hovedkategorien. Spleis lagrer bare ID-en, ikke hovedkategorien (ADR 0001). Hovedkategorien finnes ikke i vilkårsgrunnlaget, på behandlingen eller noe annet sted i person-JSON-en, og Spleis bruker den ikke i denne ticketen.
- [x] `VilkårsgrunnlagElement` har en ny undertype, `Rettighetskategorigrunnlag`, med bare `vilkårsgrunnlagId`, `skjæringstidspunkt` og `rettighetskategoriId`. `Grunnlagsdata` og `InfotrygdVilkårsgrunnlag` får en felles sealed overklasse med `inntektsgrunnlag`, `opptjeningsvurderingId` og `medlemskapsvurderingId`.
- [x] Løsningen på `Rettighetskategori` lagrer et minimalt vilkårsgrunnlag i et nytt innslag i vilkårsgrunnlagshistorikken. Det erstatter et eldre minimalt vilkårsgrunnlag for samme skjæringstidspunkt, men aldri et fullt.
- [x] `AvventerVilkårsprøving` og `AvventerVilkårsprøvingRevurdering` henter ID-en fra det minimale vilkårsgrunnlaget, og det fulle vilkårsgrunnlaget erstatter det med samme ID.
- [x] `vilkårsgrunnlagFor` og annen eksisterende kode som spør etter vilkårsgrunnlaget, ser bare fulle vilkårsgrunnlag. Byggerne for Speil, `OpptjeningApi`, `MedlemskapApi`, `UtkastTilVedtakBuilder` og Spanner-DTO-en hopper over den nye typen.
- [x] `POST /api/rettighetskategorier` i spleis-api hopper over den nye typen, og `RettighetskategoriApiTest` har en test med en person med minimalt vilkårsgrunnlag. Se [07](07-spleis-api-rettighetskategorier.md).
- [ ] JSON-en bruker det eksisterende feltet `type` med den nye verdien `Rettighetskategori`. Eksisterende vilkårsgrunnlag leses uten migrering. I `VilkårsgrunnlagElementData` er `inntektsgrunnlag`, `opptjeningsvurderingId` og `medlemskapsvurderingId` nullbare bare for den nye typen.
- [x] Støtten for den nye typen i modellen og serde er deployet med togglen av før togglen skrus på. Eldre versjoner av Spleis kan ikke lese typen, så når den er tatt i bruk, går vi tilbake ved å skru av togglen, ikke ved å rulle tilbake koden.
- [x] En serde-test sjekker at en person med minimalt vilkårsgrunnlag kan lagres og leses igjen, og at eksisterende JSON leses som før.
- [x] Et ubesvart behov sendes på nytt ved påminnelse.
- [x] Med togglen av går perioden rett til `AvventerVilkårsprøving`, som i dag. Spleis lager ikke minimalt vilkårsgrunnlag, og det fulle vilkårsgrunnlaget får deterministisk ID.
- [x] RV_SØ_53 ved søknadshåndtering er uendret uansett toggle.
- [x] Tilstanden heter `AVVENTER_RETTIGHETSKATEGORI` i `TilstandType`, `TilstandTypeData`, `VedtaksperiodetilstandDto` og `SpannerPersonDto`, og den er med i `vedtaksperiode_endret`. Det er én tilstand for både førstegangsbehandling og revurdering.
- [x] Tilstanden er med i serde i samme deploy som støtten for det minimale vilkårsgrunnlaget, før togglen skrus på. Eldre versjoner av Spleis kan ikke lese person-JSON med tilstanden.
- [x] spleis-api mapper tilstanden til `Periodetilstand.ForberederGodkjenning` for Speil, som `AVVENTER_VILKÅRSPRØVING`.
- [x] Spock og spammer håndterer tilstandsnavnet, se [13: `AVVENTER_RETTIGHETSKATEGORI` i Spock og spammer](13-tilstanden-i-spock-og-spammer.md). De andre konsumentene av tilstandsnavnene trenger ingen endringer, se «Andre merknader» i specen.
- [x] Behovet og løsningen med ID og hovedkategori er lagt inn i `BehovkontraktTest`.
- [x] E2e-tester i sykepenger-model dekker: bare arbeidstaker, bare selvstendig næringsdrivende, forlengelse som ikke går gjennom tilstanden, flere perioder for samme yrkesaktivitet der bare den siste søknaden for den første perioden er med i behovet, to arbeidsgivere der den andre starter etter skjæringstidspunktet, en korrigert søknad for den første perioden, revurdering som flytter skjæringstidspunktet, at det fulle vilkårsgrunnlaget erstatter det minimale med samme ID, et sykefraværstilfelle som forkastes før vilkårsprøving der det minimale vilkårsgrunnlaget forsvinner, ubesvart behov med påminnelse og togglen av.

## Åpne spørsmål

Vi er usikre på disse to valgene i implementeringen:

- **Filteret i Speil-byggeren.** `VilkårsgrunnlagBuilder` i spleis-api (linje 208) tar bare med komplette vilkårsgrunnlag (`filterIsInstance<VilkårsgrunnlagUtDto.Komplett>()`). Speil ser derfor ikke det minimale vilkårsgrunnlaget. Et innslag som bare har et minimalt vilkårsgrunnlag, blir tomt i historikken som Speil får. Vi vet ikke om Speil skal se det minimale vilkårsgrunnlaget eller ID-en, eller om de tomme innslagene kan gi problemer.
- **Når Spleis ikke lagrer det minimale vilkårsgrunnlaget.** `VilkårsgrunnlagHistorikk.lagre` for `Rettighetskategorigrunnlag` (linje 35–51) lagrer ikke det minimale vilkårsgrunnlaget hvis skjæringstidspunktet allerede har et komplett vilkårsgrunnlag. Spleis logger bare en info-melding. ID-en fra sp-rettighetskategori blir da borte, og det komplette vilkårsgrunnlaget beholder ID-en det hadde fra før. Vi vet ikke om det er riktig, eller om Spleis heller skal lagre det minimale vilkårsgrunnlaget eller gi det komplette den nye ID-en.
