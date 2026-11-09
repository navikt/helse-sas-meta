import assert from 'node:assert/strict'
import { test } from 'node:test'
import { forventetForRepo, planleggPatch, sammenlign } from './github-innstillinger.mjs'

const forventet = {
    repo: { archived: false, has_issues: false, has_projects: false, has_wiki: false },
    direkteSamarbeidspartnere: {},
}

function sjekkOgPlanlegg(repo, innstillinger, owner = 'navikt') {
    const identitet = { owner, repo }
    const avvik = sammenlign(forventetForRepo(forventet, identitet), innstillinger)
    return { avvik, ...planleggPatch(forventet, { ...identitet, innstillinger, avvik }) }
}

test('direkte samarbeidspartnere er unntatt for trygdhetens-voktere', () => {
    const resultat = sjekkOgPlanlegg('trygdhetens-voktere', {
        ...forventet,
        direkteSamarbeidspartnere: { bidragsyter: 'admin' },
    })
    assert.deepEqual(resultat, { avvik: [], operasjoner: [], manuelle: [] })
})

test('andre avvik rettes uten at samarbeidspartnere fjernes i trygdhetens-voktere', () => {
    const resultat = sjekkOgPlanlegg('trygdhetens-voktere', {
        repo: { ...forventet.repo, has_wiki: true },
        direkteSamarbeidspartnere: { bidragsyter: 'admin' },
    })
    assert.deepEqual(resultat.avvik.map((a) => a.sti), ['repo.has_wiki'])
    assert.deepEqual(resultat.operasjoner.map(({ metode, sti, body }) => ({ metode, sti, body })), [
        { metode: 'PATCH', sti: '/repos/navikt/trygdhetens-voktere', body: { has_wiki: false } },
    ])
})

test('issues er unntatt for sas-issues, og andre repoinnstillinger rettes uten has_issues', () => {
    const innstillinger = { ...forventet, repo: { ...forventet.repo, has_issues: true } }
    assert.deepEqual(sjekkOgPlanlegg('sas-issues', innstillinger), { avvik: [], operasjoner: [], manuelle: [] })

    const resultat = sjekkOgPlanlegg('sas-issues', {
        ...innstillinger,
        repo: { ...innstillinger.repo, has_wiki: true },
    })
    assert.deepEqual(resultat.avvik.map((a) => a.sti), ['repo.has_wiki'])
    assert.deepEqual(resultat.operasjoner.map(({ metode, sti, body }) => ({ metode, sti, body })), [
        { metode: 'PATCH', sti: '/repos/navikt/sas-issues', body: { has_wiki: false } },
    ])
})

test('has_projects er bare unntatt for navikt/sas-issues i sjekk og patch', () => {
    const innstillinger = { ...forventet, repo: { ...forventet.repo, has_projects: true } }
    assert.deepEqual(sjekkOgPlanlegg('sas-issues', innstillinger), { avvik: [], operasjoner: [], manuelle: [] })

    const resultat = sjekkOgPlanlegg('sas-issues', {
        ...innstillinger,
        repo: { ...innstillinger.repo, has_wiki: true },
    })
    assert.deepEqual(resultat.avvik.map((a) => a.sti), ['repo.has_wiki'])
    assert.deepEqual(resultat.operasjoner.map((o) => o.body), [{ has_wiki: false }])

    for (const [owner, repo] of [['navikt', 'trygdhetens-voktere'], ['annen', 'sas-issues']]) {
        const resultat = sjekkOgPlanlegg(repo, innstillinger, owner)
        assert.deepEqual(resultat.avvik.map((a) => a.sti), ['repo.has_projects'])
        assert.deepEqual(resultat.operasjoner.map((o) => o.body), [{ has_projects: false }])
    }
})

test('unntakene gjelder bare den aktuelle innstillingen og det aktuelle repoet', () => {
    const innstillinger = {
        repo: { ...forventet.repo, has_issues: true },
        direkteSamarbeidspartnere: { bidragsyter: 'admin' },
    }
    assert.deepEqual(sjekkOgPlanlegg('trygdhetens-voktere', innstillinger).avvik.map((a) => a.sti), ['repo.has_issues'])
    assert.deepEqual(sjekkOgPlanlegg('sas-issues', innstillinger).avvik.map((a) => a.sti), ['direkteSamarbeidspartnere.bidragsyter'])

    for (const [owner, repo] of [['navikt', 'helse-spesialist'], ['annen', 'sas-issues'], ['annen', 'trygdhetens-voktere']]) {
        const resultat = sjekkOgPlanlegg(repo, innstillinger, owner)
        assert.deepEqual(resultat.avvik.map((a) => a.sti), ['repo.has_issues', 'direkteSamarbeidspartnere.bidragsyter'])
        assert.equal(resultat.operasjoner.length, 2)
        assert.equal(resultat.operasjoner[1].metode, 'DELETE')
    }
})

test('fasiten endres ikke av repounntak', () => {
    const original = structuredClone(forventet)
    forventetForRepo(forventet, { owner: 'navikt', repo: 'sas-issues' })
    forventetForRepo(forventet, { owner: 'navikt', repo: 'trygdhetens-voktere' })
    assert.deepEqual(forventet, original)
})
