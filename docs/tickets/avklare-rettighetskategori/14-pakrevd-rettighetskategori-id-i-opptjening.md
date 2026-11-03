# 14: Påkrevd rettighetskategori-ID i opptjeningsbehovet

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 5

**Repo:** `sp-vilkarsproving`

**Hva skal lages:** Når alle opptjeningsbehov fra Spleis har rettighetskategori-ID, gjør sp-vilkarsproving feltet påkrevd. Et behov uten ID blir ikke besvart, og perioden blir stående i `AvventerVilkårsprøving` eller `AvventerVilkårsprøvingRevurdering`. Derfor må vi vite at Spleis ikke lenger sender behov uten ID før vi gjør endringen.

Spleis sender ikke ID-en når skjæringstidspunktet mangler minimalt vilkårsgrunnlag. Det kan gjelde perioder som stod i `AvventerVilkårsprøving` eller `AvventerVilkårsprøvingRevurdering` før fase 1, og behov som ble sendt før Spleis begynte å sende feltet, for eksempel behov som venter på `ArbeidsforholdV2`.

**Blokkeres av:** [05: Rettighetskategori-ID i opptjeningsbehovet](05-rettighetskategori-id-til-opptjening.md)

**Status:** ferdig

## Akseptansekriterier

- [ ] Før deploy: Opptjeningsbehovene på rapiden viser at Spleis ikke har sendt noen behov uten `rettighetskategoriId` i prod den siste tiden, og vi har tall for det.
- [ ] Før deploy: Ingen perioder står i `AvventerVilkårsprøving` eller `AvventerVilkårsprøvingRevurdering` uten minimalt vilkårsgrunnlag.
- [x] `OpptjeningsvurderingRiver` krever `Opptjeningsvurdering.rettighetskategoriId`, og et behov uten feltet besvares ikke.
- [x] River-testene i sp-vilkarsproving dekker behov med og uten feltet.
