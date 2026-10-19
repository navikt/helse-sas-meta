import { describe, expect, it } from 'vitest';
import { isDraftId, loadDrafts, newDraftId, parseDrafts, saveDrafts } from './drafts';

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

describe('drafts', () => {
  it('lager unike forslag-id-er', () => {
    const a = newDraftId('node');
    const b = newDraftId('node');
    expect(a).not.toBe(b);
    expect(isDraftId(a)).toBe(true);
    expect(isDraftId('vanlig-node')).toBe(false);
  });

  it('lagrer og leser forslag per flytfil', () => {
    const storage = memoryStorage();
    const drafts = {
      nodes: [{ id: 'draft:node-1', type: 'service' as const, label: 'Ny tjeneste', x: 10, y: 20 }],
      edges: [
        { id: 'draft:edge-1', source: 'draft:node-1', target: 'spleis', sourceHandle: 'free-EAST-0', targetHandle: null, label: 'kall' },
      ],
    };
    saveDrafts('a.flow.json', drafts, storage);
    expect(loadDrafts('a.flow.json', storage)).toEqual(drafts);
    expect(loadDrafts('b.flow.json', storage)).toEqual({ nodes: [], edges: [] });
  });

  it('fjerner lagringen når det ikke er noen forslag igjen', () => {
    const storage = memoryStorage();
    saveDrafts('a.flow.json', { nodes: [{ id: 'draft:n', type: 'process', label: 'x', x: 0, y: 0 }], edges: [] }, storage);
    saveDrafts('a.flow.json', { nodes: [], edges: [] }, storage);
    expect(storage.data.size).toBe(0);
  });

  it('hopper over ugyldige elementer og tåler ødelagt JSON', () => {
    const parsed = parseDrafts({
      nodes: [
        { id: 'draft:ok', type: 'process', label: 'OK', x: 1, y: 2 },
        { id: 'ikke-draft', type: 'process', label: 'x', x: 1, y: 2 },
        { id: 'draft:feil-type', type: 'ukjent', label: 'x', x: 1, y: 2 },
        { id: 'draft:mangler-x', type: 'process', label: 'x', y: 2 },
      ],
      edges: [{ id: 'draft:e', source: 'a' }],
    });
    expect(parsed.nodes.map((n) => n.id)).toEqual(['draft:ok']);
    expect(parsed.edges).toEqual([]);

    const storage = memoryStorage();
    storage.setItem('arkitektur-viewer:forslag:x.flow.json', '{ikke json');
    expect(loadDrafts('x.flow.json', storage)).toEqual({ nodes: [], edges: [] });
  });
});

describe('saveDrafts endringsdeteksjon', () => {
  it('returnerer false når innholdet er uendret', () => {
    const storage = memoryStorage();
    const d = { nodes: [{ id: 'draft:n', type: 'process' as const, label: 'x', x: 0, y: 0 }], edges: [] };
    expect(saveDrafts('a.flow.json', d, storage)).toBe(true);
    expect(saveDrafts('a.flow.json', d, storage)).toBe(false);
    expect(saveDrafts('a.flow.json', { nodes: [], edges: [] }, storage)).toBe(true);
    expect(saveDrafts('a.flow.json', { nodes: [], edges: [] }, storage)).toBe(false);
  });
});
