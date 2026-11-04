# 04: Spleis lagrer versjonen på endringen i behandlingen

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `spleis`

**Hva skal lages:** Endringen i behandlingen husker hvilken versjon av graderte andre ytelser beregningen bygde på, for yrkesaktiviteten som vedtaksperioden tilhører. Det går da an å se i ettertid hvilke fordelinger et vedtak bygde på.

**Blokkeres av:** [03: Spleis leser løsningen fra sp-andre-ytelser og bruker trekket](03-spleis-leser-trekket.md)

**Status:** pågår

## Akseptansekriterier

- [x] `Endring.graderteAndreYtelserId` settes til `versjon` for behandlingens egen yrkesaktivitet. Feltet er tomt når løsningen ikke har noe element for yrkesaktiviteten.
- [x] Versjonene til de andre yrkesaktivitetene lagres ikke på endringen.
- [x] Feltet lagres og leses med serde og er med i DTO-ene. Endringer uten feltet leses som tomme.
- [x] En ny endring etter revurdering får den nye versjonen, og den forrige endringen beholder sin.
- [x] En e2e-test i `GraderteAndreYtelserTest` med to arbeidsgivere sjekker at hver endring har versjonen for sin egen arbeidsgiver, før og etter en ny fordeling. En serde-test dekker gamle data.

## Merknader

- Versjonen følger beregningen. Den settes når endringen får en ny beregning, og nullstilles når beregningen fjernes eller perioden annulleres.
- Koden er ferdig og testet, men ikke committet i spleis. Pre-commit-hooken kjører ktlint, og den feilet fordi sandkassen ikke tillater Gradle-workeren å koble til localhost.
