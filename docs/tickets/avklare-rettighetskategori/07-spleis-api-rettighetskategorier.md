# 07: Endepunkt for rettighetskategorier i spleis-api

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 2

**Repo:** `spleis`

**Hva skal lages:** spleis-api får endepunktet `POST /api/rettighetskategorier`, som gir alle rettighetskategori-ID-ene til en person med det sp-rettighetskategori trenger for å avgjøre hovedkategorien slik Spleis gjorde. Endepunktet følger `OpptjeningApi`.

**Blokkeres av:** [03: Rettighetskategori-ID på alle vilkårsgrunnlag i Spleis](03-rettighetskategori-id-pa-alle-vilkarsgrunnlag.md)

**Status:** ferdig

## Akseptansekriterier

- [x] Endepunktet tar imot fødselsnummer og svarer med én oppføring per rettighetskategori-ID i de fulle vilkårsgrunnlagene i historikken. Minimale vilkårsgrunnlag (`type: Rettighetskategori`) er ikke med, fordi ID-ene deres kommer fra sp-rettighetskategori.
- [x] Hver oppføring har ID, skjæringstidspunkt, opprettet fra det første historikkinnslaget med ID-en, kilden til vilkårsgrunnlaget (`SPLEIS` eller `INFOTRYGD`) og om inntektsgrunnlaget har selvstendig inntekt.
- [x] Hver oppføring har yrkesaktivitetstypene til den første vedtaksperioden for hver yrkesaktivitet som bruker vilkårsgrunnlaget, delt i aktive og forkastede perioder. Spleis velger den første perioden slik den gjør i behovet `Rettighetskategori`, hver for seg blant de aktive og de forkastede periodene.
- [x] En person som ikke finnes i Spleis, gir en tom liste.
- [x] sp-rettighetskategori har tilgang til endepunktet med Azure-token i dev og prod.
- [ ] Testene dekker en person med minimalt vilkårsgrunnlag, arbeidstaker, selvstendig, kombinerte og forkastede perioder, flere perioder for samme yrkesaktivitet og vilkårsgrunnlag fra Infotrygd.

## Merknader

- Endepunktet er laget i spleis (commit `5279cc7aee`). Det som gjenstår:
  - Tilgangen for sp-rettighetskategori er lagt inn i `.nais/spleis-api.yaml`, men er ikke deployet til dev og prod ennå.
  - Det minimale vilkårsgrunnlaget finnes ikke før [04](04-spleis-avventer-rettighetskategori.md). Endepunktet velger kilde med en uttømmende `when` over `VilkårsgrunnlagUtDto`, så 04 må ta stilling til den nye typen der. Testen med minimalt vilkårsgrunnlag skrives i 04.
- Testene for arbeidstaker, selvstendig, kombinerte og forkastede perioder, flere perioder for samme yrkesaktivitet og Infotrygd ligger i `RettighetskategorierTest` og `RettighetskategoriApiTest`.
- En periode hører til vilkårsgrunnlaget når den har samme skjæringstidspunkt, slik som i behovet `Rettighetskategori`. Vilkårsgrunnlags-ID-en på endringen kan ikke brukes, fordi den først settes ved beregning.
- Yrkesaktivitetstypen ligger på yrkesaktiviteten og ikke på perioden. Derfor gir hver yrkesaktivitet med minst én periode én oppføring, og det trengs ikke noe eget valg av den første perioden.
- Kjent unøyaktighet: Flere rettighetskategori-ID-er for samme skjæringstidspunkt får de samme periodene, nemlig de som finnes nå. Kommer det en ny yrkesaktivitet etter den første vilkårsprøvingen, får også den eldste ID-en med den nye yrkesaktiviteten. Den eldste ID-en har eldst `opprettet`, så den blir ikke gjeldende avgjørelse i sp-rettighetskategori.
- Svaret ser slik ut. Yrkesaktivitetstypene er verdiene i `YrkesaktivitetstypeDto` (`ARBEIDSTAKER`, `SELVSTENDIG`, `FRILANS`, `ARBEIDSLEDIG`), med én verdi per yrkesaktivitet. Fisker, jordbruker og barnepasser er `SELVSTENDIG`.

  ```json
  {
    "rettighetskategorier": [
      {
        "rettighetskategoriId": "22fa796c-aa49-351a-9d95-6be904d95777",
        "skjæringstidspunkt": "2018-01-01",
        "opprettet": "2022-08-31T09:52:08.494020",
        "kilde": "INFOTRYGD",
        "harSelvstendigInntekt": false,
        "yrkesaktivitetstyper": { "aktive": ["ARBEIDSTAKER"], "forkastede": [] }
      }
    ]
  }
  ```
