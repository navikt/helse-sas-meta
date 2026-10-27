# 04: `AvventerRettighetskategori` i Spleis bak toggle

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 1

**Repo:** `spleis`

**Hva skal lages:** Når togglen for fase 1 er på, går perioder gjennom den nye tilstanden `AvventerRettighetskategori` på vei til vilkårsprøving. Spleis spør sp-rettighetskategori og lagrer rettighetskategori-ID-en den får tilbake, i stedet for den deterministiske ID-en. Spleis bruker ikke kategorien ennå, og RV_SØ_53 kjører når søknaden kommer inn, som i dag. Når togglen er av, virker Spleis som før, og vilkårsgrunnlaget får deterministisk ID.

**Blokkeres av:** [03: Rettighetskategori-ID på alle vilkårsgrunnlag i Spleis](03-rettighetskategori-id-pa-alle-vilkarsgrunnlag.md). Behovkontrakten står i specen, og testene bruker testløsninger.

**Status:** klar

## Akseptansekriterier

- [ ] Med togglen på går perioden fra `AvventerBlokkerendePeriode` til `AvventerRettighetskategori` og videre til `AvventerVilkårsprøving` når løsningen kommer.
- [ ] Med togglen på går revurdering gjennom `AvventerRettighetskategori` før `AvventerVilkårsprøvingRevurdering`.
- [ ] Perioden går alltid gjennom tilstanden på vei til vilkårsprøving. Spleis sjekker ikke om skjæringstidspunktet allerede har rettighetskategori-ID.
- [ ] Behovet `Rettighetskategori` har person, skjæringstidspunkt og referanse-ID-ene til sendte søknader fra perioder som ikke er forkastet, overlapper skjæringstidspunktet og har samme skjæringstidspunkt, på tvers av yrkesaktiviteter.
- [ ] Spleis lagrer bare ID-en, ikke hovedkategorien (ADR 0001). ID-en lagres på behandlingen og flyttes inn i vilkårsgrunnlaget ved vilkårsprøving.
- [ ] Et ubesvart behov sendes på nytt ved påminnelse.
- [ ] Med togglen av går perioden rett til `AvventerVilkårsprøving`, som i dag, og vilkårsgrunnlaget får deterministisk ID.
- [ ] RV_SØ_53 ved søknadshåndtering er uendret uansett toggle.
- [ ] Tilstanden er med i `vedtaksperiode_endret`, og konsumentene som filtrerer på tilstandsnavn, tåler det nye navnet.
- [ ] Behovet er lagt inn i `BehovkontraktTest`.
- [ ] E2e-tester i sykepenger-model dekker: bare arbeidstaker, bare selvstendig næringsdrivende, forlengelse som ikke går gjennom tilstanden, revurdering som flytter skjæringstidspunktet, ubesvart behov med påminnelse og togglen av.
