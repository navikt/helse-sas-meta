# 02: Saksbehandler kan lagre en vurdering av oppholdskravet

**Spec:** [Avslå dager etter oppholdskravet i sp-avslagsdager](../../specs/avslagsdager-oppholdskrav.md)

**Repo:** `sp-avslagsdager`

**Hva skal lages:** Saksbehandler sender en vurdering av oppholdskravet i § 8-9 til `POST /api/personer/{personId}/vurderinger/oppholdskrav`. Vurderingen inneholder dagene, svarene, fritekstbegrunnelsen, journalpostene og `behandlingId`. Appen sjekker tilgangen, validerer svarene, utleder vilkårsvurderingene og det samlede utfallet, og lagrer vurderingen som en ny rad. Svaret er vurderings-ID-en. opprydding-dev sletter vurderingene til en person.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] Vilkårskodene for § 8-9 og lovreferansene deres er som i specen, i samme form som `Vilkårskode` og `Lovreferanse` i sp-vilkarsproving.
- [ ] Utledningen fra svar til vilkårsvurderinger følger specen. Første ledd oppfylt stopper vurderingen, et unntak i andre ledd stopper vurderingen, og `INGEN` gir vurdering av tredje ledd.
- [ ] Request og response har feltene og typene i specen.
- [ ] Feilene `DagerMangler`, `UnntakAndreLeddMangler`, `GodkjentOppholdInntilFireUkerMangler` og `FritekstbegrunnelseMangler` gir 400. `PersonIkkeFunnet` gir 404, og `ManglerTilgang` gir 403.
- [ ] Endepunktet krever `Tilgang.Skriv` og bruker `KallKontekst.medPerson`. Kall uten token gir 401.
- [ ] Vurderingen lagres med ID, fødselsnummer, `behandlingId`, dager, svar, vilkårsvurderinger, samlet utfall, fritekstbegrunnelse, journalpost-ID-er, saksbehandlerens ident og vurderingstidspunkt. Ingen rader endres.
- [ ] En omgjøring lagres som en ny vurdering med utfallet `Oppfylt`, og den forrige vurderingen er uendret.
- [ ] opprydding-dev sletter vurderingene og dagene til personen før `person_slettet` publiseres.
- [ ] Endepunktet er med i OpenAPI-spesifikasjonen.
- [ ] Enhetstester av utledningen, med `ManuellOpptjeningsvurderingTest` som forbilde.
- [ ] REST-tester for gyldig avslag, omgjøring, hver valideringsfeil, 401, 403 uten skrivetilgang og 403 når tilgangsmaskinen avslår.
