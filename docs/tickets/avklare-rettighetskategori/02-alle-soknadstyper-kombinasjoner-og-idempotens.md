# 02: Alle søknadstyper, kombinasjoner og idempotens i sp-rettighetskategori

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Repo:** `sp-rettighetskategori`

**Hva skal lages:** sp-rettighetskategori avgjør riktig hovedkategori for alle søknadstyper og alle kombinasjoner av yrkesaktiviteter i sykefraværstilfellet. Samme søknadssett gir samme ID, slik at Spleis kan spørre så ofte den vil. Midlertidige feil hos Spedisjon gir ubesvart behov, slik at Spleis prøver igjen ved påminnelse.

**Blokkeres av:** [01: Skjelett for sp-rettighetskategori som svarer på behov](01-skjelett-sp-rettighetskategori.md)

**Status:** klar

## Akseptansekriterier

- [ ] Hver søknad mappes til yrkesaktivitet på samme måte som Spleis gjør i dag, ut fra søknadstypen og `arbeidssituasjon`. Det gjelder også fisker, jordbruker, barnepasser og «annet».
- [ ] Alle hovedkategoriene fra `abstraksjoner-kap8.md` kan avgjøres: Arbeidstaker, Selvstendig næringsdrivende, Frilanser, de fire kombinasjonene etter §§ 8-40 til 8-43, og Ingen.
- [ ] Tjenesten ser ikke på `andreInntektskilder`.
- [ ] Samme søknadssett for samme person og skjæringstidspunkt gir gjeldende ID tilbake, uten ny rad.
- [ ] Et endret søknadssett gir en ny automatisk avgjørelse med ny ID.
- [ ] En avgjørelse med kilde `saksbehandler` blir ikke overskrevet av en automatisk avgjørelse for samme søknadssett.
- [ ] Når Spedisjon ikke svarer eller mangler en søknad, svarer ikke tjenesten på behovet, og feilen logges.
- [ ] Rapid-tester dekker mappingen av alle søknadstyper, alle kombinasjoner, samme og endret søknadssett, at en overstyring ikke overskrives, og at Spedisjon-feil gir ubesvart behov.
