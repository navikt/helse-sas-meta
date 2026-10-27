# 07: Endepunkt for rettighetskategorier i spleis-api

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 2

**Repo:** `spleis`

**Hva skal lages:** spleis-api får endepunktet `POST /api/rettighetskategorier`, som gir alle rettighetskategori-ID-ene til en person med det sp-rettighetskategori trenger for å avgjøre hovedkategorien slik Spleis gjorde. Endepunktet følger `OpptjeningApi`.

**Blokkeres av:** [03: Rettighetskategori-ID på alle vilkårsgrunnlag i Spleis](03-rettighetskategori-id-pa-alle-vilkarsgrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Endepunktet tar imot fødselsnummer og svarer med én oppføring per rettighetskategori-ID i vilkårsgrunnlagshistorikken.
- [ ] Hver oppføring har ID, skjæringstidspunkt, opprettet fra det første historikkinnslaget med ID-en, kilden til vilkårsgrunnlaget (`SPLEIS` eller `INFOTRYGD`) og om inntektsgrunnlaget har selvstendig inntekt.
- [ ] Hver oppføring har yrkesaktivitetstypene til vedtaksperiodene som bruker vilkårsgrunnlaget, delt i aktive og forkastede perioder.
- [ ] En person som ikke finnes i Spleis, gir en tom liste.
- [ ] sp-rettighetskategori har tilgang til endepunktet med Azure-token i dev og prod.
- [ ] Testene dekker arbeidstaker, selvstendig, kombinerte og forkastede perioder og vilkårsgrunnlag fra Infotrygd.
