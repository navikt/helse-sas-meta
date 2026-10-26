# 03: `AvventerRettighetskategori` i Spleis bak toggle

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Repo:** `spleis`

**Hva skal lages:** Når togglen er på, går perioder gjennom den nye tilstanden `AvventerRettighetskategori` på vei til vilkårsprøving. Spleis spør sp-rettighetskategori og lagrer rettighetskategori-ID-en den får tilbake. Spleis bruker ikke kategorien ennå. Når togglen er av, virker Spleis som før.

**Blokkeres av:** Ingen (kan starte med en gang). Behovkontrakten står i specen, og testene bruker testløsninger.

**Status:** klar

## Akseptansekriterier

- [ ] Med togglen på går perioden fra `AvventerBlokkerendePeriode` til `AvventerRettighetskategori` og videre til `AvventerVilkårsprøving` når løsningen kommer.
- [ ] Med togglen på går revurdering gjennom `AvventerRettighetskategori` før `AvventerVilkårsprøvingRevurdering`.
- [ ] Perioden går alltid gjennom tilstanden på vei til vilkårsprøving. Spleis sjekker ikke om skjæringstidspunktet allerede har rettighetskategori-ID.
- [ ] Behovet `Rettighetskategori` har person, skjæringstidspunkt og referanse-ID-ene til sendte søknader fra perioder som ikke er forkastet, overlapper skjæringstidspunktet og har samme skjæringstidspunkt, på tvers av yrkesaktiviteter.
- [ ] Spleis lagrer bare ID-en, ikke hovedkategorien (ADR 0001). ID-en lagres på behandlingen og flyttes inn i vilkårsgrunnlaget ved vilkårsprøving.
- [ ] Et ubesvart behov sendes på nytt ved påminnelse.
- [ ] Med togglen av går perioden rett til `AvventerVilkårsprøving`, som i dag.
- [ ] Tilstanden er med i `vedtaksperiode_endret`, og konsumentene som filtrerer på tilstandsnavn, tåler det nye navnet.
- [ ] Behovet er lagt inn i `BehovkontraktTest`.
- [ ] E2e-tester i sykepenger-model dekker: bare arbeidstaker, bare selvstendig næringsdrivende, forlengelse som ikke går gjennom tilstanden, revurdering som flytter skjæringstidspunktet, ubesvart behov med påminnelse og togglen av.
