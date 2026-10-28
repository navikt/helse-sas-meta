# 11: Endepunkt for sykepengegrunnlag i spleis-api

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 2

**Repo:** `spleis`

**Hva skal lages:** sp-sykepengegrunnlag kan hente alle sykepengegrunnlag-ID-ene til en person med beløpene fra Spleis med `POST /api/sykepengegrunnlag`.

**Blokkeres av:** [06: Sykepengegrunnlag-ID på alle vilkårsgrunnlag i Spleis](06-sykepengegrunnlag-id-pa-alle-vilkarsgrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Endepunktet tar inn `fødselsnummer` og krever maskin-til-maskin-token, og bare sp-sykepengegrunnlag har tilgang.
- [ ] Svaret har én rad per sykepengegrunnlag-ID i de fulle vilkårsgrunnlagene i historikken, med alle feltene i specen.
- [ ] `opprettet` er tidspunktet for det første historikkinnslaget med ID-en, som i `OpptjeningApi`.
- [ ] `kilde` er `SPLEIS` eller `INFOTRYGD`, og `fastsatt` er `ETTER_HOVEDREGEL`, `ETTER_SKJØNN` eller `I_INFOTRYGD`.
- [ ] Selvstendig næringsdrivende har `pensjonsgivendeInntekter` med `år` og `beløp`.
- [ ] Det minimale vilkårsgrunnlaget hoppes over.
- [ ] REST-tester dekker endepunktet som for `POST /api/rettighetskategorier`.
