# 02: Flere arbeidsgivere, a-ordningen, korrigerte inntekter og deaktiverte arbeidsforhold

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 2

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** sp-sykepengegrunnlag fastsetter grunnlaget for arbeidstakere med flere arbeidsgivere, inntekt fra a-ordningen, arbeidsforhold uten søknad, korrigerte inntekter, deaktiverte arbeidsforhold og vilkårsgrunnlag fra Infotrygd, med de samme reglene som `Inntektsgrunnlag` i Spleis.

**Blokkeres av:** [01: Skjelett for sp-sykepengegrunnlag for én arbeidstaker](01-skjelett-sp-sykepengegrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Inntekt fra a-ordningen regnes om med gjennomsnittet av de tre månedene, som i Spleis.
- [ ] Korrigert inntekt brukes i stedet for inntekten fra inntektsmeldingen eller a-ordningen.
- [ ] Deaktiverte arbeidsforhold er ikke med i grunnlaget og står i `deaktiverteArbeidsforhold`.
- [ ] Arbeidsforhold uten søknad er med i grunnlaget som i dag.
- [ ] Inntekt fra Infotrygd gir `fastsettelse: I_INFOTRYGD`.
- [ ] Tilfellene i testene for `Inntektsgrunnlag` i Spleis er flyttet hit og gir de samme tallene.
- [ ] Rapid-tester dekker flere arbeidsgivere med inntektsmelding og a-ordningen, korrigert inntekt, deaktivert arbeidsforhold og arbeidsforhold uten søknad.

## Merknader

- **Åpent spørsmål fra specen:** Skal sp-sykepengegrunnlag sende subsumsjonsmeldinger for §§ 8-10, 8-30 og 8-35? Det må avklares før byttet (ticket [22](22-bytte.md)).
