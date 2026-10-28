# 16: Totrinnsvurdering for overstyringer fra sp-sykepengegrunnlag i Spesialist

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `spesialist`

**Hva skal lages:** Når sp-sykepengegrunnlag sender `saksbehandlerhandling` for en skjønnsfastsettelse eller en overstyring av inntekt eller arbeidsforhold, krever Spesialist totrinnsvurdering, som for opptjening.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] `HandlingType` har de nye verdiene `SKJØNNSFASTSATT_SYKEPENGEGRUNNLAG`, `OVERSTYRT_INNTEKT` og `OVERSTYRT_ARBEIDSFORHOLD`.
- [ ] `SaksbehandlerhandlingRiver` tar imot de nye verdiene og krever totrinnsvurdering når `kreverTotrinnsvurdering` er `true`.
- [ ] Testene i spesialist-e2e-tests dekker de tre nye verdiene.
