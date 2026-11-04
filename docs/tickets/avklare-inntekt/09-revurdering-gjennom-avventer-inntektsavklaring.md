# 09: Revurdering gjennom `AvventerInntektsavklaring`

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 1

**Repo:** `spleis`

**Hva skal lages:** Når en ny inntektsmelding eller nye arbeidsgiveropplysninger kommer for et skjæringstidspunkt med fullt vilkårsgrunnlag, eller Spleis får `endret_inntektsavklaring`, går perioden gjennom `AvventerInntektsavklaring` og `AvventerRettighetskategori` med `nyInnhenting: false`. Deretter går den til `AvventerHistorikkRevurdering` uten ny vilkårsprøving. Spleis lagrer den nye ID-en i en kopi av det fulle vilkårsgrunnlaget, men bare som ID å sende videre før byttet.

**Blokkeres av:** [07: `AvventerInntektsavklaring` i Spleis bak toggle](07-spleis-avventer-inntektsavklaring.md)

**Status:** klar

## Akseptansekriterier

- [ ] Ny inntektsmelding for en arbeidsgiver i sykefraværstilfellet med fullt vilkårsgrunnlag gir revurdering gjennom tilstanden.
- [ ] Spleis leser `endret_inntektsavklaring` med `fødselsnummer`, `skjæringstidspunkt` og `inntektsavklaringId` og starter revurdering. Ukjente skjæringstidspunkter ignoreres. ID-en i hendelsen brukes bare til logging.
- [ ] Behovet har `nyInnhenting: false` når skjæringstidspunktet har fullt vilkårsgrunnlag.
- [ ] Før byttet har det fulle vilkårsgrunnlaget fortsatt den deterministiske ID-en. ID-en fra sp-inntekt sendes bare videre i neste behov.
- [ ] Med togglen av revurderes det som i dag.
- [ ] E2e-tester dekker ny inntektsmelding, `endret_inntektsavklaring` og ukjent skjæringstidspunkt.

## Merknader

- Etter `AvventerRettighetskategori` går perioden via `AvventerSykepengegrunnlag` når ticket [06 i sykepengegrunnlaget](../fastsette-sykepengegrunnlag/06-spleis-avventer-sykepengegrunnlag.md) er ferdig.
