import { describe, expect, it } from 'vitest';
import { parseFlowDocument } from '../schema/flow';
import { computeEdgeSteps } from './flowSteps';

function doc(edges: Array<Record<string, unknown>>) {
  const result = parseFlowDocument({
    version: 1,
    title: 't',
    nodes: [
      { id: 'a', type: 'service', label: 'A' },
      { id: 'b', type: 'service', label: 'B' },
      { id: 'c', type: 'service', label: 'C' },
    ],
    edges,
  });
  if (!result.ok) throw new Error('unexpected invalid doc in test fixture');
  return result.data;
}

describe('computeEdgeSteps', () => {
  it('faller tilbake til array-rekkefølge (1-indeksert) når step ikke er satt', () => {
    const d = doc([
      { id: 'e1', source: 'a', target: 'b', type: 'flow' },
      { id: 'e2', source: 'b', target: 'c', type: 'flow' },
    ]);
    const steps = computeEdgeSteps(d);
    expect(steps.get('e1')).toBe(1);
    expect(steps.get('e2')).toBe(2);
  });

  it('bruker eksplisitt step når satt, selv om det ikke matcher array-posisjon', () => {
    const d = doc([
      { id: 'e1', source: 'a', target: 'b', type: 'flow', step: 5 },
      { id: 'e2', source: 'b', target: 'c', type: 'flow' },
    ]);
    const steps = computeEdgeSteps(d);
    expect(steps.get('e1')).toBe(5);
    // e2 mangler eksplisitt step, faller tilbake til sin egen array-posisjon (2)
    expect(steps.get('e2')).toBe(2);
  });

  it('tillater flere kanter å dele samme step-tall (parallelt fan-out)', () => {
    const d = doc([
      { id: 'e1', source: 'a', target: 'b', type: 'behov', step: 1 },
      { id: 'e2', source: 'a', target: 'c', type: 'behov', step: 1 },
    ]);
    const steps = computeEdgeSteps(d);
    expect(steps.get('e1')).toBe(1);
    expect(steps.get('e2')).toBe(1);
  });
});
