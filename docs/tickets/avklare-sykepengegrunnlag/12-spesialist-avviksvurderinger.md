# 12: Endepunkt for avviksvurderinger i Spesialist

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 2

**Repo:** `spesialist`

**Hva skal lages:** sp-sykepengegrunnlag kan hente avviksvurderingene til en person med `POST /api/avviksvurderinger`, slik at eldre saker får med avviket i backfill.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] Endepunktet tar inn `fødselsnummer` og krever maskin-til-maskin-token, og bare sp-sykepengegrunnlag har tilgang.
- [ ] Svaret har én rad per avviksvurdering som er knyttet til et vilkårsgrunnlag, med alle feltene i specen.
- [ ] Avviksvurderinger uten kobling til et vilkårsgrunnlag er ikke med.
- [ ] Tester dekker en person med flere avviksvurderinger, en uten og manglende tilgang.
