# 08: Speil viser handlingen og `Oppholdskrav`

**Spec:** [Avslå dager etter oppholdskravet i sp-avslagsdager](../../specs/avslagsdager-oppholdskrav.md)

**Repo:** `speil`

**Hva skal lages:** Speil kan snakke med sp-avslagsdager. I listen over saksbehandlerhandlinger vises `AVSLAGSDAGER_ENDRET` med tekst, og visningen hentes fra sp-avslagsdager. Avviste dager med begrunnelsen `OPPHOLDSKRAV` får tekst i dagoversikten.

**Blokkeres av:** [01: Spesialist kjenner `AVSLAGSDAGER_ENDRET` og begrunnelsen `Oppholdskrav`](01-spesialist-avslagsdager-endret-og-oppholdskrav.md), [04: Visning av vurderingen](04-visning-av-vurderingen.md)

**Status:** ferdig

## Akseptansekriterier

- [x] Ny backend `avslagsdager` med proxy-ruter, som `vilkarsproving`. Først bare i dev.
- [x] orval lager klienten fra OpenAPI-spesifikasjonen til sp-avslagsdager.
- [x] `deploy/{dev,prod}.yml` har outbound til sp-avslagsdager og scope og URL i miljøvariablene.
- [x] Spesialist-klienten er generert på nytt med `AVSLAGSDAGER_ENDRET` og `OPPHOLDSKRAV`.
- [x] `AVSLAGSDAGER_ENDRET` har tekst i listen over saksbehandlerhandlinger og henter visningen fra `avslagsdager`.
- [x] `OPPHOLDSKRAV` har tekst i merknadene for avviste dager.
- [x] Mock i spesialist-mock for den nye handlingen og visningen.
- [x] Tester for valget av backend og for teksten.
