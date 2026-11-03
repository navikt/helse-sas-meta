# 06: Spleis varsler når sykdomsgraden er endret etter fordelingen

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `spleis`

**Hva skal lages:** Når sykdomsgraden saksbehandler så ved fordelingen ikke er lik Spleis' sykdomsgrad for dagen, får vedtaksperioden varselet «Sykdomsgraden er endret etter fordeling av dagen. Fordel dagen på nytt.» Saksbehandler må da fordele dagen på nytt før vedtaket fattes.

**Blokkeres av:** [03: Spleis leser løsningen fra sp-andre-ytelser og bruker trekket](03-spleis-leser-trekket.md)

**Status:** klar

## Akseptansekriterier

- [ ] En ny varselkode i serien `RV_AY` har teksten over.
- [ ] Varselet lages når minst én dag i perioden for behandlingens yrkesaktivitet har en `sykdomsgradFørFordeling` som ikke er lik Spleis' sykdomsgrad. En dag som ikke er sykedag i Spleis, har sykdomsgrad 0 i sammenligningen.
- [ ] Spleis lager ikke varselet når gradene er like, eller når perioden ikke har graderte andre ytelser.
- [ ] Varselet stopper automatisk behandling.
- [ ] E2e-tester i `GraderteAndreYtelserTest` dekker endret sykdomsgrad fra en korrigerende søknad, en overstyrt dag som ikke lenger er sykedag, og like grader uten varsel.
