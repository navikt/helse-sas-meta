# Spleis lagrer bare ID-en til sykepengegrunnlaget

Den nye tjenesten sp-sykepengegrunnlag avgjør sykepengegrunnlaget i den nye tilstanden `AvventerSykepengegrunnlag`. Spleis lagrer bare ID-en til avgjørelsen og slår opp beløpene med ID-en når den trenger dem, slik den gjør for rettighetskategorien (ADR 0001). Det gjelder også beløpene Spleis beregner utbetalingen med.

Grunnen er at sykepengegrunnlaget skal ha én eier. Avviksvurdering, skjønnsfastsettelse og overstyringer av inntekt og arbeidsforhold flyttes til sp-sykepengegrunnlag, og hver endring gir en ny avgjørelse med ny ID. Har Spleis ingen egen kopi av beløpene, finnes det ingen kopi som kan bli utdatert eller endret utenom tjenesten.

## Vurderte alternativer

- **Spleis lagrer ID-en og en kopi av beløpene.** Spleis slipper da å slå opp før hver beregning, og spleis-api og Speil kan lese beløpene fra Spleis som i dag. Men beløpene finnes da to steder, og Spleis kan endre dem uten å gå gjennom tjenesten.

## Konsekvenser

- Spleis kan ikke beregne uten svar fra sp-sykepengegrunnlag. Svarer ikke tjenesten, blir perioden stående, og en påminnelse sender oppslaget på nytt.
- Alle som leser sykepengegrunnlaget fra Spleis i dag, for eksempel spleis-api for Speil og `vedtak_fattet`, må få beløpene fra sp-sykepengegrunnlag.
