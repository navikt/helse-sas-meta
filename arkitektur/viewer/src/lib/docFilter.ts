import type { FlowDocument } from '../schema/flow';
import { computeEdgeSteps } from './flowSteps';

export function hasDatabaseNodes(doc: FlowDocument): boolean {
  return doc.nodes.some((n) => n.type === 'database');
}

/**
 * Fjerner alle database-noder og alle kanter til/fra dem. Returnerer samme
 * objekt hvis flyten ikke har databaser.
 *
 * Stegnumrene til de gjenværende kantene nummereres om fortløpende (1, 2,
 * 3, …), slik at rekkefølgen ikke hopper over numrene til skjulte kanter.
 * Relativ rekkefølge og parallelle steg (samme nummer) bevares.
 */
export function withoutDatabases(doc: FlowDocument): FlowDocument {
  if (!hasDatabaseNodes(doc)) return doc;
  const hidden = new Set(doc.nodes.filter((n) => n.type === 'database').map((n) => n.id));
  const originalSteps = computeEdgeSteps(doc);
  const edges = doc.edges.filter((e) => !hidden.has(e.source) && !hidden.has(e.target));
  const remainingSteps = [...new Set(edges.map((e) => originalSteps.get(e.id) ?? 0))].sort((a, b) => a - b);
  const compact = new Map(remainingSteps.map((step, i) => [step, i + 1]));
  return {
    ...doc,
    nodes: doc.nodes.filter((n) => !hidden.has(n.id)),
    edges: edges.map((e) => ({ ...e, step: compact.get(originalSteps.get(e.id) ?? 0) })),
  };
}
