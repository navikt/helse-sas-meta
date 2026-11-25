---
status: akseptert
---

# Spleis lagrer ID-en til grunnlaget for løpende vilkår på endringen, og sp-avslagsdager finner dagene til vurdering

**Forfattere:** Christian Skovborg Gule (@chsko), Solveig Grieg (@solveiggrieg), Morten Jonassen Netland (@mnetland), Golshid Bahadorian (@golshidb93), Elias Andreassen Thøgersen (@elitho), Jørgen Engesvold (@engesvold)

Personen kan oppgi opphold utenfor EØS og ferie i hver søknad. Søknadene er per yrkesaktivitet. Ferie hos a1 betyr ikke at dagen er uten betydning for a2 og a3. Derfor må saksbehandler vurdere oppholdskravet (§ 8-9) for en dag når personen har oppgitt opphold utenfor EØS i minst én søknad, og minst én yrkesaktivitet har dagen som `SYKEDAG`, `ARBEIDSGIVERDAG` eller `FORELDET_SYKEDAG` i sykdomstidslinja. Helgedager følger samme regel. Oppholdet er et faktum om personen, mens dagtypen er et faktum per yrkesaktivitet. Vurderingen og avslagsdagen gjelder personen. Opplysningene danner en matrise med én rad per dag og én kolonne per yrkesaktivitet. Den finnes bare som input til hvert grunnlag. Ingen app lagrer den som egen modell.

sp-avslagsdager eier hele regelen. I behovet `Avslagsdager` sender Spleis beregningsperioden, skjæringstidspunktet og én oppføring per yrkesaktivitet, med dagtypene fra sykdomstidslinja og de interne dokument-ID-ene til søknadene. Behovet har ingen behandlings-ID, fordi sp-avslagsdager ikke skal kjenne behandlingene i Spleis. sp-avslagsdager slår opp hver søknad i Spedisjon første gang dokument-ID-en dukker opp. Den lagrer de oppgitte oppholdene med søknaden som kilde, og ID-en til søknaden den korrigerer. Kildefaktaene endres ikke, fordi en korrigert søknad har en ny dokument-ID. Den nyeste søknaden gjelder: oppholdene i en søknad som er korrigert, regnes ikke med.

## Grunnlaget for løpende vilkår

Svaret på behovet er et grunnlag for løpende vilkår. Det har dagene med oppgitt utlandsopphold, dagene til vurdering, de gjeldende vurderingene, avslagsdagene, avbruddene etter § 8-15 og varslene, sammen med behovet det bygde på. Et grunnlag endres aldri og lagres som én rad med `jsonb` (CODING_STANDARDS).

Grunnlaget dekker alle løpende vilkår som sp-avslagsdager eier. I dag er det bare oppholdskravet (§ 8-9). Et nytt vilkår får sin egen del i grunnlaget, med egne kilder, egne regler for dager til vurdering og egne varsler, men grunnlaget har fortsatt én ID. Avslagsdagene for alle vilkårene står i samme liste i løsningen, med vilkårskodene per dag. En dag kan dermed avslås etter flere vilkår.

Samme behov og samme gjeldende vurderinger gir samme grunnlag. sp-avslagsdager sammenligner med det siste grunnlaget for personen og beregningsperioden. Er behovet og de gjeldende vurderingene like, svarer den med ID-en til det grunnlaget. Ellers lager den et nytt. En ny vurdering gir altså et nytt grunnlag, og et gammelt grunnlag viser fortsatt dagene som var til vurdering da.

Løsningen gir ID-en til grunnlaget, `grunnlagForLøpendeVilkårId`, avslagsdagene med vilkårskoder og en liste over varsler per yrkesaktivitet. Spleis lagrer bare `grunnlagForLøpendeVilkårId` på endringen i behandlingen, ikke vurderingene eller utfallet per dag. Varselet har en generisk tekst. Spleis legger det på vedtaksperioden for yrkesaktiviteten, og det er høyst én slik periode i en beregningsperiode.

