import type { FlowDocument } from '../schema/flow';

/**
 * Beregner et "steg-nummer" per kant, slik at rekkefølgen i diagrammet kan
 * vises tydelig (både på selve pilen og i forklaringspanelet) — dette er
 * det som lar en leser gå fra tekstforklaringen til skissen og vite nøyaktig
 * hvilken pil de skal følge først, nummer to, osv.
 *
 * Kanten sitt eksplisitte `step`-felt brukes hvis satt (flere kanter kan
 * dele samme tall når de skjer parallelt — se "Parallellitet/fan-out" i
 * agent-instruksjonen). Ellers faller vi tilbake til kantens posisjon i
 * `edges`-arrayet (1-indeksert), siden agenten normalt skriver kantene i
 * faktisk rekkefølge.
 */
export function computeEdgeSteps(doc: FlowDocument): Map<string, number> {
  const steps = new Map<string, number>();
  doc.edges.forEach((edge, index) => {
    steps.set(edge.id, edge.step ?? index + 1);
  });
  return steps;
}

