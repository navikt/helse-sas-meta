# Kodestandarder

Code-review-skillen leser denne filen når den gjennomgår endringer i app-repoene i sas-meta. Reglene er skjønnsvurderinger. Det som kan sjekkes automatisk, hører hjemme i et verktøy.

## Databaseskjema

- **Hver indeks har en spørring.** En ny indeks skal brukes av en spørring i samme endring. Indekser for spørringer som kommer i en senere ticket, legges til i den ticketen.
- **Én identitet per rad.** Velg enten en UUID eller et løpenummer som primærnøkkel, ikke begge. Bruk UUID når ID-en sendes ut av appen.
- **Skill mellom når noe skjedde og når det ble lagret.** Et fagtidspunkt (for eksempel `vurderingstidspunkt`) settes av applikasjonen og kan komme fra et annet system. Lagringstidspunktet heter `opprettet`, settes med `DEFAULT now()` og leses eller skrives ikke av applikasjonen.
- **Hver kolonne har en grunn i specen.** Når skjemaet bygger på en tabell i en annen app, skal hver kolonne ha et behov i specen eller ticketen. Kolonner som bare finnes fordi forbildet har dem, fjernes.
