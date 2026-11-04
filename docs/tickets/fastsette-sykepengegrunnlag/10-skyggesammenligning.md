# 10: Skyggesammenligning mot grunnlaget fra Spleis

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 2

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** Når sp-sykepengegrunnlag lager et grunnlag fra backfill for et skjæringstidspunkt der den også har sin egen automatiske fastsettelse, sammenligner den tallene og logger forskjellene. Slik viser vi at arbeidstakere får samme resultat som i dag.

**Blokkeres av:** [09: Backfill i sp-sykepengegrunnlag](09-backfill-i-sp-sykepengegrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Tjenesten sammenligner `beregningsgrunnlag`, `sykepengegrunnlag`, `seksG` og `fastsattÅrsinntekt` per yrkesaktivitet, og `avviksprosent` og `harAkseptabeltAvvik` når Spinnvill har en avviksvurdering for samme vilkårsgrunnlag.
- [ ] Forskjeller logges som advarsel uten personopplysninger i meldingen. Detaljene går til Team Logs, etter skillen for sykepenger-logging.
- [ ] En metrikk teller sammenligninger per utfall (`likt` eller `ulikt`) og type (arbeidstaker eller selvstendig).
- [ ] Det finnes et Grafana-panel for metrikken.
- [ ] Rapid-tester dekker like og ulike tall for arbeidstaker og selvstendig næringsdrivende.
