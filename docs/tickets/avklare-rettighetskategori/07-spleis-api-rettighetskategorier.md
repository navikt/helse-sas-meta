# 07: Endepunkt for rettighetskategorier i spleis-api

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 2

**Repo:** `spleis`

**Hva skal lages:** spleis-api får endepunktet `POST /api/rettighetskategorier`, som gir alle rettighetskategori-ID-ene til en person med det sp-rettighetskategori trenger for å avgjøre hovedkategorien slik Spleis gjorde. Endepunktet følger `OpptjeningApi`.

**Blokkeres av:** [03: Rettighetskategori-ID på alle vilkårsgrunnlag i Spleis](03-rettighetskategori-id-pa-alle-vilkarsgrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Endepunktet tar imot fødselsnummer og svarer med én oppføring per rettighetskategori-ID i de fulle vilkårsgrunnlagene i historikken. Minimale vilkårsgrunnlag (`type: Rettighetskategori`) er ikke med, fordi ID-ene deres kommer fra sp-rettighetskategori.
- [ ] Hver oppføring har ID, skjæringstidspunkt, opprettet fra det første historikkinnslaget med ID-en, kilden til vilkårsgrunnlaget (`SPLEIS` eller `INFOTRYGD`) og om inntektsgrunnlaget har selvstendig inntekt.
- [ ] Hver oppføring har yrkesaktivitetstypene til den første vedtaksperioden for hver yrkesaktivitet som bruker vilkårsgrunnlaget, delt i aktive og forkastede perioder. Spleis velger den første perioden slik den gjør i behovet `Rettighetskategori`, hver for seg blant de aktive og de forkastede periodene.
- [ ] En person som ikke finnes i Spleis, gir en tom liste.
- [ ] sp-rettighetskategori har tilgang til endepunktet med Azure-token i dev og prod.
- [ ] Testene dekker en person med minimalt vilkårsgrunnlag, arbeidstaker, selvstendig, kombinerte og forkastede perioder, flere perioder for samme yrkesaktivitet og vilkårsgrunnlag fra Infotrygd.