Når en dag har en gjeldende vurdering, blir den ikke dag til vurdering igjen fordi en ny søknad oppgir opphold samme dag. Sene og korrigerte søknader trenger ingen egen melding fra sp-avslagsdager. Spleis beregner på nytt og sender et nytt behov. `avslagsdager_endret` brukes bare når saksbehandler vurderer dager.

Spleis sender `grunnlagForLøpendeVilkårId` i `godkjenningsbehov`. Spesialist slår opp grunnlaget i sp-avslagsdager selv og stoler ikke på det Speil sender. Spesialist sperrer godkjenning så lenge grunnlaget har dager til vurdering for personen. Spleis deaktiverer ikke varselet. Saksbehandler markerer det som vurdert i Spesialist, og Spesialist sperrer også avkryssingen etter samme regel. Speil viser bare dagene i grunnlaget som ligger i vedtaksperioden. Spleis godkjenner perioder i rekkefølge, så den tidligste perioden med dager til vurdering sperres først.

Spleis får ikke dagtypen «Syk utenfor EØS» (ADR 0016). Den finnes bare hos yrkesaktiviteten som oppga oppholdet, og ferie vinner over den. Dermed forsvinner oppholdet hos a1, og a2 og a3 får det aldri. Dagtypen migreres bort fra sykdomstidslinjene.

## Avbrutt arbeidsforhold etter § 8-15

Et ugyldig opphold utenfor EØS i mer enn 14 dager gjør at arbeidsforholdet anses som midlertidig avbrutt etter § 8-15. sp-avslagsdager teller sammenhengende avslagsdager etter § 8-9 fra skjæringstidspunktet til slutten av beregningsperioden. Helgedager teller. Et hull, for eksempel ferie, bryter rekken. For en arbeidstaker gjelder avbruddet fra den 15. dagen i rekken. For en selvstendig næringsdrivende gjelder det fra den første avslagsdagen. Den regelen står i rundskrivet, ikke i loven, og koden viser til rundskrivet.

Grunnlaget har avbruddene per yrkesaktivitet, og løsningen gir varselet RV_SØ_57 for yrkesaktiviteten. Etter avbruddet skal det vurderes om personen har rett til sykepenger som inaktiv (§ 8-47). Det støtter vi ikke ennå, så saken må kastes ut. Spesialist sperrer godkjenning og avkryssing av varselet, og Speil sier at saken må kastes ut. Avbruddet endrer ikke beregningen i Spleis.

Det er ikke avklart om andre grunner til midlertidig avbrudd, for eksempel permisjon, skal telles sammen med avslagsdagene. Øystein Espedal og Jørgen Engesvold avklarer det. Hvilken regel som gjelder for en kombinert arbeidstaker og selvstendig næringsdrivende, og om avbruddet gir nytt skjæringstidspunkt, tar vi når vi støtter kombinerte og inaktive.

Presiseringene om grunnlaget, korrigerte søknader og § 8-15 ble gjort 24. november 2026.

## Vurderte alternativer

