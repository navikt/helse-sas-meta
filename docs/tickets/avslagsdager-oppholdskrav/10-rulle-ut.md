# 10: Rulle ut i dev og prod

**Spec:** [Avslå dager etter oppholdskravet i sp-avslagsdager](../../specs/avslagsdager-oppholdskrav.md)

**Repo:** `spleis`, `sp-avslagsdager`, `spesialist`, `speil`

**Hva skal lages:** Hele flyten virker, først i dev og så i prod. Saksbehandler avslår dager i Speil. Spesialist legger handlingen i totrinnsvurderingen, Spleis revurderer og viser dagene som avvist med `Oppholdskrav`, og beslutter ser visningen.

**Blokkeres av:** [01](01-spesialist-avslagsdager-endret-og-oppholdskrav.md), [03](03-publisere-via-outbox.md), [05](05-svare-pa-behovet-avslagsdager.md), [07](07-spleis-revurderer-ved-avslagsdager-endret.md), [09](09-speil-skjema-for-avslag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Spesialist med `AVSLAGSDAGER_ENDRET` og `OPPHOLDSKRAV` er i drift i dev og prod før noe annet skrus på.
- [ ] sp-avslagsdager svarer på behovet og publiserer meldinger i dev.
- [ ] Togglen i Spleis er på i dev.
- [ ] I dev er hele flyten testet: avslag før beregning, avslag etter utbetaling med revurdering, omgjøring, to arbeidsgivere og totrinnsvurdering med visning.
- [ ] Ingen ubesvarte `Avslagsdager`-behov og ingen feil i loggene til sp-avslagsdager eller Spleis i dev.
- [ ] Sperren i sp-avslagsdager (`oppholdskravvurderingAktivert` i `bootstrap/App.kt` og `check(aktivert)` i `PostOppholdskravvurderingBehandler` og `GetSaksbehandlerhandlingVisningBehandler`, bare `dev-gcp`) er fjernet, slik at endepunktene virker i prod.
- [ ] Speil-backenden er på i prod, og togglen i Spleis er på i prod.
- [ ] Det samme er sjekket i prod etter utrullingen.
