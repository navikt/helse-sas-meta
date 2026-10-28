# 24: Speil sender skjønnsfastsettelse og overstyring til sp-sykepengegrunnlag

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `speil`

**Hva skal lages:** Med togglen fra [23](23-speil-viser-sykepengegrunnlaget.md) på sender Speil skjønnsfastsettelser og overstyringer av inntekt og arbeidsforhold til sp-sykepengegrunnlag. Refusjon går til Spesialist som før.

**Blokkeres av:** [15: Skjønnsfastsettelse og overstyring i sp-sykepengegrunnlag](15-skjonnsfastsettelse-og-overstyring.md), [16: Totrinnsvurdering for overstyringer fra sp-sykepengegrunnlag i Spesialist](16-spesialist-totrinnsvurdering.md), [23: Speil viser sykepengegrunnlaget fra sp-sykepengegrunnlag](23-speil-viser-sykepengegrunnlaget.md)

**Status:** klar

## Akseptansekriterier

- [ ] Skjønnsfastsettelsen sendes til `POST .../skjonnsfastsettelse` med feltene i specen.
- [ ] Inntekten sendes til `POST .../inntekt`, og deaktiverte og aktiverte arbeidsforhold til `POST .../arbeidsforhold`.
- [ ] Skjemaet for inntekt og refusjon sender inntekten til sp-sykepengegrunnlag og refusjonen til Spesialist.
- [ ] Svar med 409 gir en melding om at grunnlaget er endret, og Speil henter det på nytt.
- [ ] Etter en vellykket endring henter Speil den nye avgjørelsen når Spleis har revurdert.
- [ ] Med togglen av går alt til Spesialist som før.
- [ ] Testene i Speil dekker de tre skjemaene, delt inntekt og refusjon og 409.
