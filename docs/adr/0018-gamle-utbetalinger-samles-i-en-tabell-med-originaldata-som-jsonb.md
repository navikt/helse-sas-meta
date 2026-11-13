# Gamle utbetalinger samles i én tabell med originaldataene som jsonb

**Forfattere:** Martin Remøy Solheim (@MartinMekk)

Spøkelse har gamle utbetalinger i tre formater fordelt på sju tabeller (`vedtak`/`oppdrag`/`utbetaling`/`hendelse`/`vedtak_utbetalingsref`, `old_vedtak`/`old_utbetaling` og `gamle_utbetalinger`). De slås sammen med `UNION ALL` ved hvert oppslag. Ingen kode skriver til tabellene lenger, så testene trenger egne skrivehjelpere for å fylle dem.

Vi har bestemt at alle data fra de gamle tabellene videreføres i en ny tabell, `gammel_utbetaling`, med én rad per utbetalingslinje. Det oppslagene trenger, får egne kolonner: fødselsnummer, organisasjonsnummer, opprettet, fom, tom, grad, fagsystem-ID og kilde. Alle andre felter fra kilderadene ligger i kolonnen `opprinnelig` som `jsonb`. Rader som ikke er koblet til noen utbetalingslinje, for eksempel hendelser og utbetalingsreferanser uten vedtak, eller vedtak uten linjer, legges i en egen tabell, `gammel_utbetaling_ukoblet`, med kildetabellen og raden som `jsonb`. Da kan `gammel_utbetaling` kreve fødselsnummer, fom og tom, og oppslaget trenger ikke filtrere bort noe. Kildeverdiene og grad med desimaler bevares, så svarene fra API-et blir uendret. Annulleringer leses fortsatt fra `alle_annulleringer`.

Vi gjør det i fire steg. Først kopierer en migrering dataene. Deretter kontrollerer vi med spørringer mot prod at den nye tabellen gir de samme radene som `UNION ALL`-spørringen, og at hver rad i hver av de sju gamle tabellene finnes igjen som `jsonb` i en av de to nye tabellene. Så bytter vi koden over til den nye tabellen. Til slutt droppes de gamle tabellene. Det haster ikke, og det gjøres først når kontrollen viser at ingenting mangler.

## Vurderte alternativer

- **Gjenbruke `gamle_utbetalinger` med en ny kolonne for kilde.** Dagens spørring leser hele tabellen uten å filtrere på kilde. Da ville radene blitt dobbelt mellom migreringen og kodebyttet.
- **En bred tabell med en nullbar kolonne for hvert felt i alle tre formatene.** Det gir rundt 25 kolonner, og de fleste er tomme for to av tre kilder. Ingen kode leser feltene.
- **Bare ta med feltene oppslagene bruker.** Vi vil ikke miste data vi kan få bruk for senere.
- **Legge ukoblede rader i `gammel_utbetaling` med en egen kilde og nullbare kolonner.** Da må oppslaget filtrere dem bort, og tabellen kan ikke kreve fødselsnummer, fom og tom.
- **Flytte dem inn i `tbdUtbetaling_*`.** De gamle radene mangler `korrelasjonsId` og rå melding, som de tabellene krever.
