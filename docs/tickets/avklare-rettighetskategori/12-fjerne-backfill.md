# 12: Fjerne backfill

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 4

**Repo:** `sp-rettighetskategori`, `spleis`

**Hva skal lages:** Når alle personer har fått backfill, svarer sp-rettighetskategori bare fra egen database. Backfill, avhengigheten til spleis-api og togglen for fase 3 fjernes. Dette skjer ikke rett etter fase 3, fordi vi venter på at `person_avstemming` har gått gjennom alle personer.

**Blokkeres av:** [11: Skru på togglen for fase 3](11-skru-pa-togglen-for-fase-3.md)

**Status:** klar

## Akseptansekriterier

- [ ] Migreringsloggen viser at alle personer med vilkårsgrunnlag i Spleis har fått backfill etter at fase 3 ble rullet ut i prod.
- [ ] Den siste runden med `person_avstemming` fant ingen nye ID-er.
- [ ] Ingen `RettighetskategoriResultat` har gått til spleis-api den siste tiden, og vi har tall for det.
- [ ] Fallbacken til spleis-api, avstemmingsriveren og klienten mot spleis-api er fjernet fra sp-rettighetskategori.
- [ ] Endepunktet `POST /api/rettighetskategorier` og tilgangen for sp-rettighetskategori er fjernet fra spleis-api.
- [ ] Togglen for fase 3 og koden for togglen-av er fjernet fra Spleis.
