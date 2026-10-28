#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const BIN_MAPPE = dirname(fileURLToPath(import.meta.url))
const META_FIL = join(BIN_MAPPE, '..', '.meta')
const FORVENTET_FIL = join(BIN_MAPPE, 'github-innstillinger.json')
const API = 'https://api.github.com'
const SAMTIDIGE_REPOER = 6

// I disse seksjonene er også ekstra nøkler et avvik, f.eks. et team som har fått admin uten å stå i fasiten.
const EKSAKTE_SEKSJONER = new Set(['teams', 'direkteSamarbeidspartnere', 'rulesets'])

const bruk = `Sjekker og retter GitHub-innstillingene til repoene i .meta mot fasiten i .bin/github-innstillinger.json.
Tokenet hentes med 'gh auth token', så du må være logget inn med 'gh auth login'.

Bruk:
  node .bin/github-innstillinger.mjs <kommando> [argumenter]

Kommandoer:
  vis <repo>                   Skriver innstillingene til <repo> til skjermen.
  hent <repo>                  Henter innstillingene til <repo> og lagrer dem som fasit i .bin/github-innstillinger.json.
  sjekk [repo ...]             Sammenligner repoene med fasiten og viser avvik per repo og per innstilling.
  patch [repo ...] [--force]   Viser avvikene og hva som vil bli endret, ber om bekreftelse og retter avvikene.
                               Etterpå sjekkes repoene på nytt. Med --force rettes avvikene uten at du blir spurt.

Uten repo-argumenter gjelder sjekk og patch alle repoene i .meta.
<repo> er enten navnet i .meta (f.eks. spesialist) eller owner/repo (f.eks. navikt/helse-spesialist).

Eksempler:
  node .bin/github-innstillinger.mjs hent spesialist
  node .bin/github-innstillinger.mjs sjekk
  node .bin/github-innstillinger.mjs sjekk spleis speil
  node .bin/github-innstillinger.mjs patch spleis
  node .bin/github-innstillinger.mjs patch --force

Hva som sjekkes:
  repo                        Merge-valg, auto-merge, sletting av branch etter merge, issues, wiki, prosjekter, standardbranch m.m.
  branchProtection            Beskyttelse av standardbranchen: admins, lineær historikk, påkrevde sjekker, review, force push m.m.
  rulesets                    Rulesets som er satt på selve repoet.
  teams                       Team og tilgangsnivå. Team som ikke står i fasiten, regnes som avvik.
  direkteSamarbeidspartnere   Personer som er lagt til direkte på repoet. Personer som ikke står i fasiten, regnes som avvik.
  sikkerhet                   Dependabot-varsler og -sikkerhetsoppdateringer, secret scanning og push protection.
  actions                     Om Actions er slått på, og hvilke actions som er tillatt.
  workflowPermissions         Standardtilgangen til GITHUB_TOKEN i workflows.

Bare nøklene som står i fasiten, blir sjekket. Fjern nøkler du ikke vil sjekke eller rette.

Dette retter ikke patch:
  - arkiverte repoer og endringer i archived
  - innstillinger som ikke kunne hentes, f.eks. fordi du ikke er admin på repoet

Vær obs på at patch fjerner tilgangen til team og personer som ikke står i fasiten.`

function hentToken() {
    try {
        return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
    } catch (e) {
        throw new Error(`Klarte ikke å hente token med 'gh auth token'. Er du logget inn med 'gh auth login'?\n${e.stderr ?? e.message}`)
    }
}

let token

class GithubFeil extends Error {
    constructor(status, sti, melding) {
        super(`${status} ${sti}: ${melding}`)
        this.status = status
    }
}

