# 04: Selvstendig næringsdrivende etter § 8-35

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 2

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** sp-sykepengegrunnlag fastsetter grunnlaget for selvstendig næringsdrivende etter § 8-35 med pensjonsgivende inntekt fra inntektsavklaringen. Når grunnlaget ikke kan fastsettes, svarer tjenesten `IKKE_FASTSATT` med en årsak.

**Blokkeres av:** [01: Skjelett for sp-sykepengegrunnlag for én arbeidstaker](01-skjelett-sp-sykepengegrunnlag.md), [Inntekt 03: Pensjonsgivende inntekt fra Sigrun](../avklare-inntekt/03-pensjonsgivende-inntekt-fra-sigrun.md)

**Status:** klar

## Akseptansekriterier

- [ ] Beregningen er flyttet fra `SelvstendigFaktaavklartInntekt` i Spleis uten å endre reglene: G-justering per år, tak på 6G og 12G og gjennomsnitt av tre år.
- [ ] Færre enn tre fastsatte år gir `utfall: IKKE_FASTSATT` og `årsak: MANGLER_PENSJONSGIVENDE_INNTEKT`.
- [ ] Aktive arbeidsforhold med inntekt i inntektsavklaringen gir `utfall: IKKE_FASTSATT` og `årsak: INNTEKT_FRA_ANNEN_YRKESAKTIVITET`.
- [ ] Et grunnlag med `IKKE_FASTSATT` lagres også.
- [ ] Tilfellene i testene for `SelvstendigFaktaavklartInntekt` i Spleis er flyttet hit og gir de samme tallene.
- [ ] Rapid-tester dekker tre år, inntekt over 6G og 12G, færre enn tre fastsatte år og inntekt fra et arbeidsforhold.
