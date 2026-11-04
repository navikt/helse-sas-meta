# 08: `AVVENTER_INNTEKTSAVKLARING` og `AVVENTER_SYKEPENGEGRUNNLAG` i Spock og spammer

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 1

**Repo:** `spock`, `spammer`

**Hva skal lages:** Spock påminner perioder i de to nye tilstandene etter én time, og spammer sier fra i Slack når en periode er påminnet mange ganger i dem. Ticketen gjelder begge specene.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] Spock har `AVVENTER_INNTEKTSAVKLARING` og `AVVENTER_SYKEPENGEGRUNNLAG` i gruppen med påminnelse etter én time, sammen med `AVVENTER_VILKÅRSPRØVING`.
- [ ] spammer har begge tilstandene i `interessanteTilstander`.
- [ ] Begge er deployet før togglen i Spleis skrus på i ticket [10](10-rulle-ut-fase-1.md).
