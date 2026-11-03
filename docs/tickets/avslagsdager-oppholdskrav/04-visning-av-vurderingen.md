# 04: Visning av vurderingen

**Spec:** [Avslå dager etter oppholdskravet i sp-avslagsdager](../../specs/avslagsdager-oppholdskrav.md)

**Repo:** `sp-avslagsdager`

**Hva skal lages:** Saksbehandler og beslutter kan åpne en saksbehandlerhandling av typen `AVSLAGSDAGER_ENDRET` og se detaljene. `GET /api/personer/{personId}/saksbehandlerhandlinger/{handlingId}/visning` gir feltene for vurderingen i samme form som i sp-vilkarsproving.

**Blokkeres av:** [02: Saksbehandler kan lagre en vurdering av oppholdskravet](02-lagre-vurdering-av-oppholdskravet.md)

**Status:** ferdig

## Akseptansekriterier

- [x] Endepunktet krever `Tilgang.Les` og bruker `KallKontekst.medPerson`.
- [x] `handlingId` er vurderings-ID-en. En ukjent ID eller en vurdering som gjelder en annen person, gir 404.
- [x] Svaret er `{ "felter": [...] }` med `TEKST` (`tittel`, `tekst`) og `LISTE` (`tittel`, `elementer`).
- [x] Feltene kommer i denne rekkefølgen: dagene som sammenhengende perioder, utfallet, vilkårsvurderingene med lovreferanse og utfall, fritekstbegrunnelsen og journalpostene.
- [x] Endepunktet er med i OpenAPI-spesifikasjonen, og `EKSPONER_OPENAPI` er på i dev, slik at Speil kan lage klienten.
- [x] REST-tester for avslag, omgjøring, ukjent `handlingId`, en annen person og manglende tilgang.
