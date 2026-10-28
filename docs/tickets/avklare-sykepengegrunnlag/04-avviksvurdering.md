# 04: Avviksvurdering for arbeidstaker

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 1

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** Den første automatiske avgjørelsen for en arbeidstaker har en avviksvurdering. Tjenesten ber om sammenligningsgrunnlaget og regner ut avviket med reglene fra Spinnvill. Den svarer med `harAkseptabeltAvvik` i `SykepengegrunnlagResultat`.

**Blokkeres av:** [03: A-ordningen, ghost-arbeidsforhold og flere arbeidsgivere](03-a-ordningen-ghost-og-flere-arbeidsgivere.md)

**Status:** klar

## Akseptansekriterier

- [ ] Tjenesten sender `Sammenligningsgrunnlag` med `skjæringstidspunkt`, `beregningsperiodeFom` og `beregningsperiodeTom` for de tolv månedene før måneden med skjæringstidspunktet.
- [ ] Sammenligningsgrunnlaget lagres per arbeidsgiver og måned, sammen med avviksprosenten.
- [ ] Avviksprosenten og grensen på 25 prosent regnes ut som i Spinnvill i dag.
- [ ] Selvstendig næringsdrivende får ingen avviksvurdering, og `harAkseptabeltAvvik` er `null`.
- [ ] Testene bruker de samme tilfellene som Spinnvill har tester for i dag.
