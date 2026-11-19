# Spleis avgjør foreløpig hvilke arbeidsgivere som er med i sykepengegrunnlaget

**Forfattere:** Håvard Andersen (@nav-havard), Eirik Gallefoss (@ejgal), Øydis Kind Refsum (@oydisrefsum)

Spleis avgjør hvilke arbeidsgivere som er med i sykepengegrunnlaget, når den lager vilkårsgrunnlaget. Arbeidsgivere med søknad på skjæringstidspunktet er med. Ghost-arbeidsforhold er også med. Det er arbeidsforhold i Aa-registeret med inntekt i a-ordningen, men uten søknad. Arbeidsgivere uten arbeidsforhold med orgnummer i Aa-registeret er ikke med. Det gjelder for eksempel når arbeidsgiveren er en person. Arbeidsforholdene fra Aa-registeret blir ikke lagret noe sted.

I [#299](https://github.com/navikt/sas-issues/issues/299) flytter vi ikke dette valget til sp-sykepengegrunnlag. Spleis sender listen over arbeidsgivere i behovet `Sykepengegrunnlag`, og sp-sykepengegrunnlag bruker bare inntektene fra a-ordningen for orgnumrene i listen. Grunnen er å begrense omfanget av #299. Vi har ikke avgjort at valget hører hjemme i Spleis.

Det er tre grunner til å vente:

- Valget henger sammen med kildevalget: venting på inntektsmelding, gjenbruk og varslene RV_VV_2, RV_IV_7 og RV_IV_10. Kildevalget blir i Spleis i #299. Å flytte valget av arbeidsgivere uten kildevalget gir en halv løsning.
- sp-sykepengegrunnlag ville trengt en integrasjon mot Aa-registeret og reglene for ghost-arbeidsforhold i tillegg til det #299 allerede omfatter.
- Når Spleis lager listen, sammenligner skyggedriften bare fastsettelsen. Lager tjenesten listen selv, blir forskjellene vanskeligere å forklare.

Valgene våre er åpne. Listen er bare input i behovet, så å flytte valget senere endrer bare hvem som lager listen. Grunnlagene som allerede er lagret, påvirkes ikke. Gjør vi det, bør valget av arbeidsgivere og kildevalget flyttes sammen.

## Konsekvenser

- Spleis sender årsaken til at hver arbeidsgiver er med (`SØKNAD` eller `GHOST`), og sp-sykepengegrunnlag lagrer den ([#351](https://github.com/navikt/sas-issues/issues/351)). Da kan vi se i ettertid hvorfor en arbeidsgiver er med. Det gjør det også lettere å flytte valget senere. Det kan vi ikke se for arbeidsgivere som ikke er med, fordi ingen lagrer arbeidsforholdene fra Aa-registeret.
- Spleis trenger fortsatt Aa-registeret og inntektene fra a-ordningen for å finne ghost-arbeidsforhold. Behovet `InntekterForSykepengegrunnlag` kan derfor ikke fjernes så lenge Spleis gjør valget.
- Aktivering og deaktivering av arbeidsforhold flyttes likevel til sp-sykepengegrunnlag (ADR 0020). Det er saksbehandlerens endring av listen, ikke valget av den.
