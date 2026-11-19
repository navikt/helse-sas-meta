---
status: akseptert
---

# Spleis lagrer ID-en til avslagsdageroppslaget på endringen, og sp-avslagsdager finner dagene til vurdering

**Forfattere:** Christian Skovborg Gule (@chsko), Solveig Grieg, Morten Jonassen Netland (@mnetland), Golshid Bahadorian (@golshidb93)

Personen kan oppgi opphold utenfor EØS og ferie i hver søknad. Søknadene er per yrkesaktivitet. Ferie hos a1 betyr ikke at dagen er uten betydning for a2 og a3. Derfor må saksbehandler vurdere oppholdskravet (§ 8-9) for en dag når personen har oppgitt opphold utenfor EØS i minst én søknad, og minst én yrkesaktivitet har dagen som sykedag, sykhelgedag, arbeidsgiverdag eller foreldet sykedag. Oppholdet er et faktum om personen, mens dagtypen er et faktum per yrkesaktivitet. Vurderingen og avslagsdagen gjelder personen. Opplysningene danner en matrise med én rad per dag og én kolonne per yrkesaktivitet. Den finnes bare som input til hvert oppslag. Ingen app lagrer den som egen modell.

sp-avslagsdager eier hele regelen. I behovet `Avslagsdager` sender Spleis beregningsperioden og én oppføring per yrkesaktivitet, med dagtypene fra sykdomstidslinja og de interne dokument-ID-ene til søknadene. Behovet har ingen behandlings-ID, fordi sp-avslagsdager ikke skal kjenne behandlingene i Spleis. sp-avslagsdager slår opp hver søknad i Spedisjon første gang dokument-ID-en dukker opp. Den lagrer de oppgitte oppholdene med søknaden som kilde. Kildefaktaene endres ikke, fordi en korrigert søknad har en ny dokument-ID.

Hvert svar lagres som et uforanderlig avslagsdageroppslag med egen ID. Løsningen gir ID-en til oppslaget, `avslagsdagerId`, avslagsdagene med vilkårskoder og en liste over varsler per yrkesaktivitet. Spleis lagrer bare `avslagsdagerId` på endringen i behandlingen, ikke vurderingene eller utfallet per dag. Varselet har en generisk tekst. Spleis legger det på vedtaksperioden for yrkesaktiviteten, og det er høyst én slik periode i en beregningsperiode.

Når en dag har en gjeldende vurdering, blir den ikke dag til vurdering igjen fordi en ny søknad oppgir opphold samme dag. Sene og korrigerte søknader trenger ingen egen melding fra sp-avslagsdager. Spleis beregner på nytt og sender et nytt behov. `avslagsdager_endret` brukes bare når saksbehandler vurderer dager.

Spleis sender `avslagsdagerId` i `godkjenningsbehov`. Spesialist slår opp oppslaget i sp-avslagsdager selv og stoler ikke på det Speil sender. Spesialist sperrer godkjenning så lenge oppslaget har dager til vurdering for personen. Spleis deaktiverer ikke varselet. Saksbehandler markerer det som vurdert i Spesialist, og Spesialist sperrer også avkryssingen etter samme regel.

Spleis får ikke dagtypen «Syk utenfor EØS» (ADR 0016). Den finnes bare hos yrkesaktiviteten som oppga oppholdet, og ferie vinner over den. Dermed forsvinner oppholdet hos a1, og a2 og a3 får det aldri. Dagtypen migreres bort fra sykdomstidslinjene.

## Vurderte alternativer

- **Endringen lagrer vurderingene og utfallet per dag (ADR 0005).** Da trengs `vurderteDager` også for dager der vilkåret er oppfylt. Det holder heller ikke for sporingen, fordi kildene og dagene til vurdering ikke kommer med.
- **Dagtypen «Syk utenfor EØS» viser hvilke dager som må vurderes (ADR 0016).** Dagtypen gjelder én yrkesaktivitet, så den finner ikke dagene hos de andre yrkesaktivitetene. Spleis må også eie en regel som hører til sp-avslagsdager.
- **Spleis sender dagene som mangler vurdering i `godkjenningsbehov`.** Listen bygger på dagtypen og har samme hull. Med `avslagsdagerId` finnes regelen bare i sp-avslagsdager.
- **sp-avslagsdager lytter selv på sendte søknader.** Da må sp-avslagsdager sende `EndretGrunnlagForBeregning` når opphold kommer sent. Spleis vet allerede når en søknad endrer beregningen.
- **Spleis sender sykdomstidslinja når den endres.** Da får Spleis en ny utgående kontrakt, og sp-avslagsdager må holde en kopi av tidslinjene i takt med Spleis.
- **Bare dagtypene fra søknaden avgjør om dagen må vurderes.** Sykdomstidslinja i Spleis har allerede ferie og andre dagtyper per yrkesaktivitet, også etter overstyringer.
- **Løsningen gir datoene for dagene til vurdering.** Da må Spleis bruke regelen eller datoene til noe den ikke eier. Et varsel per yrkesaktivitet er nok.
- **Varselet kan krysses av som andre varsler.** Da kan vedtaket fattes uten at oppholdskravet er vurdert.

## Konsekvenser

- Dette erstatter delen av ADR 0005 om at endringen lagrer vurderingene og at løsningen gir `vurderteDager`. Det erstatter hele ADR 0016.
- ID-en heter `avslagsdagerId` fordi den er svaret på behovet `Avslagsdager`. Den peker på hele oppslaget, også når personen ikke har avslagsdager.
- `dagerUtenVurderingAvOppholdskrav` i `godkjenningsbehov` erstattes av `avslagsdagerId`.
- Spesialist og Speil henter dagene til vurdering, kildene og vurderingene fra sp-avslagsdager med `avslagsdagerId` på endringen. Dagoversikten slutter å virke for vurderte dager når sp-avslagsdager er nede.
- Spleis kan ikke se hvilke vurderinger en behandling bygde på, uten å spørre sp-avslagsdager.
- sp-avslagsdager kan ikke svare på behovet når Spedisjon er nede. Behovet blir liggende til neste påminnelse.
- Varselet `RV_SØ_8` («Utenlandsopphold oppgitt i perioden i søknaden») erstattes av varselet fra løsningen.
