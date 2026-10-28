# Alle vilkårsgrunnlag får rettighetskategori-ID, og sp-rettighetskategori kjører backfill av historikken

Alle vilkårsgrunnlag i Spleis får en rettighetskategori-ID, også de som fantes før sp-rettighetskategori. En JSON-migrering i Spleis setter en deterministisk ID ut fra `vilkårsgrunnlagId`, og Spleis lager samme ID for nye vilkårsgrunnlag uten svar fra sp-rettighetskategori. sp-rettighetskategori lager avgjørelsene bak ID-ene med backfill fra spleis-api. Det skjer ved `person_avstemming` og synkront når tjenesten får `RettighetskategoriResultat` for en ID den ikke kjenner. Vi følger mønsteret fra `opptjeningsvurderingId` og sp-vilkarsproving.

Grunnen er at valideringen flyttes fra søknadshåndteringen. Spleis hopper over RV_SØ_53 når søknaden kommer inn og stoler på at konsistenssjekken tar kombinasjonene senere. Mangler skjæringstidspunktet ID, kan ikke konsistenssjekken kjøre, og en kombinasjon slipper gjennom begge sjekkene. Med ID på alle vilkårsgrunnlag finnes det ingen vei utenom sjekken.

Vi ruller ut i faser. Først lager vi ID-er uten å bruke dem, så kjører vi backfill av historikken, og så flytter vi valideringen. Valideringen venter ikke på backfill for alle personer, fordi oppslaget kjører backfill for ID-en med en gang. Backfill fjernes når migreringsloggen viser at alle personer har fått backfill.

## Vurderte alternativer

- **Gamle perioder uten ID behandles som før.** Det var planen først (ADR 0001). Spleis måtte da beholde RV_SØ_53 ved søknadshåndteringen for skjæringstidspunkter uten ID, og hadde to veier for samme regel så lenge gamle perioder lever.
- **Tilfeldig ID for vilkårsgrunnlag uten svar**, slik opptjening gjør i dag. En deterministisk ID gir samme ID hvis migreringen kjører på nytt, og vi kan regne den ut ved feilsøking.
- **sp-rettighetskategori avgjør historiske ID-er ut fra søknadene i Spedisjon.** Det gir samme logikk som for nye avgjørelser, men Spleis lagrer ikke hvilke søknader som lå til grunn for gamle vilkårsgrunnlag. Yrkesaktivitetstypene til periodene er det Spleis selv brukte.

## Konsekvenser

- sp-rettighetskategori er avhengig av spleis-api fram til backfill er fjernet. Svarer ikke spleis-api, svarer ikke sp-rettighetskategori på oppslag for ukjente ID-er, og Spleis prøver igjen ved påminnelse.
- `person_avstemming` henter historikken hver gang, også for personer i migreringsloggen. Spleis kan lage nye deterministiske ID-er etter forrige avstemming.
