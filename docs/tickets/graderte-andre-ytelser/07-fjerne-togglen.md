# 07: Fjerne togglen for graderte andre ytelser i Spleis

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `spleis`

**Hva skal lages:** Spleis sender alltid behovet `GraderteAndreYtelserForBeregning` i ytelsesrunden, også i prod. Koden har bare én vei.

**Blokkeres av:** [02: sp-andre-ytelser svarer med versjon og trekk fra sykdomsgrad](02-versjon-og-trekk-i-losningen.md), [03: Spleis leser løsningen fra sp-andre-ytelser og bruker trekket](03-spleis-leser-trekket.md), [04: Spleis lagrer versjonen på endringen i behandlingen](04-spleis-lagrer-versjoner.md), [05: Spleis lagrer `andreYtelserGrad` per utbetalingsdag](05-spleis-lagrer-andre-ytelser-grad.md), [06: Spleis varsler når sykdomsgraden er endret etter fordelingen](06-spleis-varsler-ved-endret-sykdomsgrad.md)

**Status:** klar

## Akseptansekriterier

- [ ] sp-andre-ytelser svarer på behovet i prod, altså er ticket 02 rullet ut.
- [ ] `Toggle.GraderteAndreYtelser` og miljøvariabelen `GRADERTE_ANDRE_YTELSER` er fjernet fra koden og nais-manifestene.
- [ ] Tester som slo togglen av og på, er ryddet.
- [ ] Endringen er rullet ut i prod, og behovet blir løst uten at perioder blir liggende.
