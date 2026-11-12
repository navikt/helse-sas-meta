# Syk utenfor EØS er en egen dagtype i sykdomstidslinjen

**Forfattere:** Elias Andreassen Thøgersen (@elitho), Golshid Bahadorian (@golshidb93)

Dager der brukeren har oppgitt utenlandsopphold utenfor EØS i søknaden, blir dagtypen «Syk utenfor EØS» i sykdomstidslinjen i Spleis, ikke ukjente dager. Spleis beregner dagen som en sykedag. Dagtypen forteller bare Speil og spesialist at saksbehandler må vurdere oppholdskravet i § 8-9. Vurderingen eies av sp-avslagsdager, og saksbehandler sender den dit direkte fra Speil, ikke som en overstyring av tidslinjen.

Løsningen på behovet `Avslagsdager` gir Spleis alle dagene som er vurdert, med utfall per dag og vilkår (`vurderteDager`), ikke bare de avslåtte. Spleis vet dermed hvilke dager med «Syk utenfor EØS» som mangler vurdering, og sender dem i `godkjenningsbehov`. Spesialist nekter godkjenning så lenge listen ikke er tom. Varselet RV_SØ_8 beholdes inntil videre, slik at saksbehandler fortsatt ser utenlandsoppholdet i varsellisten. Om det skal avvikles, vurderer vi senere.

## Vurderte alternativer

- **Vanlig sykedag pluss en egen opplysning på behandlingen om dagene i utlandet.** Da må vi selv lage reglene for hva som skjer med markeringen når dagen overstyres eller søknaden korrigeres. Med en dagtype gjør turneringen og overstyringen dette: ferie vinner over «Syk utenfor EØS», og en dag som overstyres til en annen dagtype, trenger ikke lenger vurdering.
- **sp-avslagsdager leser søknaden og eier listen over dager som må vurderes.** Appen vet ikke når Spleis overstyrer en dag til ferie, så de to kan bli uenige.
- **Speil henter de vurderte dagene fra sp-avslagsdager.** Da kan dagoversikten og beregningen bygge på hvert sitt svar, og Spleis kan ikke si hvilke dager som mangler vurdering.
- **Varselet RV_SØ_8 som eneste tvang.** Saksbehandler kan vurdere varselet uten å vurdere dagene, og et varsel fra Spleis blir stående i spesialist etter at dagene er vurdert.

## Konsekvenser

- Hver `when (dag)` i Spleis, serialiseringen, API-et i Spleis, `ApiSykdomsdagtype` i spesialist og mappingen i Speil får den nye dagtypen.
- `tbd.utbetaling` får ingen ny type. Dagen blir en `NavDag`, eller en `AvvistDag` med begrunnelsen `Oppholdskrav`.
- Ukjente dager fra eldre søknader blir ikke migrert.
- En dag har i dag høyst én avslagsgrunn. Regelen håndheves av `Avslagsdager.forPeriode` i Spleis og av sperren i Speil, ikke av datamodellen. Flere løpende vilkår fra sp-avslagsdager samme dag virker allerede: `Avslagsdag` har en liste med begrunnelser, og `vurderteDager` har én rad per vilkår. Skal en dag kunne avslås av flere kilder, for eksempel både `AvslåttMeldingTilNavDag` og oppholdskravet, må `Avslagsdag` få begrunnelser per kilde.
