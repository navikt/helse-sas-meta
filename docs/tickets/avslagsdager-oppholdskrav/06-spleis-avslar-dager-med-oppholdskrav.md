# 06: Spleis avslår dager med `Oppholdskrav` fra behovet

**Spec:** [Avslå dager etter oppholdskravet i sp-avslagsdager](../../specs/avslagsdager-oppholdskrav.md)

**Repo:** `spleis`

**Hva skal lages:** Spleis har en kobling mellom dag og vurderings-ID på personen, og kopierer den til behandlinger som overlapper når de opprettes eller revurderes. Når togglen er på og en periode har dager med vurderings-ID, sender Spleis behovet `Avslagsdager` med de vurderings-ID-ene i samme runde som ytelsene. Løsningen fyller avslagstidslinjen på behandlingen med kilden `sp-avslagsdager`, og dagene blir avviste dager med den nye begrunnelsen `Oppholdskrav`. En overstyring av tidslinjen fjerner ikke avslagsdager fra sp-avslagsdager. Ticket 07 fyller koblingen fra meldingen. Her fylles den direkte i testene.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] `Begrunnelse.Oppholdskrav` finnes med hjemmel § 8-9, og den mappes ut overalt der `AvslåttMeldingTilNavDag` mappes ut. Det gjelder dto, hendelser, behandlings-API, Spanner og `BegrunnelseDTO` i API-et for Speil.
- [ ] Personen har en kobling mellom dag og vurderings-ID som lagres og leses med serde. En ny vurderings-ID for en dag erstatter den forrige.
- [ ] En behandling får vurderings-ID-ene for dagene i perioden sin når den opprettes eller revurderes, og lagrer dem.
- [ ] Behovet `Avslagsdager` med `Avslagsdager.vurderingIder` sendes i ytelsesrunden når togglen er på og perioden har minst én dag med vurderings-ID. Ellers sendes det ikke.
- [ ] Avslagstidslinjen fylles bare med dager i perioden der vurderings-ID-en i løsningen er den som gjelder for dagen. Avslagsdager med kilden `sp-avslagsdager` i perioden erstattes, og avslagsdager med andre kilder blir liggende.
- [ ] Alle vilkårskodene for § 8-9 gir `Begrunnelse.Oppholdskrav`. En ukjent vilkårskode gir en feil, og løsningen blir ikke brukt.
- [ ] `OverstyrTidslinje` fjerner bare avslagsdager med kilden `Saksbehandler`.
- [ ] Det nye behovet er med i `BehovkontraktTest`.
- [ ] E2e-tester med testløsninger dekker avslag før beregning, omgjøring med ny vurderings-ID, to arbeidsgivere som begge får dagen avslått, en ny periode som får vurderings-ID-en fra personen, en overstyring av tidslinjen som ikke fjerner avslaget, og toggle av og på. Tester å bygge videre på: `AvslåttMeldingTilNavdagTest`.
