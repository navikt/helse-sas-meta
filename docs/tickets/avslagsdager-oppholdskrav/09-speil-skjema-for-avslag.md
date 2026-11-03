# 09: Skjema for avslag i dagoversikten

**Spec:** [Avslå dager etter oppholdskravet i sp-avslagsdager](../../specs/avslagsdager-oppholdskrav.md)

**Repo:** `speil`

**Hva skal lages:** I dagoversikten kan saksbehandler velge dager og åpne et skjema for avslag etter § 8-9. Skjemaet har spørsmålene, fritekstbegrunnelsen og journalpostene, og sender vurderingen til sp-avslagsdager med `behandlingId` til behandlingen som vises. Det samme skjemaet brukes til å gjøre om et avslag. Avslaget sendes i et eget kall og ikke sammen med overstyringen av tidslinjen til spesialist.

**Blokkeres av:** [02: Saksbehandler kan lagre en vurdering av oppholdskravet](02-lagre-vurdering-av-oppholdskravet.md), [08: Speil viser handlingen og `Oppholdskrav`](08-speil-viser-handlingen-og-oppholdskrav.md)

**Status:** klar

## Akseptansekriterier

- [ ] Saksbehandler kan bare velge dager som ellers kunne gitt utbetaling.
- [ ] Spørsmålene vises og skjules etter svarene, slik utledningen i specen krever. `unntakAndreLedd` vises bare når første ledd ikke er oppfylt, og `godkjentOppholdInntilFireUker` vises bare når `unntakAndreLedd` er `INGEN`.
- [ ] Skjemaet validerer det samme som sp-avslagsdager og viser feilene fra API-et.
- [ ] Kallet sendes til sp-avslagsdager med feltene i specen og `behandlingId` til behandlingen som vises.
- [ ] Etter lagring oppdateres saksbildet, slik at handlingen vises i listen over saksbehandlerhandlinger.
- [ ] Teksten på spørsmålene er avklart med designer, eller merket som foreløpig.
- [ ] Komponenttester for validering, spørsmål som vises og skjules, og kallet som sendes.
- [ ] Skjemaet følger kravene til universell utforming.
