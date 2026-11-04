# Avviksvurderingen gjøres når sykepengegrunnlaget fastsettes, ikke ved godkjenning

I dag sender Spesialist behovet `Avviksvurdering` når godkjenningsbehovet kommer inn, og bare for arbeidstakere. Spinnvill svarer, og Spesialist lager varselet RV_IV_2 og kobler avviksvurderingen til Spleis' `vilkårsgrunnlagId`. Spleis vet ikke om avviksvurderingen. Vi flytter avviksvurderingen til sp-sykepengegrunnlag. Den gjøres når grunnlaget fastsettes i `AvventerSykepengegrunnlag`, med samme regel som i dag (mer enn 25 % avvik mot sammenligningsgrunnlaget for de tolv siste månedene). Sammenligningsgrunnlaget kommer fra inntektsavklaringen i sp-inntekt. Avviksvurderingen er en del av sykepengegrunnlaget og har samme ID.

Grunnen er at avviksvurderingen og skjønnsfastsettelsen hører til sykepengegrunnlaget (§ 8-30). Når de ligger i samme tjeneste, kobles de til en stabil ID i stedet for `vilkårsgrunnlagId`, som endres hver gang Spleis kopierer vilkårsgrunnlaget. Vi slipper også en ekstra runde mellom Spesialist og Spinnvill ved hver godkjenning.

## Vurderte alternativer

- **Beholde avviksvurderingen i Spinnvill og la sp-sykepengegrunnlag spørre Spinnvill.** Da må vi ikke flytte koden, men da finnes sykepengegrunnlaget fortsatt to steder, og skjønnsfastsettelsen må hente avviket fra en annen tjeneste.
- **Fortsatt vurdere ved godkjenning.** Da kan beregningen gå ferdig før vi vet at grunnlaget må skjønnsfastsettes, slik det gjør i dag. Men koblingen til `vilkårsgrunnlagId` ville fortsatt vært skjør.

## Konsekvenser

- Svaret på `SykepengegrunnlagResultat` sier om avviket er for stort og grunnlaget ikke er skjønnsfastsatt. Spleis lager varselet RV_IV_2 ut fra svaret, og Spesialist slutter å lage det.
- Spesialist slutter å sende `Avviksvurdering`, og Spinnvill fjernes når backfill er ferdig.
- Spesialist henter begrunnelsen for skjønnsfastsettelsen og resten av sykepengegrunnlaget fra sp-sykepengegrunnlag med sykepengegrunnlag-ID-en fra `avsluttet_med_vedtak` når vedtaket bygges.
- For arbeidstakere skal utfallet være det samme som i dag. Bare tidspunktet og eieren endres.
- Avviksvurdering og varig endring for selvstendig næringsdrivende er ikke med nå, men kan legges til i samme tjeneste.
