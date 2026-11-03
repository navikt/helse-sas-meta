# 05: sp-avslagsdager svarer på behovet `Avslagsdager`

**Spec:** [Avslå dager etter oppholdskravet i sp-avslagsdager](../../specs/avslagsdager-oppholdskrav.md)

**Repo:** `sp-avslagsdager`

**Hva skal lages:** Spleis spør med vurderings-ID-ene som gjelder for en periode, og sp-avslagsdager svarer med de avslåtte dagene i hver av vurderingene, sammen med vilkårskodene som ikke er oppfylt. Spleis avgjør selv hvilken vurdering som gjelder for hver dag (ADR 0005), så appen trenger ikke å vite noe om perioden.

**Blokkeres av:** [02: Saksbehandler kan lagre en vurdering av oppholdskravet](02-lagre-vurdering-av-oppholdskravet.md)

**Status:** klar

## Akseptansekriterier

- [ ] En river tar imot behovet `Avslagsdager` med `fødselsnummer` og `Avslagsdager.vurderingIder`.
- [ ] Løsningen er `@løsning.Avslagsdager.avslagsdager`, en liste med `{ "vurderingId", "dato", "vilkårskoder" }`, med én oppføring per dag i hver vurdering der utfallet er `IkkeOppfylt`.
- [ ] En vurdering med utfallet `Oppfylt` gir ingen oppføringer.
- [ ] Er det ingen avslåtte dager, er listen tom.
- [ ] En ukjent vurderings-ID, eller en ID som gjelder en annen person, gir ingen løsning, og feilen logges.
- [ ] Rapid-tester med ekte Postgres dekker én og flere vurderings-ID-er, en vurdering med utfallet `Oppfylt`, en ukjent ID og en ID for en annen person. Tester å bygge videre på: riverstestene i `infra/kafka` i sp-vilkarsproving.
