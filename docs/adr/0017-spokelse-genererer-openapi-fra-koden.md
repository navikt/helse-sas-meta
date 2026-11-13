# Spøkelse genererer OpenAPI-specen fra koden

**Forfattere:** Martin Remøy Solheim (@MartinMekk)

Spøkelse har seks endepunkter og fem konsumentteam, men bare `/gjenstaende-sykedager` er dokumentert, i en OpenAPI-spec skrevet for hånd. Ingenting sørger for at en håndskrevet spec stemmer med koden. Vi har bestemt at spøkelse genererer specen fra Ktor-rutene og egne DTO-er med smiley4 `ktor-openapi`, slik spesialist, sporhund og sp-appene gjør. Den håndskrevne fila slettes.

- Hvert endepunkt får typede request- og responsklasser som er skilt fra domenet. Kontrakten endres ikke når domenet refaktoreres.
- En snapshot av den genererte specen ligger i `src/test/resources/openapi/spokelse.json`. En test feiler når specen avviker fra snapshoten, slik at hver kontraktendring blir en synlig diff i PR-en. Snapshoten er bare et endringsvarsel for oss. Konsumentene henter specen fra `/openapi.json` eller ser den i `/swagger` på den interne ingressen.

## Vurderte alternativer

- **Spec-first med kodegenerering (openapi-generator).** Ingen av repoene våre gjør det. Det krever ny verktøykjede, og den genererte koden passer dårlig med Jackson 3-oppsettet vårt.
- **Fortsatt håndskrevet spec, slik spapi har.** Den blir et dødt dokument som ingen test holder i sync med koden.
- **Snapshoten som kilde for konsumentenes kodegenerering.** Da ville det vært to offisielle kilder. Konsumentene genererer lokalt mot det kjørende endepunktet og sjekker inn koden, så de trenger ikke tilgang fra CI.
