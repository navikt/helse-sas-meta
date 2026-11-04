# 04: Spleis lagrer versjonen på endringen i behandlingen

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `spleis`

**Hva skal lages:** Endringen i behandlingen husker hvilken versjon av graderte andre ytelser beregningen bygde på, for yrkesaktiviteten som vedtaksperioden tilhører. Det går da an å se i ettertid hvilke fordelinger et vedtak bygde på.

**Blokkeres av:** [03: Spleis leser løsningen fra sp-andre-ytelser og bruker trekket](03-spleis-leser-trekket.md)

**Status:** pågår

## Akseptansekriterier

- [ ] `Endring.graderteAndreYtelserId` settes til `versjon` for behandlingens egen yrkesaktivitet. Feltet er tomt når løsningen ikke har noe element for yrkesaktiviteten.
- [ ] Versjonene til de andre yrkesaktivitetene lagres ikke på endringen.
- [ ] Feltet lagres og leses med serde og er med i DTO-ene. Endringer uten feltet leses som tomme.
- [ ] En ny endring etter revurdering får den nye versjonen, og den forrige endringen beholder sin.
- [ ] En e2e-test i `GraderteAndreYtelserTest` med to arbeidsgivere sjekker at hver endring har versjonen for sin egen arbeidsgiver, før og etter en ny fordeling. En serde-test dekker gamle data.
