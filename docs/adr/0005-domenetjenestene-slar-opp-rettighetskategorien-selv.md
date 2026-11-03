---
status: til vurdering
---

# Domenetjenestene får rettighetskategori-ID-en og slår opp rettighetskategorien selv

Spleis sender bare rettighetskategori-ID-en i behovene til domenetjenestene, for eksempel opptjeningsbehovet til sp-vilkarsproving. Domenetjenesten slår opp rettighetskategorien i sp-rettighetskategori og gjør den om til sin egen, smale type med bare det tjenesten trenger. Den lagrer ID-en ved sin egen vurdering, slik at vi kan se hvilken avgjørelse om rettighetskategori vurderingen bygger på.

Grunnen er endringsdyktighet. ID-en er en fast kontrakt mellom Spleis og domenetjenestene. Når sp-rettighetskategori får nye hovedkategorier eller tilleggskategorier, endrer vi bare sp-rettighetskategori og de domenetjenestene som bruker det nye. Spleis, person-JSON-en og behovskontrakten blir som før. En ny domenetjeneste som trenger rettighetskategorien, krever heller ingen endring i Spleis.

## Vurderte alternativer

- **Spleis lagrer svaret fra sp-rettighetskategori og sender verdien videre.** Spleis får ID-en og kategorien i samme løsning, så kopien blir ikke utdatert: en overstyring gir alltid ny ID. Oppslaget i `AvventerHistorikk` forsvinner, og domenetjenestene blir ikke avhengige av sp-rettighetskategori når de kjører. Men hver endring i kategorimodellen må da inn i person-JSON-en i Spleis, som er det dyreste stedet å endre og hindrer rollback (se ADR 0003). Spleis blir et mellomledd, så et nytt felt eller en ny domenetjeneste gir endringer i tre repoer. Spleis trenger også kategorien for eksisterende vilkårsgrunnlag, og må da enten ha samme logikk som backfill eller hente verdiene tilbake.
- **Spleis slår opp rettighetskategorien i `AvventerVilkårsprøving` og sender verdien videre.** Domenetjenestene blir enkle, men Spleis får en ekstra runde på rapiden og blir likevel mellomledd for hvert nytt felt. ADR 0001 forkastet allerede dette oppslaget.
- **Spleis avgjør rettighetskategorien selv.** Det sprer regelen tilbake til Spleis, og er det problemet specen for sp-rettighetskategori løser.

## Konsekvenser

- Hver domenetjeneste er avhengig av sp-rettighetskategori når den behandler et behov. Oppslaget gjelder en ID som aldri endrer innhold, så svaret kan caches. Svarer ikke sp-rettighetskategori, svarer ikke domenetjenesten på behovet, og påminnelsen fra Spleis sender det på nytt.
- Oppslag på ukjente ID-er kjører backfill i sp-rettighetskategori, ikke i domenetjenestene.
- Domenetjenestene leser bare feltene de bruker, og ignorerer resten. Nye tilleggskategorier gjør dermed ingenting med dem.
- `Opptjeningsvurdering.arbeidssituasjon` fjernes fra opptjeningsbehovet når sp-vilkarsproving slår opp rettighetskategorien selv. Ellers har vi to kilder for det samme.
- Avgjør vi senere at Spleis skal lagre kategorien, for eksempel fordi beregningen trenger den mange steder, er det en egen beslutning. Kontrakten til domenetjenestene er fortsatt bare ID-en.
