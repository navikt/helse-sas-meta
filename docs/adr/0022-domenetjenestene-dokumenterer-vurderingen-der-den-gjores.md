---
status: akseptert
---

# Domenetjenestene dokumenterer vurderingen der den gjøres, ikke i subsumsjonsloggen

**Forfattere:** Håvard Andersen (@nav-havard), Eirik Gallefoss (@ejgal), Øydis Kind Refsum (@oydisrefsum)

Når en domenetjeneste eier en juridisk vurdering, lagrer den vurderingen med lovreferanse, fakta og utfall i sin egen database. Den lagrede vurderingen er dokumentasjonen. Tjenesten sender ikke i tillegg en `subsumsjon`-melding til subsumsjonsloggen på Kafka. Vi fjerner ikke kravet om å dokumentere subsumsjoner. Vi fjerner bare den ekstra meldingen for vurderinger som allerede er dokumentert der de blir gjort.

Beslutningen ble tatt 15. oktober 2026 og gjelder team SAS, med følger for HAG og Flex. Den generaliserer [ADR 0006](0006-sp-avslagsdager-sender-ikke-subsumsjoner.md), som bare gjaldt sp-avslagsdager.

## Kontekst

I dag sender applikasjonene subsumsjoner til et felles Kafka-topic. spre-subsumsjon videresender dem til etterlevelse, og sparkiv-subsumsjon arkiverer dem. Subsumsjonsloggen kom i 2021, fordi vi måtte lese kildekoden for å forstå hvilke regler en sak var vurdert etter. Den skal dekke to behov:

1. Forklare hvilke vurderinger et vedtak bygger på, også de manuelle.
2. Finne berørte saker når en regel er brukt feil eller lovforståelsen endres.

Loggen ble lagt på i etterkant. Vurderingene lå allerede spredt i Spleis og andre systemer da kravene til etterlevelse økte, og loggen var en måte å hente dem ut på uten å bygge om alt. Begynte vi på nytt, ville vi lagret lovreferansen sammen med vurderingen der den blir gjort.

En domenetjeneste må uansett samle fakta og gjøre vurderingen. sp-vilkarsproving lagrer allerede hver vilkårsvurdering med lovreferanse, kilde, utfall, tidspunkt og om vurderingen er automatisk eller manuell. sp-forsikring lagrer vurderingen og sender i tillegg subsumsjoner. Da finnes den samme beslutningen to steder.

## Begrunnelse

- **Loggen har bare et utsnitt.** En subsumsjonsmelding har bare de faktaene produsenten valgte å ta med. Domenetjenesten har hele forløpet: kilder, faktaavklaringer, delvurderinger og utfall.
- **To kopier kan bli ulike.** Med både lagret vurdering og loggmelding må vi vedlikeholde en mapping til et felles format og passe på at innholdet stemmer. Én kilde fjerner det problemet.
- **Speil kan vise paragrafen rett fra vurderingen.** Lovreferansen ligger sammen med fakta og utfall. I dag må Speil selv finne ut hva Spleis vurderte etter. I inngangsvilkårene gjør Speil for eksempel avslagskoder om til paragrafer og velger mellom § 8-3 og § 8-51 ut fra alderen. Med sp-vilkarsproving får Speil lovreferansen i svaret.

## Overgang

Når vi flytter en vurdering til en egen domenetjeneste, slutter vi å sende den subsumsjonen til subsumsjonsloggen. Det forutsetter at domenetjenesten lagrer vurderingen med lovreferanse, fakta og utfall, og at den aldri overskriver tidligere vurderinger. Overgangen skjer for én subsumsjon om gangen. Resten av Spleis sender subsumsjoner som før.

## Konsekvenser

- Saksbehandling, innsyn og etterkontroll bruker den samme lagrede vurderingen, og Speil viser lovreferansen som faktisk ble brukt.
- Søk på tvers av tjenestene blir ikke enklere av seg selv, men det kan løses hvis vi trenger det.
- Subsumsjonene som allerede er sendt, blir liggende. Å legge ned hele topicet er et stort arbeid som vi ikke prioriterer på kort eller mellomlang sikt.
- sp-sykepengegrunnlag lagrer §§ 8-10, 8-28 og 8-35 med lovreferanse sammen med grunnlaget. Når Spleis slutter å fastsette sykepengegrunnlaget, sender Spleis ikke lenger disse subsumsjonene, og spre-subsumsjon og sparkiv-subsumsjon får dem ikke.
