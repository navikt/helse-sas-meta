# 05: Selvstendig næringsdrivende med pensjonsgivende inntekt fra Sigrun

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 1

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** Tjenesten avgjør sykepengegrunnlaget for selvstendig næringsdrivende etter § 8-35. Den henter pensjonsgivende inntekt fra Sigrun for de tre siste ferdiglignede årene og G-justerer og avgrenser på samme måte som Spleis. Finnes ikke tre ferdiglignede år, svarer den med `FÆRRE_ENN_TRE_FERDIGLIGNEDE_ÅR`.

**Blokkeres av:** [02: Skjelett for sp-sykepengegrunnlag som svarer på behov](02-skjelett-sp-sykepengegrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Før implementasjonen er det sjekket mot feilkodene til Skatteetaten hva PGIF-008 og PGIF-006 betyr, og svaret er ført inn i specen.
- [ ] Tjenesten kaller `POST /api/v1/pensjonsgivendeinntektforfolketrygden` med `personident`, `inntektsaar` og `rettighetspakke` `navSykepenger`, med Azure client credentials mot `team-inntekt.sigrun`.
- [ ] Tjenesten begynner på året før skjæringstidspunktet og hopper over år som ikke er ferdiglignet. Den stopper ved tre ferdiglignede år og går ikke lenger tilbake enn 2017.
- [ ] Et ferdiglignet år uten pensjonsgivende inntekt teller som 0 kroner.
- [ ] Årsbeløpet er summen av de fire feltene i specen for alle skatteordningene.
- [ ] G-justeringen, avgrensningen ved 6G og 12G og avrundingen gir samme beløp som Spleis gir for de samme årene.
- [ ] Færre enn tre ferdiglignede år gir `utfall` `FÆRRE_ENN_TRE_FERDIGLIGNEDE_ÅR`.
- [ ] Svarene fra Sigrun lagres per år og felt, sammen med G-verdiene som er brukt.
- [ ] `SykepengegrunnlagResultat` har én yrkesaktivitet med `yrkesaktivitetstype` `SELVSTENDIG` og `inntektskilde` `SIGRUN`.
- [ ] Feil fra Sigrun gir ubesvart behov.
- [ ] Testene dekker år som ikke er ferdiglignet, år uten inntekt, grensen ved 2017 og flere skatteordninger. De dekker også de samme beregningstilfellene som Spleis har tester for i dag.
