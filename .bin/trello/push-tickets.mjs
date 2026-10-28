#!/usr/bin/env node
// Oppretter Trello-kort fra docs/tickets/<feature>/trello.json. Bruker bare Node sitt standardbibliotek.
//
//   node .bin/trello/push-tickets.mjs            oppretter valgte kort
//   node .bin/trello/push-tickets.mjs --dry-run  viser hva som ville blitt opprettet, uten å skrive til Trello
//
// Leser miljøvariabler fra .env ved siden av skriptet (ignoreres av git):
//   TRELLO_API_KEY   API-nøkkel fra https://trello.com/power-ups/admin
//   TRELLO_TOKEN     token generert fra samme side
//   TRELLO_BOARD_ID  ID-en i URL-en til tavla: https://trello.com/b/<TRELLO_BOARD_ID>/...
//   TRELLO_LIST_NAME valgfri; lista kortene legges i, standard «Klar til spill». Finnes den ikke, velger du liste.

import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const ticketsDir = path.resolve(scriptDir, '../../docs/tickets')
const dryRun = process.argv.includes('--dry-run')

loadEnv(path.join(scriptDir, '.env'))

const env = {
  apiKey: process.env.TRELLO_API_KEY,
  token: process.env.TRELLO_TOKEN,
  boardId: process.env.TRELLO_BOARD_ID,
  listName: process.env.TRELLO_LIST_NAME || 'Klar til spill',
}

const input = lineReader()

try {
  await main()
} catch (e) {
  console.error(`\nFeil: ${e.message}`)
  process.exitCode = 1
} finally {
  input.close()
}

async function main() {
  const harTilgang = env.apiKey && env.token && env.boardId
  if (!harTilgang && !dryRun) {
    throw new Error(
      `Mangler TRELLO_API_KEY, TRELLO_TOKEN eller TRELLO_BOARD_ID i ${rel(path.join(scriptDir, '.env'))}. Se toppen av skriptet.`,
    )
  }

  const features = finnFeatures()
  if (features.length === 0) throw new Error(`Fant ingen trello.json under ${rel(ticketsDir)}`)

  console.log(`Features med trello.json i ${rel(ticketsDir)}:`)
  features.forEach((f, i) => console.log(`  ${i + 1}) ${f.feature} (${f.cards.length} kort)`))
  const feature = features[(await velgEn('Velg feature', features.length)) - 1]

  const trello = harTilgang ? trelloKlient(env) : null
  const kortPåTavla = trello ? await trello.get(`/boards/${env.boardId}/cards`, { fields: 'name,shortUrl' }) : []
  const finnesPåTavla = new Map(kortPåTavla.map((k) => [k.name, k]))

  console.log(`\nKort i ${feature.feature} (label «${feature.label.name}»):`)
  feature.cards.forEach((kort, i) => {
    const merknader = [kort.status, finnesPåTavla.has(kort.name) ? 'finnes på tavla' : null].filter(Boolean)
    console.log(`  ${String(i + 1).padStart(2)}) ${kort.name}${merknader.length ? `  [${merknader.join(', ')}]` : ''}`)
  })

  const standardvalg = feature.cards
    .map((k, i) => (finnesPåTavla.has(k.name) || k.status === 'ferdig' ? null : i + 1))
    .filter(Boolean)
  const valgte = await velgFlere(
    'Velg kort (f.eks. 1,3,5-7, «alle», eller Enter for alle som ikke finnes på tavla og ikke er ferdige)',
    feature.cards.length,
    standardvalg,
  )
  const kortSomSkalLages = valgte.map((n) => feature.cards[n - 1])
  if (kortSomSkalLages.length === 0) {
    console.log('Ingen kort valgt.')
    return
  }

  const duplikater = kortSomSkalLages.filter((k) => finnesPåTavla.has(k.name))
  if (duplikater.length > 0) {
    console.log(`\nAdvarsel: ${duplikater.length} av de valgte kortene finnes allerede på tavla og blir opprettet på nytt.`)
  }

  const listId = trello ? await finnListe(trello) : null
  console.log(`\nOppretter ${kortSomSkalLages.length} kort med label «${feature.label.name}»:`)
  kortSomSkalLages.forEach((k) => console.log(`  - ${k.name}`))

  if (dryRun) {
    console.log('\n--dry-run: ingenting er skrevet til Trello.')
    return
  }
  if (!(await bekreft('Fortsette?'))) {
    console.log('Avbrutt.')
    return
  }

  const label = await sørgForLabel(trello, feature.label)
  const lenkerTilKort = new Map(
    feature.cards.filter((k) => finnesPåTavla.has(k.name)).map((k) => [k.id, finnesPåTavla.get(k.name).shortUrl]),
  )
  const opprettede = []

  for (const kort of kortSomSkalLages) {
    const opprettet = await trello.post('/cards', {
      idList: listId,
      name: kort.name,
      desc: kort.desc,
      idLabels: [label.id],
      pos: 'bottom',
    })
    for (const sjekkliste of kort.checklists ?? []) {
      const liste = await trello.post(`/cards/${opprettet.id}/checklists`, { name: sjekkliste.name })
      for (const punkt of sjekkliste.checkItems ?? []) {
        await trello.post(`/checklists/${liste.id}/checkItems`, { name: punkt.name, checked: punkt.checked ?? false, pos: 'bottom' })
      }
    }
    lenkerTilKort.set(kort.id, opprettet.shortUrl)
    opprettede.push({ kort, opprettet })
    console.log(`  ✓ ${kort.name}  ${opprettet.shortUrl}`)
  }

  for (const { kort, opprettet } of opprettede) {
    const blokkere = (kort.blokkeresAv ?? []).map((id) => lenkerTilKort.get(id)).filter(Boolean)
    if (blokkere.length === 0) continue
    const desc = `${kort.desc}\n\n**Blokkeres av i Trello:**\n${blokkere.map((url) => `- ${url}`).join('\n')}`
    await trello.put(`/cards/${opprettet.id}`, { desc })
  }

  console.log(`\nFerdig. Opprettet ${opprettede.length} kort.`)
}

