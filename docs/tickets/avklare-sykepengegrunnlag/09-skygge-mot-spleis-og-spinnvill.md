# 09: Skygge mot Spleis og Spinnvill

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 1

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** I fase 1 og 2 sammenligner sp-sykepengegrunnlag sine avgjørelser med det Spleis og Spinnvill kommer fram til. Vi ser forskjellene i logger og i en metrikk.

**Blokkeres av:** [04: Avviksvurdering for arbeidstaker](04-avviksvurdering.md), [05: Selvstendig næringsdrivende med pensjonsgivende inntekt fra Sigrun](05-selvstendig-naeringsdrivende-med-sigrun.md), [06: Sykepengegrunnlag-ID på alle vilkårsgrunnlag i Spleis](06-sykepengegrunnlag-id-pa-alle-vilkarsgrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Tjenesten lytter på behovet `Godkjenning` uten å svare på det.
- [ ] Har avgjørelsen med `sykepengegrunnlagId` kilde `automatisk`, sammenligner tjenesten beløpene med `sykepengegrunnlagsfakta`: per arbeidsgiver, sykepengegrunnlaget, 6G og de pensjonsgivende inntektene per år.
- [ ] Avgjørelser med deterministisk ID eller som er ukjente, sammenlignes ikke.
- [ ] Tjenesten lytter på løsningen på `Avviksvurdering` fra Spinnvill. Den finner sykepengegrunnlag-ID-en med `vilkårsgrunnlagId` fra godkjenningsbehovet og sammenligner avviksprosenten.
- [ ] For selvstendig næringsdrivende logges hvilke år og beløp som er ulike mellom Sigrun og søknaden.
- [ ] Forskjellene logges uten personopplysninger i nav-logs og telles i en metrikk etter type.
- [ ] Integrasjonstester dekker like beløp, ulike beløp, ulik avviksprosent og deterministisk ID.
