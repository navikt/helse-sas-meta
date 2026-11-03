# 01: Spesialist kjenner `AVSLAGSDAGER_ENDRET` og begrunnelsen `Oppholdskrav`

**Spec:** [Avslå dager etter oppholdskravet i sp-avslagsdager](../../specs/avslagsdager-oppholdskrav.md)

**Repo:** `spesialist`

**Hva skal lages:** Spesialist tar imot `saksbehandlerhandling` med `handlingType` `AVSLAGSDAGER_ENDRET`. Handlingen lagres og legges i totrinnsvurderingen, som for `MANUELT_VURDERT_OPPTJENING`. Speil får den i listen over saksbehandlerhandlinger. Snapshotet fra Spleis kan også inneholde begrunnelsen `Oppholdskrav` på avviste dager, og Speil får den som `OPPHOLDSKRAV` i `ApiDag`.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] `HandlingType.AVSLAGSDAGER_ENDRET` finnes i domenet, i `ApiHandlingType` og i mappingen mellom dem.
- [ ] `SaksbehandlerhandlingRiver` godtar `AVSLAGSDAGER_ENDRET` med `behandlingId` og uten `skjæringstidspunkt`.
- [ ] `kreverTotrinnsvurdering = true` legger handlingen i den aktive totrinnsvurderingen eller oppretter en.
- [ ] Begrunnelsen `Oppholdskrav` finnes i spesialist-klienten for Spleis, `OPPHOLDSKRAV` finnes i `ApiDag`, og de er mappet mot hverandre.
- [ ] Riverstesten for `saksbehandlerhandling` har et tilfelle med `AVSLAGSDAGER_ENDRET`.
- [ ] En test sjekker at et snapshot med `Oppholdskrav` gir `OPPHOLDSKRAV` i `ApiDag`.
- [ ] Endringen er i drift i dev og prod før ticket 10 skrur på togglen i Spleis.