function finnFeatures() {
  if (!fs.existsSync(ticketsDir)) return []
  return fs
    .readdirSync(ticketsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(ticketsDir, d.name, 'trello.json')))
    .map((d) => {
      const fil = path.join(ticketsDir, d.name, 'trello.json')
      const innhold = JSON.parse(fs.readFileSync(fil, 'utf8'))
      if (!innhold.label?.name || !Array.isArray(innhold.cards)) {
        throw new Error(`${rel(fil)} mangler label.name eller cards`)
      }
      return { feature: innhold.feature ?? d.name, ...innhold }
    })
    .sort((a, b) => a.feature.localeCompare(b.feature))
}

async function sørgForLabel(trello, { name, color }) {
  const labels = await trello.get(`/boards/${env.boardId}/labels`, { fields: 'name,color', limit: 1000 })
  const eksisterende = labels.find((l) => l.name === name)
  if (eksisterende) return eksisterende
  console.log(`  + label «${name}» (${color ?? 'uten farge'})`)
  return trello.post(`/boards/${env.boardId}/labels`, { name, color: color ?? null })
}

async function finnListe(trello) {
  const lister = await trello.get(`/boards/${env.boardId}/lists`, { fields: 'name', filter: 'open' })
  if (lister.length === 0) throw new Error('Tavla har ingen åpne lister')
  const navn = env.listName.trim().toLowerCase()
  const treff = lister.find((l) => l.name.trim().toLowerCase() === navn)
  if (treff) {
    console.log(`\nListe: «${treff.name}»`)
    return treff.id
  }
  console.log(`\nFant ikke lista «${env.listName}». Lister på tavla:`)
  lister.forEach((l, i) => console.log(`  ${i + 1}) ${l.name}`))
  return lister[(await velgEn('Velg liste', lister.length)) - 1].id
}

