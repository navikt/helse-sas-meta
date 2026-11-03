# 03: Vurderingen publiseres til spesialist og Spleis via outbox

**Spec:** [Avslå dager etter oppholdskravet i sp-avslagsdager](../../specs/avslagsdager-oppholdskrav.md)

**Repo:** `sp-avslagsdager`

**Hva skal lages:** Når en vurdering lagres, legger appen to meldinger i outboxen i samme transaksjon. `saksbehandlerhandling` går til spesialist, og `avslagsdager_endret` går til Spleis. En publiseringsjobb med leader election sender meldingene på rapiden med fødselsnummeret som nøkkel. Outboxen og leader election kopieres fra sp-vilkarsproving.

**Blokkeres av:** [02: Saksbehandler kan lagre en vurdering av oppholdskravet](02-lagre-vurdering-av-oppholdskravet.md)

**Status:** ferdig

## Akseptansekriterier

- [x] `saksbehandlerhandling` har feltene `fødselsnummer`, `saksbehandlerIdent`, `handlingId` (vurderings-ID-en), `handlingType: "AVSLAGSDAGER_ENDRET"`, `kreverTotrinnsvurdering: true`, `tidspunkt` og `behandlingId`, og ikke `skjæringstidspunkt`.
- [x] `avslagsdager_endret` har feltene `fødselsnummer`, `vurderingId` og `perioder`, der `perioder` er alle dagene i vurderingen gruppert til sammenhengende `{fom, tom}`. Meldingen har ikke utfallet.
- [x] Dager som ikke henger sammen, gir flere perioder.
- [x] Vurderingen og begge meldingene lagres i samme transaksjon. Feiler lagringen, blir ingen meldinger sendt.
- [x] Bare lederen publiserer, og en melding sendes ikke på nytt etter at den er publisert.
- [x] Nais-manifestet har det leader election trenger.
- [x] Tester sjekker at et `POST` gir begge meldingene på rapiden med riktige felter.