async function github(sti, { tillat404 = false, metode = 'GET', body } = {}) {
    const url = sti.startsWith('http') ? sti : `${API}${sti}`
    const respons = await fetch(url, {
        method: metode,
        body: body === undefined ? undefined : JSON.stringify(body),
        headers: {
            ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
            Authorization: `Bearer ${(token ??= hentToken())}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'helse-sas-meta-github-innstillinger',
        },
    })
    if (respons.status === 404 && tillat404) return { status: 404, data: null, neste: null }
    if (respons.status === 204) return { status: 204, data: null, neste: null }
    if (!respons.ok) {
        const tekst = await respons.text()
        let melding = tekst
        try {
            melding = JSON.parse(tekst).message ?? tekst
        } catch {}
        throw new GithubFeil(respons.status, sti, melding)
    }
    const neste = respons.headers.get('link')?.match(/<([^>]+)>;\s*rel="next"/)?.[1] ?? null
    const tekst = await respons.text()
    return { status: respons.status, data: tekst ? JSON.parse(tekst) : null, neste }
}

async function githubAlleSider(sti) {
    const resultat = []
    let url = `${sti}${sti.includes('?') ? '&' : '?'}per_page=100`
    while (url) {
        const { data, neste } = await github(url)
        resultat.push(...data)
        url = neste
    }
    return resultat
}

async function ellerFeil(fn) {
    try {
        return await fn()
    } catch (e) {
        if (e instanceof GithubFeil) return { feil: e.message }
        throw e
    }
}

function lesMetaRepoer() {
    const meta = JSON.parse(readFileSync(META_FIL, 'utf8'))
    return Object.entries(meta.projects).map(([navn, url]) => {
        const treff = url.match(/github\.com[:/]([^/]+)\/(.+?)(\.git)?$/)
        if (!treff) throw new Error(`Skjønner ikke git-url for ${navn}: ${url}`)
        return { navn, owner: treff[1], repo: treff[2] }
    })
}

function finnRepo(argument) {
    if (argument.includes('/')) {
        const [owner, repo] = argument.split('/')
        return { navn: repo, owner, repo }
    }
    const repo = lesMetaRepoer().find((r) => r.navn === argument || r.repo === argument)
    if (!repo) throw new Error(`Fant ikke ${argument} i .meta`)
    return repo
}

const REPO_FELTER = [
    'archived',
    'default_branch',
    'has_issues',
    'has_projects',
    'has_wiki',
    'has_discussions',
    'allow_merge_commit',
    'allow_squash_merge',
    'allow_rebase_merge',
    'allow_auto_merge',
    'allow_update_branch',
    'delete_branch_on_merge',
    'squash_merge_commit_title',
    'squash_merge_commit_message',
    'merge_commit_title',
    'merge_commit_message',
    'web_commit_signoff_required',
]

function plukk(objekt, felter) {
    return Object.fromEntries(felter.filter((f) => f in objekt).map((f) => [f, objekt[f]]))
}

function aktivert(verdi) {
    return verdi?.enabled ?? false
}

function normaliserBranchProtection(p) {
    if (!p) return null
    const reviews = p.required_pull_request_reviews
    const checks = p.required_status_checks
    const restriksjoner = p.restrictions
    return {
        required_status_checks: checks
            ? {
                  strict: checks.strict,
                  contexts: [...(checks.contexts ?? [])].sort(),
              }
            : null,
        enforce_admins: aktivert(p.enforce_admins),
        required_pull_request_reviews: reviews
            ? {
                  dismiss_stale_reviews: reviews.dismiss_stale_reviews ?? false,
                  require_code_owner_reviews: reviews.require_code_owner_reviews ?? false,
                  required_approving_review_count: reviews.required_approving_review_count ?? 0,
                  require_last_push_approval: reviews.require_last_push_approval ?? false,
              }
            : null,
        restrictions: restriksjoner
            ? {
                  users: restriksjoner.users.map((u) => u.login).sort(),
                  teams: restriksjoner.teams.map((t) => t.slug).sort(),
                  apps: restriksjoner.apps.map((a) => a.slug).sort(),
              }
            : null,
        required_signatures: aktivert(p.required_signatures),
        required_linear_history: aktivert(p.required_linear_history),
        allow_force_pushes: aktivert(p.allow_force_pushes),
        allow_deletions: aktivert(p.allow_deletions),
        block_creations: aktivert(p.block_creations),
        required_conversation_resolution: aktivert(p.required_conversation_resolution),
        lock_branch: aktivert(p.lock_branch),
        allow_fork_syncing: aktivert(p.allow_fork_syncing),
    }
}

async function hentRulesets(owner, repo) {
    const oversikt = await githubAlleSider(`/repos/${owner}/${repo}/rulesets?includes_parents=false`)
    const rulesets = {}
    const ider = {}
    for (const { id } of oversikt) {
        const { data } = await github(`/repos/${owner}/${repo}/rulesets/${id}`)
        ider[data.name] = id
        rulesets[data.name] = {
            target: data.target,
            enforcement: data.enforcement,
            conditions: data.conditions ?? null,
            bypass_actors: (data.bypass_actors ?? [])
                .map((a) => ({ actor_type: a.actor_type, actor_id: a.actor_id, bypass_mode: a.bypass_mode }))
                .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
            rules: (data.rules ?? []).sort((a, b) => a.type.localeCompare(b.type)),
        }
    }
    return { rulesets, ider }
}

async function hentActions(owner, repo) {
    const { data } = await github(`/repos/${owner}/${repo}/actions/permissions`)
    const actions = Object.fromEntries(Object.entries(data).filter(([nøkkel]) => !nøkkel.endsWith('_url')))
    if (actions.allowed_actions === 'selected') {
        actions.selected_actions = (await github(`/repos/${owner}/${repo}/actions/permissions/selected-actions`)).data
    }
    return actions
}

async function hentRepo({ owner, repo }) {
    const { data: repoData } = await github(`/repos/${owner}/${repo}`)
    const branch = repoData.default_branch

    const [branchProtection, rulesets, teams, samarbeidspartnere, sårbarhetsvarsler, sikkerhetsfikser, actions, workflow] =
        await Promise.all([
            ellerFeil(async () => normaliserBranchProtection((await github(`/repos/${owner}/${repo}/branches/${branch}/protection`, { tillat404: true })).data)),
            ellerFeil(() => hentRulesets(owner, repo)),
            ellerFeil(async () =>
                Object.fromEntries((await githubAlleSider(`/repos/${owner}/${repo}/teams`)).map((t) => [t.slug, t.permission]).sort(([a], [b]) => a.localeCompare(b))),
            ),
            ellerFeil(async () =>
                Object.fromEntries(
                    (await githubAlleSider(`/repos/${owner}/${repo}/collaborators?affiliation=direct`)).map((c) => [c.login, c.role_name]).sort(([a], [b]) => a.localeCompare(b)),
                ),
            ),
            ellerFeil(async () => (await github(`/repos/${owner}/${repo}/vulnerability-alerts`, { tillat404: true })).status === 204),
            ellerFeil(async () => (await github(`/repos/${owner}/${repo}/automated-security-fixes`, { tillat404: true })).data?.enabled ?? false),
            ellerFeil(() => hentActions(owner, repo)),
            ellerFeil(async () => (await github(`/repos/${owner}/${repo}/actions/permissions/workflow`)).data),
        ])

    const sikkerhetOgAnalyse = Object.fromEntries(Object.entries(repoData.security_and_analysis ?? {}).map(([nøkkel, verdi]) => [nøkkel, verdi?.status ?? null]))

    return {
        branch,
        rulesetIder: rulesets.ider ?? {},
        innstillinger: {
            repo: plukk(repoData, REPO_FELTER),
            branchProtection,
            rulesets: erFeil(rulesets) ? rulesets : rulesets.rulesets,
            teams,
            direkteSamarbeidspartnere: samarbeidspartnere,
            sikkerhet: {
                vulnerability_alerts: sårbarhetsvarsler,
                automated_security_fixes: sikkerhetsfikser,
                ...sikkerhetOgAnalyse,
            },
            actions,
            workflowPermissions: workflow,
        },
    }
}

function erFeil(verdi) {
    return erObjekt(verdi) && 'feil' in verdi && Object.keys(verdi).length === 1
}

function erObjekt(verdi) {
    return verdi !== null && typeof verdi === 'object' && !Array.isArray(verdi)
}

function likt(a, b) {
    return JSON.stringify(sortertKopi(a)) === JSON.stringify(sortertKopi(b))
}

function sortertKopi(verdi) {
    if (Array.isArray(verdi)) return verdi.map(sortertKopi)
    if (erObjekt(verdi)) return Object.fromEntries(Object.keys(verdi).sort().map((k) => [k, sortertKopi(verdi[k])]))
    return verdi
}

function sammenlign(forventet, faktisk, sti = [], avvik = []) {
    if (erFeil(faktisk)) {
        avvik.push({ sti: sti.join('.'), forventet, faktisk: `kunne ikke hentes (${faktisk.feil})` })
        return avvik
    }
    if (erObjekt(forventet) && erObjekt(faktisk)) {
        for (const nøkkel of Object.keys(forventet)) {
            sammenlign(forventet[nøkkel], faktisk[nøkkel], [...sti, nøkkel], avvik)
        }
        if (EKSAKTE_SEKSJONER.has(sti[0]) && sti.length === 1) {
            for (const nøkkel of Object.keys(faktisk)) {
                if (!(nøkkel in forventet)) avvik.push({ sti: [...sti, nøkkel].join('.'), forventet: undefined, faktisk: faktisk[nøkkel] })
            }
        }
        return avvik
    }
    if (!likt(forventet, faktisk)) avvik.push({ sti: sti.join('.'), forventet, faktisk })
    return avvik
}

function formater(verdi) {
    if (verdi === undefined) return '(mangler)'
    if (verdi === null) return 'ingen (null)'
    if (erObjekt(verdi) && Object.keys(verdi).length > 0) return '{…}'
    return JSON.stringify(verdi)
}

async function iParallell(elementer, antall, fn) {
    const resultater = new Array(elementer.length)
    let neste = 0
    await Promise.all(
        Array.from({ length: Math.min(antall, elementer.length) }, async () => {
            while (neste < elementer.length) {
                const indeks = neste++
                resultater[indeks] = await fn(elementer[indeks])
            }
        }),
    )
    return resultater
}

function lesForventet() {
    if (!existsSync(FORVENTET_FIL)) {
        throw new Error(`Fant ikke ${FORVENTET_FIL}. Lag den først med: node .bin/github-innstillinger.mjs hent spesialist`)
    }
    const { kilde, ...forventet } = JSON.parse(readFileSync(FORVENTET_FIL, 'utf8'))
    return { kilde, forventet }
}

async function hentOgSammenlign(forventet, repoer) {
    return iParallell(repoer, SAMTIDIGE_REPOER, async (r) => {
        try {
            const hentet = await hentRepo(r)
            return { ...r, ...hentet, avvik: sammenlign(forventet, hentet.innstillinger) }
        } catch (e) {
            return { ...r, feil: e.message }
        }
    })
}

function skrivRapport(resultater) {
    const avvikPerInnstilling = new Map()
    for (const r of resultater) {
        const fulltNavn = `${r.owner}/${r.repo}`
        if (r.feil) {
            console.log(`❌ ${fulltNavn}: ${r.feil}`)
            continue
        }
        if (r.avvik.length === 0) {
            console.log(`✅ ${fulltNavn}`)
            continue
        }
        console.log(`⚠️  ${fulltNavn} (${r.avvik.length} avvik)`)
        for (const a of r.avvik) {
            console.log(`     ${a.sti}: forventet ${formater(a.forventet)}, var ${formater(a.faktisk)}`)
            avvikPerInnstilling.set(a.sti, [...(avvikPerInnstilling.get(a.sti) ?? []), r.navn])
        }
    }

    const iSynk = resultater.filter((r) => !r.feil && r.avvik.length === 0).length
    const medFeil = resultater.filter((r) => r.feil).length
    console.log(`\nOppsummering: ${iSynk} i synk, ${resultater.length - iSynk - medFeil} med avvik, ${medFeil} kunne ikke sjekkes`)

    if (avvikPerInnstilling.size > 0) {
        console.log('\nAvvik per innstilling:')
        for (const [sti, navn] of [...avvikPerInnstilling].sort((a, b) => b[1].length - a[1].length)) {
            console.log(`  ${sti} (${navn.length}): ${navn.join(', ')}`)
        }
    }

    return iSynk === resultater.length ? 0 : 1
}

function velgRepoer(repoArgumenter) {
    return repoArgumenter.length > 0 ? repoArgumenter.map(finnRepo) : lesMetaRepoer()
}

async function sjekk(repoArgumenter) {
    const { kilde, forventet } = lesForventet()
    const repoer = velgRepoer(repoArgumenter)
    console.log(`Sjekker ${repoer.length} repoer mot .bin/github-innstillinger.json${kilde ? ` (hentet fra ${kilde})` : ''}\n`)
    return skrivRapport(await hentOgSammenlign(forventet, repoer))
}

function flett(faktisk, forventet) {
    if (forventet === undefined) return faktisk
    if (erObjekt(forventet) && erObjekt(faktisk)) {
        const resultat = { ...faktisk }
        for (const [nøkkel, verdi] of Object.entries(forventet)) resultat[nøkkel] = flett(faktisk[nøkkel], verdi)
        return resultat
    }
    return forventet
}

const SAMARBEIDSPARTNER_TILGANG = { read: 'pull', write: 'push' }

function planleggPatch(forventet, { owner, repo, branch, rulesetIder, innstillinger: faktisk, avvik }) {
    const base = `/repos/${owner}/${repo}`
    const operasjoner = []
    const manuelle = []
    const operasjon = (beskrivelse, metode, sti, body) => operasjoner.push({ beskrivelse, metode, sti, body })
    const harAvvik = (seksjon) => avvik.some((a) => a.sti === seksjon || a.sti.startsWith(`${seksjon}.`))
    const ulikt = (seksjon, nøkkel) => !likt(forventet[seksjon][nøkkel], faktisk[seksjon]?.[nøkkel])

    if (faktisk.repo.archived) {
        manuelle.push('repoet er arkivert og kan ikke endres via API-et')
        return { operasjoner, manuelle }
    }

    for (const seksjon of Object.keys(forventet).filter(harAvvik)) {
        if (erFeil(faktisk[seksjon])) {
            manuelle.push(`${seksjon} kunne ikke hentes (${faktisk[seksjon].feil}), så den blir ikke endret`)
            continue
        }
        const ønsket = forventet[seksjon]
        const nå = faktisk[seksjon]

        switch (seksjon) {
            case 'repo': {
                const endringer = Object.fromEntries(Object.keys(ønsket).filter((k) => k !== 'archived' && ulikt('repo', k)).map((k) => [k, ønsket[k]]))
                if ('archived' in ønsket && ulikt('repo', 'archived')) manuelle.push(`repo.archived må endres manuelt (forventet ${ønsket.archived})`)
                if (Object.keys(endringer).length > 0) operasjon(`Repoinnstillinger: ${JSON.stringify(endringer)}`, 'PATCH', base, endringer)
                break
            }
            case 'branchProtection': {
                const protectionBranch = forventet.repo?.default_branch ?? branch
                const sti = `${base}/branches/${protectionBranch}/protection`
                if (ønsket === null) {
                    operasjon(`Fjern branch protection på ${protectionBranch}`, 'DELETE', sti)
                    break
                }
                const p = flett(nå ?? {}, ønsket)
                const sjekker = p.required_status_checks
                operasjon(`Sett branch protection på ${protectionBranch}`, 'PUT', sti, {
                    required_status_checks: sjekker ? { strict: sjekker.strict ?? false, contexts: sjekker.contexts ?? [] } : null,
                    enforce_admins: p.enforce_admins ?? false,
                    required_pull_request_reviews: p.required_pull_request_reviews ?? null,
                    restrictions: p.restrictions ?? null,
                    required_linear_history: p.required_linear_history ?? false,
                    allow_force_pushes: p.allow_force_pushes ?? false,
                    allow_deletions: p.allow_deletions ?? false,
                    block_creations: p.block_creations ?? false,
                    required_conversation_resolution: p.required_conversation_resolution ?? false,
                    lock_branch: p.lock_branch ?? false,
                    allow_fork_syncing: p.allow_fork_syncing ?? false,
                })
                const signaturer = p.required_signatures ?? false
                if (signaturer !== (nå?.required_signatures ?? false)) {
                    operasjon(`${signaturer ? 'Krev' : 'Ikke krev'} signerte commits på ${protectionBranch}`, signaturer ? 'POST' : 'DELETE', `${sti}/required_signatures`)
                }
                break
            }
            case 'rulesets': {
                for (const [navn, ruleset] of Object.entries(ønsket)) {
                    if (!(navn in nå)) operasjon(`Opprett ruleset «${navn}»`, 'POST', `${base}/rulesets`, { name: navn, ...ruleset })
                    else if (!likt(ruleset, nå[navn])) operasjon(`Oppdater ruleset «${navn}»`, 'PUT', `${base}/rulesets/${rulesetIder[navn]}`, { name: navn, ...ruleset })
                }
                for (const navn of Object.keys(nå).filter((navn) => !(navn in ønsket))) {
                    operasjon(`Slett ruleset «${navn}»`, 'DELETE', `${base}/rulesets/${rulesetIder[navn]}`)
                }
                break
            }
            case 'teams': {
                for (const [team, tilgang] of Object.entries(ønsket)) {
                    if (nå[team] !== tilgang) operasjon(`Gi team ${team} ${tilgang}-tilgang`, 'PUT', `/orgs/${owner}/teams/${team}/repos/${owner}/${repo}`, { permission: tilgang })
                }
                for (const team of Object.keys(nå).filter((team) => !(team in ønsket))) {
                    operasjon(`Fjern tilgangen til team ${team} (${nå[team]})`, 'DELETE', `/orgs/${owner}/teams/${team}/repos/${owner}/${repo}`)
                }
                break
            }
            case 'direkteSamarbeidspartnere': {
                for (const [bruker, rolle] of Object.entries(ønsket)) {
                    if (nå[bruker] !== rolle) {
                        operasjon(`Gi ${bruker} ${rolle}-tilgang`, 'PUT', `${base}/collaborators/${bruker}`, { permission: SAMARBEIDSPARTNER_TILGANG[rolle] ?? rolle })
                    }
                }
                for (const bruker of Object.keys(nå).filter((bruker) => !(bruker in ønsket))) {
                    operasjon(`Fjern ${bruker} (${nå[bruker]}) som direkte samarbeidspartner`, 'DELETE', `${base}/collaborators/${bruker}`)
                }
                break
            }
            case 'sikkerhet': {
                const { vulnerability_alerts, automated_security_fixes, ...sikkerhetOgAnalyse } = ønsket
                if (vulnerability_alerts !== undefined && ulikt('sikkerhet', 'vulnerability_alerts')) {
                    operasjon(`${vulnerability_alerts ? 'Slå på' : 'Slå av'} Dependabot alerts`, vulnerability_alerts ? 'PUT' : 'DELETE', `${base}/vulnerability-alerts`)
                }
                if (automated_security_fixes !== undefined && ulikt('sikkerhet', 'automated_security_fixes')) {
                    operasjon(`${automated_security_fixes ? 'Slå på' : 'Slå av'} Dependabot security updates`, automated_security_fixes ? 'PUT' : 'DELETE', `${base}/automated-security-fixes`)
                }
                const endringer = Object.fromEntries(Object.entries(sikkerhetOgAnalyse).filter(([k]) => ulikt('sikkerhet', k)).map(([k, status]) => [k, { status }]))
                if (Object.keys(endringer).length > 0) {
                    operasjon(`Sikkerhet og analyse: ${Object.entries(endringer).map(([k, v]) => `${k}=${v.status}`).join(', ')}`, 'PATCH', base, { security_and_analysis: endringer })
                }
                break
            }
            case 'actions': {
                const { selected_actions, ...tillatelser } = flett(nå, ønsket)
                const { selected_actions: _, ...nåværendeTillatelser } = nå
                if (!likt(tillatelser, nåværendeTillatelser)) operasjon(`Actions-tillatelser: ${JSON.stringify(tillatelser)}`, 'PUT', `${base}/actions/permissions`, tillatelser)
                if (selected_actions && !likt(selected_actions, nå.selected_actions)) {
                    operasjon('Oppdater tillatte actions', 'PUT', `${base}/actions/permissions/selected-actions`, selected_actions)
                }
                break
            }
            case 'workflowPermissions': {
                const tillatelser = flett(nå, ønsket)
                operasjon(`Workflow-tillatelser: ${JSON.stringify(tillatelser)}`, 'PUT', `${base}/actions/permissions/workflow`, tillatelser)
                break
            }
            default:
                manuelle.push(`ukjent seksjon ${seksjon} blir ikke endret`)
        }
    }
    return { operasjoner, manuelle }
}

async function bekreft(spørsmål) {
    if (!process.stdin.isTTY) throw new Error('Kan ikke spørre om bekreftelse uten en terminal. Bruk --force for å patche uten bekreftelse.')
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    try {
        return ['j', 'ja', 'y', 'yes'].includes((await rl.question(spørsmål)).trim().toLowerCase())
    } finally {
        rl.close()
    }
}

async function patch(repoArgumenter, force) {
    const { kilde, forventet } = lesForventet()
    const repoer = velgRepoer(repoArgumenter)
    console.log(`Sammenligner ${repoer.length} repoer med .bin/github-innstillinger.json${kilde ? ` (hentet fra ${kilde})` : ''}\n`)

    const resultater = await hentOgSammenlign(forventet, repoer)
    skrivRapport(resultater)

    const planer = resultater.filter((r) => !r.feil && r.avvik.length > 0).map((r) => ({ ...r, ...planleggPatch(forventet, r) }))
    const antallOperasjoner = planer.reduce((sum, p) => sum + p.operasjoner.length, 0)

    if (planer.length === 0) {
        console.log('\nIngenting å patche.')
        return resultater.some((r) => r.feil) ? 1 : 0
    }

    console.log('\nPlanlagte endringer:')
    for (const p of planer) {
        console.log(`  ${p.owner}/${p.repo}`)
        for (const o of p.operasjoner) console.log(`     ✏️  ${o.beskrivelse}`)
        for (const m of p.manuelle) console.log(`     ✋ ${m}`)
    }

    if (antallOperasjoner === 0) {
        console.log('\nIngen avvik kan rettes automatisk.')
        return 1
    }

    const repoerMedEndringer = planer.filter((p) => p.operasjoner.length > 0)
    if (!force && !(await bekreft(`\nVil du utføre ${antallOperasjoner} endringer i ${repoerMedEndringer.length} repoer? [j/N] `))) {
        console.log('Avbrutt. Ingenting er endret.')
        return 1
    }

    let feilet = 0
    for (const p of repoerMedEndringer) {
        console.log(`\n${p.owner}/${p.repo}`)
        for (const o of p.operasjoner) {
            try {
                await github(o.sti, { metode: o.metode, body: o.body })
                console.log(`  ✅ ${o.beskrivelse}`)
            } catch (e) {
                feilet++
                console.log(`  ❌ ${o.beskrivelse}: ${e.message}`)
            }
        }
    }

    console.log(`\nSjekker repoene på nytt etter patching:\n`)
    const etterpå = await hentOgSammenlign(forventet, repoerMedEndringer)
    const kode = skrivRapport(etterpå)
    if (feilet > 0) console.log(`\n${feilet} endringer feilet.`)
    return feilet > 0 || kode !== 0 || resultater.some((r) => r.feil) ? 1 : 0
}

async function main() {
    const argumenter = process.argv.slice(2)
    const force = argumenter.includes('--force')
    const [kommando, ...rest] = argumenter.filter((a) => a !== '--force')
    switch (kommando) {
        case 'hent':
        case 'vis': {
            if (rest.length !== 1) throw new Error(bruk)
            const repo = finnRepo(rest[0])
            const innstillinger = { kilde: `${repo.owner}/${repo.repo}`, ...(await hentRepo(repo)).innstillinger }
            const json = JSON.stringify(innstillinger, null, 2) + '\n'
            if (kommando === 'vis') {
                process.stdout.write(json)
            } else {
                writeFileSync(FORVENTET_FIL, json)
                console.log(`Skrev innstillingene til ${repo.owner}/${repo.repo} til ${FORVENTET_FIL}`)
                console.log('Fjern nøkler du ikke vil sjekke. Bare nøklene som står i filen blir sammenlignet.')
            }
            return 0
        }
        case 'sjekk':
            return sjekk(rest)
        case 'patch':
            return patch(rest, force)
        default:
            if (![undefined, '-h', '--help', 'hjelp'].includes(kommando)) console.log(`Ukjent kommando: ${kommando}\n`)
            console.log(bruk)
            return [undefined, '-h', '--help', 'hjelp'].includes(kommando) ? 0 : 1
    }
}

main()
    .then((kode) => process.exit(kode))
    .catch((e) => {
        console.error(e.message)
        process.exit(2)
    })
