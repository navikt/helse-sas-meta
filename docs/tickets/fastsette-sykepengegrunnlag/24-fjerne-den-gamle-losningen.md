# 24: Fjerne den gamle løsningen

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 4

**Repo:** `spleis`, `spesialist`, `spinnvill`, `spregulering`

**Hva skal lages:** Spleis slutter å lage sitt eget `Inntektsgrunnlag` og å sende `sykepengegrunnlagsfakta`. Spinnvill og Spregulering skrus av og arkiveres, og skjønnsfastsettelsen og inntektsdelen av overstyringene fjernes fra Spesialist. Togglene fjernes. Ticketen gjelder begge specene.

**Blokkeres av:** [23: Fjerne backfill](23-fjerne-backfill.md)

**Status:** klar

## Akseptansekriterier

- [ ] Det åpne spørsmålet nedenfor er besvart, og alle konsumentene har byttet til ID-en.
- [ ] `Inntektsgrunnlag` og de tilhørende hendelsene og behovene, blant annet `InntekterForSykepengegrunnlag` fra `AvventerVilkårsprøving`, er fjernet fra Spleis.
- [ ] `sykepengegrunnlagsfakta` er fjernet fra godkjenningsbehovet, `avsluttet_med_vedtak` og `utkast_til_vedtak`.
- [ ] Spinnvill og Spregulering er skrudd av og arkivert.
- [ ] Skjønnsfastsettelsen og inntektsdelen av overstyringene er fjernet fra Spesialist. Tabellene er arkivert eller slettet etter avtale med personvernombudet.
- [ ] Togglene for de to tilstandene, skyggekjøringen og byttet er fjernet i Spleis, Spesialist, Speil og sp-sykepengegrunnlag.

## Merknader

- **Åpent spørsmål fra specen:** Hvem andre enn Spregulering og Spesialist leser `sykepengegrunnlagsfakta` i `utkast_til_vedtak`, `avsluttet_med_vedtak` og godkjenningsbehovet?
