# 14: Nye verdier i `HandlingType` i Spesialist

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 3

**Repo:** `spesialist`

**Hva skal lages:** Spesialist tar imot `saksbehandlerhandling` med de fire nye verdiene `KORRIGERT_INNTEKT`, `ARBEIDSFORHOLD_DEAKTIVERT`, `ARBEIDSFORHOLD_AKTIVERT` og `SKJØNNSFASTSATT_SYKEPENGEGRUNNLAG`, og legger til totrinnsvurdering som for de andre handlingene. Ticketen gjelder begge specene.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] `HandlingType` har de fire nye verdiene.
- [ ] En `saksbehandlerhandling` med en av verdiene og `kreverTotrinnsvurdering: true` gir totrinnsvurdering på oppgaven, som for `MANUELT_VURDERT_OPPTJENING`.
- [ ] Handlingene vises i listen over saksbehandlerhandlinger til Speil.
- [ ] Tester dekker hver av de fire verdiene.
