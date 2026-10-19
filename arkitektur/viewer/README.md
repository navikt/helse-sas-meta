# Arkitektur-viewer

Lokalt, interaktivt dev-verktøy for å utforske flyt-JSON (`*.flow.json`)
generert av arkitekturagenten (`arkitektur/agent/AGENT_INSTRUKSJON.md`).

Dette er **kun et utviklerverktøy** — ikke en del av noen av
produksjonsapplikasjonene i dette repoet.

## Arkitektur

```
brukerforespørsel
  → arkitekturagent analyserer relevant kode
  → forståelig tekstforklaring
  → semantisk FlowDocument JSON (arkitektur/flows/*.flow.json)
  → denne vieweren (React Flow + ELK) rendrer den lokalt
```

- **Schema/validering**: `src/schema/flow.ts` (Zod). All agent-JSON valideres
  strengt før den vises.
- **Layout**: `src/layout/elkLayout.ts` bruker [`elkjs`](https://github.com/kieler/elkjs)
  til å beregne node-posisjoner lokalt. Agenten oppgir **aldri** x/y selv.
- **Rendering**: [`@xyflow/react`](https://reactflow.dev/) tegner grafen med
  egendefinerte node-kort (`src/components/FlowNodeCard.tsx`) og et
  strukturert forklaringspanel (`src/components/ExplanationPanel.tsx`).

## Kjør lokalt

```bash
cd arkitektur/viewer
pnpm install
pnpm dev
```

Åpne <http://127.0.0.1:5173>. Vieweren viser en nedtrekksliste over alle
`*.flow.json`-filer i `arkitektur/flows/`, og lar deg klikke på noder/kanter
for å se `file`/`line`/`symbol`-evidens.

## Hvordan finne/lage flyten du vil se

1. **Finnes flyten allerede?** Velg den fra nedtrekkslisten øverst i
   vieweren — den lister automatisk alle `*.flow.json`-filer som ligger i
   `arkitektur/flows/`.
2. **Finnes den ikke ennå?** Vieweren er en ren, lokal nettleser-visning og
   har ingen LLM-tilgang — den kan derfor ikke generere nye flyter selv
   (dette ville krevd eksterne nettverkskall og bryter prinsippet om at
   vieweren er 100 % lokal). Åpne i stedet en **ny Copilot-sesjon** (f.eks.
   i IntelliJ eller i terminalen) og be Copilot analysere relevant kode og
   generere en ny flyt ved hjelp av instruksen i
   `arkitektur/agent/AGENT_INSTRUKSJON.md`. Be agenten lagre resultatet som
   en ny fil i `arkitektur/flows/`.
3. **Se den nye flyten**: så snart filen er lagret i `arkitektur/flows/`
   dukker den automatisk opp i nedtrekkslisten neste gang du laster siden
   på nytt — du trenger ikke restarte dev-serveren (`pnpm dev`).

## Interaktiv visning

- **Dra noder**: bokser kan flyttes fritt for å justere layoutet manuelt.
- **Flytt kant-endepunkter ("magnetiske" tilkoblingspunkter)**: hver boks
  har fire tilkoblingspunkter (topp/høyre/bunn/venstre). ELK velger
  automatisk det mest naturlige punktet basert på hvor motstående node
  ligger, men du kan selv dra et pil-endepunkt til et annet punkt på
  boksen ved å gripe tak i pilen nær boks-kanten.
- **Valg-scoped forklaringspanel**: klikk på en node eller kant for å se en
  forklaring som kun gjelder akkurat den. Når en node er valgt vises også
  dens inngående/utgående kanter, med lenker for å hoppe videre til
  forklaringen for hver av dem. Uten noe valgt vises en overordnet
  oversikt over hele flyten.
- **Tegn forslag**: slå på «Tegn forslag» for å diskutere mulige endringer.
  «＋ Ny boks» legger til en boks, og du drar fra en lilla prikk på en boks
  til en annen for å tegne en kobling. Dobbeltklikk på et forslag for å
  endre tekst eller type, og merk det og trykk Delete for å slette.
  Forslag vises lilla, stiplet og skravert med et «FORSLAG»-merke, fordi de
  ikke er en del av systemet i dag. De lagres per flytfil i nettleserens
  localStorage og skrives aldri til `*.flow.json`.
- Endringer gjort i vieweren (posisjon, tilkoblinger) er kun lokale for
  denne visningen og skrives ikke tilbake til `*.flow.json`-filen.

## Personvern / nettverk

- Alt kjører 100 % lokalt via Vites innebygde dev-server.
- Det eneste "backend"-elementet er et lite middleware i `vite.config.ts`
  som lister og leser `*.flow.json`-filer fra disk (`arkitektur/flows/`) —
  ingen filer sendes noe sted.
- Ingen CDN-er, ingen telemetri/analytics, ingen eksterne API-kall.
- `react`, `react-dom`, `@xyflow/react`, `elkjs` og `zod` er kun lokale
  npm-avhengigheter — layout (ELK) og rendering (React Flow) skjer i
  nettleseren din, ikke via noen ekstern tjeneste.

## Sikkerhet på agent-generert tekst

`label`, `summary`, `symbol` og `note` i FlowDocument er alltid
LLM-generert/untrusted tekst. Vieweren rendrer disse feltene kun som vanlig,
escaped React-tekst. `dangerouslySetInnerHTML` brukes ikke noe sted i dette
verktøyet. Det samme gjelder tekst brukeren skriver inn i forslag.

## Scripts

| Kommando           | Beskrivelse                                  |
|---------------------|-----------------------------------------------|
| `pnpm dev`          | Start lokal dev-server med hot reload         |
| `pnpm build`        | Typecheck + produksjonsbygg av vieweren       |
| `pnpm preview`      | Forhåndsvis produksjonsbygget lokalt          |
| `pnpm test`         | Kjør schema-tester (Vitest)                   |
| `pnpm typecheck`    | Kjør TypeScript uten å emitte filer           |
