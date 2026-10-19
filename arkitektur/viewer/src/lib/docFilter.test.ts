import { describe, expect, it } from 'vitest';
import type { FlowDocument, FlowEdge, FlowNode } from '../schema/flow';
import { hasDatabaseNodes, withoutDatabases } from './docFilter';

const node = (id: string, type: FlowNode['type']): FlowNode => ({ id, type, label: id, uncertain: false, evidence: [] });
const edge = (id: string, source: string, target: string): FlowEdge => ({
  id,
  source,
  target,
  type: 'flow',
  uncertain: false,
  evidence: [],
});
const doc = (nodes: FlowNode[], edges: FlowEdge[]): FlowDocument => ({
  version: 1,
  title: 't',
  description: '',
  direction: 'RIGHT',
  nodes,
  edges,
});

describe('withoutDatabases', () => {
  it('fjerner database-noder og alle kanter til og fra dem', () => {
    const d = doc(
      [node('a', 'service'), node('b', 'service'), node('db', 'database')],
      [edge('e1', 'a', 'b'), edge('e2', 'a', 'db'), edge('e3', 'db', 'b')]
    );
    const result = withoutDatabases(d);
    expect(result.nodes.map((n) => n.id)).toEqual(['a', 'b']);
    expect(result.edges.map((e) => e.id)).toEqual(['e1']);
    expect(hasDatabaseNodes(d)).toBe(true);
  });

  it('nummererer rekkefølgen om uten hull og bevarer parallelle steg', () => {
    const d = doc(
      [node('a', 'service'), node('b', 'service'), node('c', 'service'), node('db', 'database')],
      [
        edge('e1', 'a', 'db'),
        edge('e2', 'a', 'b'),
        { ...edge('e3', 'b', 'db'), step: 3 },
        { ...edge('e4', 'b', 'c'), step: 5 },
        { ...edge('e5', 'b', 'a'), step: 5 },
        edge('e6', 'c', 'a'),
      ]
    );
    const steps = Object.fromEntries(withoutDatabases(d).edges.map((e) => [e.id, e.step]));
    expect(steps).toEqual({ e2: 1, e4: 2, e5: 2, e6: 3 });
  });

  it('returnerer samme dokument når det ikke finnes databaser', () => {
    const d = doc([node('a', 'service')], []);
    expect(withoutDatabases(d)).toBe(d);
    expect(hasDatabaseNodes(d)).toBe(false);
  });
});
