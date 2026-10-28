# 19: Kartlegge og samle lesingen av inntektsgrunnlaget i Spleis

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 3 (forberedelse)

**Repo:** `spleis`

**Hva skal lages:** Alt i Spleis som leser beløpene i inntektsgrunnlaget, gjør det gjennom ett sted. Da kan [20](20-minsteinntekt-med-oppslag.md) og [21](21-beregne-med-oppslag.md) bytte kilde for beløpene uten å endre hver leser. Oppførselen er uendret.

**Blokkeres av:** [06: Sykepengegrunnlag-ID på alle vilkårsgrunnlag i Spleis](06-sykepengegrunnlag-id-pa-alle-vilkarsgrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Alle som leser beløpene, er kartlagt: minsteinntekt, beregningen, ghost-arbeidsforhold, byggerne for Speil, `UtkastTilVedtakBuilder`, `avsluttet_med_vedtak`, godkjenningsbehovet og andre utgående hendelser.
- [ ] For hver leser er det avgjort om den skal bruke oppslaget i fase 3 eller slutte å sende beløpene. Avgjørelsen er ført inn i [21](21-beregne-med-oppslag.md).
- [ ] Leserne bruker ett felles grensesnitt for beløpene, og det fylles fra Spleis' eget inntektsgrunnlag.
- [ ] Alle eksisterende tester er grønne uten endringer i forventede verdier.
