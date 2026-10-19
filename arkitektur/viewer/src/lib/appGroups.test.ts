import { describe, expect, it } from 'vitest';
import type { FlowDocument, FlowNode } from '../schema/flow';
import { resolveAppGroups } from './appGroups';

const node = (id: string, type: FlowNode['type'], files: string[], extra: Partial<FlowNode> = {}): FlowNode => ({
  id,
  type,
  label: id,
  uncertain: false,
  evidence: files.map((file) => ({ file })),
  ...extra,
});
const doc = (nodes: FlowNode[]): FlowDocument => ({ version: 1, title: 't', description: '', direction: 'RIGHT', nodes, edges: [] });

describe('resolveAppGroups', () => {
  it('samler prosess, beslutning og egen database med appen evidensen ligger i', () => {
    const groups = resolveAppGroups(
      doc([
        node('spesialist', 'service', ['spesialist/a.kt']),
        node('spesialist_db', 'database', ['spesialist/db.kt']),
        node('sjekk', 'decision', ['spesialist/b.kt']),
        node('steg', 'process', ['spesialist/c.kt']),
        node('spleis', 'service', ['spleis/a.kt']),
      ])
    );
    expect(groups).toEqual([
      { id: 'app:spesialist', label: 'spesialist', nodeIds: ['spesialist', 'spesialist_db', 'sjekk', 'steg'] },
    ]);
  });

  it('tar ikke med tjenester, hendelser, eksterne systemer eller fremmede databaser', () => {
    const groups = resolveAppGroups(
      doc([
        node('spesialist', 'service', ['spesialist/a.kt']),
        node('speil', 'frontend', ['spesialist/api.kt']),
        node('hendelse', 'event', ['spesialist/kafka.kt']),
        node('ekstern', 'external', ['spesialist/client.kt']),
        node('infotrygd_replika', 'database', ['spesialist/repo.kt']),
      ])
    );
    expect(groups).toEqual([]);
  });

  it('lager en gruppe oppkalt etter repoet når appen selv ikke er en node', () => {
    const groups = resolveAppGroups(
      doc([node('periode', 'process', ['spleis/a.kt']), node('person', 'process', ['spleis/b.kt'])])
    );
    expect(groups).toEqual([{ id: 'repo:spleis', label: 'spleis', nodeIds: ['periode', 'person'] }]);
  });

  it('lar eksplisitt group vinne over evidens', () => {
    const groups = resolveAppGroups(
      doc([
        node('app', 'service', ['app/a.kt'], { label: 'App' }),
        node('db', 'database', ['annet/x.kt'], { group: 'app' }),
        node('x', 'process', [], { group: 'egen' }),
        node('y', 'decision', [], { group: 'egen' }),
      ])
    );
    expect(groups).toEqual([
      { id: 'app:app', label: 'App', nodeIds: ['app', 'db'] },
      { id: 'group:egen', label: 'egen', nodeIds: ['x', 'y'] },
    ]);
  });

  it('ignorerer mapper som starter med punktum og grupper med kun én node', () => {
    expect(resolveAppGroups(doc([node('a', 'process', ['.idea/x']), node('b', 'process', ['.idea/y'])]))).toEqual([]);
    expect(resolveAppGroups(doc([node('a', 'process', ['spleis/x'])]))).toEqual([]);
  });
});