function trelloKlient({ apiKey, token }) {
  const base = 'https://api.trello.com/1'
  const headers = {
    Accept: 'application/json',
    Authorization: `OAuth oauth_consumer_key="${apiKey}", oauth_token="${token}"`,
  }

  async function kall(metode, sti, { query, body } = {}) {
    const url = new URL(base + sti)
    for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, v)
    for (let forsøk = 1; ; forsøk++) {
      const res = await fetch(url, {
        method: metode,
        headers: body ? { ...headers, 'Content-Type': 'application/json' } : headers,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (res.status === 429 && forsøk < 5) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** forsøk))
        continue
      }
      const tekst = await res.text()
      if (!res.ok) throw new Error(`${metode} ${sti} ga ${res.status}: ${tekst}`)
      return tekst ? JSON.parse(tekst) : null
    }
  }

  return {
    get: (sti, query) => kall('GET', sti, { query }),
    post: (sti, body) => kall('POST', sti, { body }),
    put: (sti, body) => kall('PUT', sti, { body }),
  }
}

async function velgEn(spørsmål, antall) {
  if (antall === 1) {
    console.log(`${spørsmål}: 1 (eneste valg)`)
    return 1
  }
  for (;;) {
    const n = Number((await input.ask(`${spørsmål} [1-${antall}]: `)).trim())
    if (Number.isInteger(n) && n >= 1 && n <= antall) return n
    console.log('Ugyldig valg.')
  }
}

async function velgFlere(spørsmål, antall, standard) {
  for (;;) {
    const svar = (await input.ask(`${spørsmål}: `)).trim().toLowerCase()
    if (svar === '') return standard
    if (svar === 'alle') return Array.from({ length: antall }, (_, i) => i + 1)
    const valgte = new Set()
    let gyldig = true
    for (const del of svar.split(',').map((s) => s.trim()).filter(Boolean)) {
      const m = del.match(/^(\d+)(?:-(\d+))?$/)
      const fra = Number(m?.[1])
      const til = Number(m?.[2] ?? m?.[1])
      if (!m || fra < 1 || til > antall || fra > til) {
        gyldig = false
        break
      }
      for (let n = fra; n <= til; n++) valgte.add(n)
    }
    if (gyldig) return [...valgte].sort((a, b) => a - b)
    console.log('Ugyldig valg.')
  }
}

async function bekreft(spørsmål) {
  return /^(j|ja|y|yes)$/i.test((await input.ask(`${spørsmål} [j/N]: `)).trim())
}

// readline/promises mister linjer når stdin er en pipe, så linjene køes her.
function lineReader() {
  const rl = readline.createInterface({ input: process.stdin, terminal: process.stdin.isTTY })
  const linjer = []
  const ventende = []
  let lukket = false
  rl.on('line', (l) => (ventende.length ? ventende.shift()(l) : linjer.push(l)))
  rl.on('close', () => {
    lukket = true
    while (ventende.length) ventende.shift()(null)
  })
  return {
    ask(spørsmål) {
      process.stdout.write(spørsmål)
      if (linjer.length) return Promise.resolve(linjer.shift())
      if (lukket) return Promise.reject(new Error('stdin ble lukket'))
      return new Promise((resolve, reject) =>
        ventende.push((l) => (l === null ? reject(new Error('stdin ble lukket')) : resolve(l))),
      )
    },
    close: () => rl.close(),
  }
}

function loadEnv(fil) {
  if (!fs.existsSync(fil)) return
  for (const linje of fs.readFileSync(fil, 'utf8').split(/\r?\n/)) {
    const m = linje.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!m) continue
    let verdi = m[2]
    if (/^(['"]).*\1$/.test(verdi)) verdi = verdi.slice(1, -1)
    else verdi = verdi.replace(/\s+#.*$/, '')
    process.env[m[1]] ??= verdi
  }
}

function rel(p) {
  return path.relative(process.cwd(), p) || '.'
}
