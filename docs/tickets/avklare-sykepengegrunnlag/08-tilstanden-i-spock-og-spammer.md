# 08: `AVVENTER_SYKEPENGEGRUNNLAG` i Spock og spammer

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 1

**Repo:** `spock`, `spammer`

**Hva skal lages:** Perioder i `AVVENTER_SYKEPENGEGRUNNLAG` får påminnelse etter én time. spammer varsler i Slack når en periode er påminnet mange ganger i tilstanden.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] Spock legger `AVVENTER_SYKEPENGEGRUNNLAG` i gruppen med påminnelse etter én time, sammen med `AVVENTER_VILKÅRSPRØVING` og `AVVENTER_RETTIGHETSKATEGORI`.
- [ ] spammer har `AVVENTER_SYKEPENGEGRUNNLAG` i `interessanteTilstander`.
- [ ] Begge er deployet før togglen for fase 1 skrus på i dev.
- [ ] De eksisterende testene i begge repoene dekker den nye tilstanden.