- **Endringen lagrer vurderingene og utfallet per dag (ADR 0005).** Da trengs `vurderteDager` også for dager der vilkåret er oppfylt. Det holder heller ikke for sporingen, fordi kildene og dagene til vurdering ikke kommer med.
- **Dagtypen «Syk utenfor EØS» viser hvilke dager som må vurderes (ADR 0016).** Dagtypen gjelder én yrkesaktivitet, så den finner ikke dagene hos de andre yrkesaktivitetene. Spleis må også eie en regel som hører til sp-avslagsdager.
- **Spleis sender dagene som mangler vurdering i `godkjenningsbehov`.** Listen bygger på dagtypen og har samme hull. Med `grunnlagForLøpendeVilkårId` finnes regelen bare i sp-avslagsdager.
- **sp-avslagsdager lytter selv på sendte søknader.** Da må sp-avslagsdager sende `EndretGrunnlagForBeregning` når opphold kommer sent. Spleis vet allerede når en søknad endrer beregningen.
- **Spleis sender sykdomstidslinja når den endres.** Da får Spleis en ny utgående kontrakt, og sp-avslagsdager må holde en kopi av tidslinjene i takt med Spleis.
- **Bare dagtypene fra søknaden avgjør om dagen må vurderes.** Sykdomstidslinja i Spleis har allerede ferie og andre dagtyper per yrkesaktivitet, også etter overstyringer.
- **Løsningen gir datoene for dagene til vurdering.** Da må Spleis bruke regelen eller datoene til noe den ikke eier. Et varsel per yrkesaktivitet er nok.
- **Varselet kan krysses av som andre varsler.** Da kan vedtaket fattes uten at oppholdskravet er vurdert.
- **En hendelseslogg per person, som i sp-andre-ytelser (ADR 0007).** Der er hendelsene saksbehandlers egne registreringer. Her er behovet et spørsmål fra Spleis, ikke en endring. For å få hendelser måtte sp-avslagsdager sammenligne hvert behov med forrige tilstand og holde en kopi av tidslinjene. Behovene for flere beregninger kommer i vilkårlig rekkefølge, så en versjon kunne blandet tidslinjer fra to beregninger. Svaret måtte også lagres for at en regelendring ikke skal endre gamle versjoner. Vurderingene og kildene får uansett bare nye rader.
- **Et nytt grunnlag for hvert behov.** Da får hver beregning en ny ID selv om ingenting er endret, og det ser ut som behandlingene bygger på forskjellige grunnlag.
- **Ingen ID når beregningsperioden ikke har noe å vurdere.** Spesialist slipper da å kalle sp-avslagsdager, men vi får to kodestier og mister sporet av at det ikke var noe å vurdere.
- **Ett grunnlag per løpende vilkår.** Navnet blir mer presist, men løsningen får én ID per vilkår. Spleis må lagre ID-ene per vilkår på endringen, og Spesialist må slå opp hvert grunnlag for seg. Kontrakten mot Spleis, Spesialist og Speil brytes da for hvert nytt vilkår.

## Konsekvenser

- Dette erstatter delen av ADR 0005 om at endringen lagrer vurderingene og at løsningen gir `vurderteDager`. Det erstatter hele ADR 0016.
- `grunnlagForLøpendeVilkårId` peker på hele grunnlaget, også når personen ikke har avslagsdager. Behovet heter fortsatt `Avslagsdager`.
- `dagerUtenVurderingAvOppholdskrav` i `godkjenningsbehov` erstattes av `grunnlagForLøpendeVilkårId`.
- Spesialist og Speil henter dagene med oppgitt utlandsopphold, dagene til vurdering, kildene, vurderingene og avbruddene fra sp-avslagsdager med `grunnlagForLøpendeVilkårId` på endringen. Dagoversikten slutter å virke for vurderte dager når sp-avslagsdager er nede.
- Spleis kan ikke se hvilke vurderinger en behandling bygde på, uten å spørre sp-avslagsdager.
- sp-avslagsdager kan ikke svare på behovet når Spedisjon er nede. Behovet blir liggende til neste påminnelse.
- Varselet `RV_SØ_8` («Utenlandsopphold oppgitt i perioden i søknaden») erstattes av varselet fra løsningen.
- `RV_SØ_52` forkaster fortsatt selvstendige søknader med opphold i utlandet. Flex sender periodene med utlandsopphold også for selvstendige, så varselet fjernes i navikt/sas-issues#420.
- Tekstene til RV_SØ_8, RV_SØ_57 og sperren i Speil skrives og godkjennes av Morten Jonassen Netland, Øystein Espedal og Jørgen Engesvold.
