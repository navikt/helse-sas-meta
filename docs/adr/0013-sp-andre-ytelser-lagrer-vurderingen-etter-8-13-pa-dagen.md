# sp-andre-ytelser lagrer vurderingen etter § 8-13 andre ledd på dagen og sender ikke subsumsjoner

Når saksbehandler fordeler en dag med graderte andre ytelser, er det en subsumsjon etter folketrygdloven § 8-13 andre ledd: sykepengenes størrelse beregnes ut fra inntektstapet. sp-andre-ytelser lagrer vurderingen på hver dag i hendelsen (`data_json`), ved siden av fordelingen og begrunnelsen. Vurderingen har vilkårskoden `GRADERT_ANNEN_YTELSE_REDUSERER_UTMÅLING`, en lovreferanse og tidspunktet. Saksbehandler og tidspunktet for endringen står allerede på hendelsen. sp-andre-ytelser sender ingen `subsumsjon`-meldinger.

Vurderingen har ikke utfallet Oppfylt eller IkkeOppfylt. § 8-13 andre ledd er en beregningsregel og ikke et vilkår, og resultatet er fordelingen: sykdomsgrad, arbeidsgrad og trekk.

En dag får en vurdering når den har minst én gradert annen ytelse, også når trekket er 0 fordi ytelsene bare er tatt fra arbeidet. Når saksbehandler fjerner ytelsene fra en dag, er det endrede fakta og ingen vurdering. Den andre ytelsen ble for eksempel avslått. Dagen får ingen vurdering, men vurderingen fra før ligger fortsatt i hendelsesloggen.

`Lovreferanse` er en kopi av typen i sp-vilkarsproving og sp-avslagsdager, med samme felter (`lov`, `paragraf`, `avsnitt`, `setning`, `bokstav`, `iKraftFra`) og samme JSON. For § 8-13 andre ledd er `iKraftFra` 1997-05-01. Leddet er ikke endret siden folketrygdloven trådte i kraft da (§ 26-1).

## Vurderte alternativer

- **Subsumsjonsloggen i Spleis.** Den er utdatert. Spleis kjenner bare trekket, så den kan ikke subsumere en fordeling der ytelsene er tatt fra arbeidet.
- **`subsumsjon`-meldinger på rapiden, som i sp-forsikring.** En fordeling hører ikke til én behandling, og behovet `GraderteAndreYtelserForBeregning` har ingen behandling-ID. Meldingen ville derfor ikke kunne spores til en vedtaksperiode. Koblingen til vedtaket går i stedet via versjonen som Spleis lagrer på endringen (ADR 0007).
- **En egen tabell med vurderings-ID, som i sp-vilkarsproving.** Den trengs bare hvis noen skal peke på én enkelt vurdering. Spleis peker på versjonen, og hendelsen samler allerede fordelingen, begrunnelsen og saksbehandleren.
- **Et felles bibliotek for `Lovreferanse`.** Det kan bli en egen sak. Med samme form og JSON blir det enkelt å bytte senere.

## Konsekvenser

- spre-subsumsjon og arkivet for subsumsjoner får ikke vurderingene etter § 8-13 andre ledd. Hvis noen trenger dem senere, må meldingene lages fra hendelsene.
- Vurderingen lagres, men vises ikke i API-et eller historikkinnslaget ennå.
- Datasettet i prod er tomt, så alle dager med ytelser har en vurdering fra start. Vi trenger ingen tilbakefylling.
