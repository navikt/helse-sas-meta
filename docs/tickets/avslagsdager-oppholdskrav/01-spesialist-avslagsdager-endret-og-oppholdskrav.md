# 01: Spesialist kjenner `AVSLAGSDAGER_ENDRET` og begrunnelsen `Oppholdskrav`

**Spec:** [Avslå dager etter oppholdskravet i sp-avslagsdager](../../specs/avslagsdager-oppholdskrav.md)

**Repo:** `spesialist`

**Hva skal lages:** Spesialist tar imot `saksbehandlerhandling` med `handlingType` `AVSLAGSDAGER_ENDRET`. Handlingen lagres og legges i totrinnsvurderingen, som for `MANUELT_VURDERT_OPPTJENING`. Speil får den i listen over saksbehandlerhandlinger. Snapshotet fra Spleis kan også inneholde begrunnelsen `Oppholdskrav` på avviste dager, og Speil får den som `OPPHOLDSKRAV` i `ApiDag`.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** ferdig

## Akseptansekriterier

- [x] `HandlingType.AVSLAGSDAGER_ENDRET` finnes i domenet, i `ApiHandlingType` og i mappingen mellom dem.
- [x] `SaksbehandlerhandlingRiver` godtar `AVSLAGSDAGER_ENDRET` med `behandlingId` og uten `skjæringstidspunkt`.
- [x] `kreverTotrinnsvurdering = true` legger handlingen i den aktive totrinnsvurderingen eller oppretter en.
- [x] Begrunnelsen `Oppholdskrav` finnes i spesialist-klienten for Spleis, `OPPHOLDSKRAV` finnes i `ApiDag`, og de er mappet mot hverandre.
- [x] Riverstesten for `saksbehandlerhandling` har et tilfelle med `AVSLAGSDAGER_ENDRET`.
- [x] En test sjekker at et snapshot med `Oppholdskrav` gir `OPPHOLDSKRAV` i `ApiDag`.
- [ ] Endringen er i drift i dev og prod før ticket 10 skrur på togglen i Spleis.
