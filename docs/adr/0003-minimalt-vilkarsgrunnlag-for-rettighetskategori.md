# Spleis lagrer rettighetskategori-ID-en i et minimalt vilkårsgrunnlag

Når Spleis får rettighetskategori-ID-en i `AvventerRettighetskategori`, lagrer den ID-en i et nytt, minimalt vilkårsgrunnlag for skjæringstidspunktet. Det fulle vilkårsgrunnlaget som lages i `AvventerVilkårsprøving`, erstatter det minimale og tar med seg ID-en. Rettighetskategorien gjelder hele sykefraværstilfellet, og vilkårsgrunnlaget er stedet Spleis lagrer det som gjelder per skjæringstidspunkt.

`VilkårsgrunnlagElement` er allerede en sealed class, og JSON-en har allerede feltet `type` (`Vilkårsprøving` eller `Infotrygd`). Den nye typen får verdien `Rettighetskategori`. Eksisterende data trenger derfor ingen migrering.

## Vurderte alternativer

- **Lagre ID-en på behandlingen og flytte den inn i vilkårsgrunnlaget ved vilkårsprøving.** Da får hver periode i sykefraværstilfellet sin egen kopi av ID-en, og Spleis må velge hvilken som gjelder når vilkårsgrunnlaget lages. Behandlingen får også et felt som bare er i bruk i en kort periode.
- **Et nytt diskriminatorfelt med JSON-migrering.** Det eksisterende `type`-feltet gjør samme jobb, så en migrering gir bare risiko.

## Konsekvenser

- Bare fulle vilkårsgrunnlag skal være synlige for koden som spør etter vilkårsgrunnlaget i dag. Ellers ville et minimalt vilkårsgrunnlag se ut som en ferdig vilkårsprøving. Bare `AvventerVilkårsprøving` og `AvventerVilkårsprøvingRevurdering` henter det minimale.
- Konsumentene av vilkårsgrunnlagshistorikken, som Speil-byggerne og spleis-api, må hoppe over den nye typen.
- Eldre versjoner av Spleis kan ikke lese den nye typen. Når den første personen har fått et minimalt vilkårsgrunnlag, kan vi ikke rulle Spleis tilbake til en versjon uten støtten.
