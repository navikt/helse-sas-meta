# 03: Pensjonsgivende inntekt fra Sigrun

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 1

**Repo:** `sp-inntekt`

**Hva skal lages:** sp-inntekt henter pensjonsgivende inntekt fra Sigrun når behovet har en linje for selvstendig næringsdrivende, og velger de tre siste fastsatte årene etter regelen i ADR 0010. Inntektsavklaringen får årene med de fire inntektstypene og kilden `SIGRUN`.

**Blokkeres av:** [01: Skjelett for sp-inntekt med inntektsmelding fra Spedisjon](01-skjelett-sp-inntekt.md)

**Status:** klar

## Akseptansekriterier

- [ ] Sigrun kalles over HTTP med client credentials, `/api/v1/pensjonsgivendeinntektforfolketrygden` og `rettighetspakke=navSykepenger`, som i sykepengesoknad-backend.
- [ ] Tjenesten starter med året før skjæringstidspunktet, hopper over år i starten med `PGIF-006`, og bruker de tre nyeste årene etter det.
- [ ] `PGIF-008` lagres som et fastsatt år med 0 kr.
- [ ] Hvert år lagres med `næringsinntekt`, `lønnsinntekt`, `lønnsinntektBarePensjonsdel`, `næringsinntektFraFiskeFangstEllerFamiliebarnehage`, `erFastsatt` og kilden `SIGRUN`.
- [ ] Pensjonsgivende inntekt er med når tjenesten sammenligner beløp for å avgjøre om ID-en er den samme.
- [ ] Andre feil fra Sigrun gir ubesvart behov, og feilen logges.
- [ ] Rapid-tester med Sigrun fakt dekker tre fastsatte år, siste år ikke fastsatt, et år uten inntekt og en feil fra Sigrun.

## Merknader

- Regelen for årene gjelder inntil videre. Vi må avstemme den med team flex når vi implementerer, fordi sykepengesoknad-backend har egne regler for de samme årene.
- **Åpent spørsmål fra specen:** Er det riktig etter loven å regne `PGIF-008` som et fastsatt år med 0 kr? Det må avklares med fag før byttet (ticket [22](../fastsette-sykepengegrunnlag/22-bytte.md)). Tallene brukes ikke før da.
