# 07: Endepunkt for avviksvurderinger i Spinnvill

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 2

**Repo:** `spinnvill`

**Hva skal lages:** Spinnvill har `POST /api/avviksvurderinger`, som gir alle avviksvurderingene for en person med beregningsgrunnlaget, sammenligningsgrunnlaget og de `vilkårsgrunnlagId`-ene de er koblet til. sp-inntekt og sp-sykepengegrunnlag bruker det til backfill.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] Endepunktet tar `{ "fødselsnummer": string }` og svarer med feltene i specen for sykepengegrunnlaget.
- [ ] `vilkårsgrunnlagIder` kommer fra koblingstabellen og de lagrede behovene.
- [ ] Slettede avviksvurderinger og avviksvurderinger med kilde `INFOTRYGD` er ikke med.
- [ ] Endepunktet krever maskin-til-maskin-token, og bare sp-inntekt og sp-sykepengegrunnlag har tilgang.
- [ ] Tester dekker en person med flere avviksvurderinger, en slettet avviksvurdering og en person uten avviksvurderinger.
- [ ] Det åpne spørsmålet nedenfor er besvart, og svaret står i specen.

## Merknader

- **Åpent spørsmål fra specen:** Har Spinnvill koblinger til `vilkårsgrunnlagId` for alle avviksvurderinger som er brukt i et vedtak? Sjekk i prod. Mangler koblinger, kan vi bruke `vilkarsgrunnlag_per_avviksvurdering` i Spesialist i tillegg.
