# 10: Dagoversikten får kolonnen «Andre ytelser» med fordelingen for hver dag

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Brukerhistorier:** 10

**Hva skal lages:** Saksbehandler og beslutter ser i en ny kolonne, «Andre ytelser», hvilke dager som har graderte andre ytelser, og hvordan dagen er fordelt. I dag henter Speil de lagrede fordelingene, men bruker dem bare til å sjekke om en endring er reell (`erReellEndring`). De vises ingen steder, og dagoversikten har ingen kolonne for dem.

**Blokkeres av:** [09: Speil lagrer fordelingene i sp-andre-ytelser med sykdomsgraden før fordeling](09-speil-lagrer-fordelinger-i-sp-andre-ytelser.md)

**Status:** ferdig

## Akseptansekriterier

- [x] Dagoversikten har en ny kolonne med overskriften «Andre ytelser», mellom Grad og Total grad.
- [x] For en dag med en fordeling viser kolonnen den samlede graden for de andre ytelsene, for eksempel «40 %».
- [x] Kolonnen Merknader viser hvilke ytelser dagen er gradert mot, kommaseparert, for eksempel «Pleiepenger, foreldrepenger».
- [x] Kolonnen viser «-» for dager uten fordeling og er tom for helgedager, som de andre kolonnene.
- [x] Fordelingen hentes for yrkesaktiviteten som tabellen gjelder. Fordelinger for andre yrkesaktiviteter vises ikke.
- [x] Dager uten fordeling vises som før.
- [x] Kolonnen og merknaden vises også i den skrivebeskyttede dagoversikten (`ReadonlyUtbetaling`), som beslutter ser. I dag henter bare `OverstyrbarUtbetaling` fordelingene.
- [x] Kolonnen og visningen er bak togglen for graderte andre ytelser. Uten togglen ser dagoversikten ut som før.
- [x] Tester dekker kolonneoverskriften med togglen av og på, en dag med fordeling og merknaden, en dag uten fordeling en fordeling for en annen yrkesaktivitet og den skrivebeskyttede dagoversikten.

## Merknader fra implementasjonen

- Kolonnen står rett etter Grad, før Kilde.
