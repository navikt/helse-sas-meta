import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { FlowDocument, FlowEdge, FlowNode } from '../schema/flow';
import { parseFlowDocument } from '../schema/flow';
import { labelAnchor } from '../lib/polylinePath';
import {
  layoutFlowDocument,
  computeGraphComplexity,
  computeSpacing,
  adjustSpacingForViewport,
  measureLabelSize,
  wrapLabel,
  edgeCanvasLabel,
  NODE_WIDTH,
  LABEL_MAX_TEXT_WIDTH,
  SPACING_LIMITS,
  portSideFromGeometry,
} from './elkLayout';

function node(id: string, overrides: Partial<FlowNode> = {}): FlowNode {
  return {
    id,
    type: 'service',
    label: id,
    uncertain: false,
    evidence: [],
    ...overrides,
  };
}

function edge(id: string, source: string, target: string, overrides: Partial<FlowEdge> = {}): FlowEdge {
  return {
    id,
    source,
    target,
    type: 'flow',
    uncertain: false,
    evidence: [],
    ...overrides,
  };
}

function doc(nodes: FlowNode[], edges: FlowEdge[]): FlowDocument {
  return { version: 1, title: 'test', description: '', direction: 'RIGHT', nodes, edges };
}

// Grov AABB-kollisjonssjekk mellom et linjestykke (a->b) og en boks, brukt
// til å verifisere at ingen kant visuelt går gjennom en node den ikke
// tilhører. Finmasket sampling (ikke eksakt geometri) er nok for testens
// formål — vi trenger bare "krysser boksen tydelig, midt inni" -deteksjon.
function segmentHitsBox(
  a: { x: number; y: number },
  b: { x: number; y: number },
  box: { x: number; y: number; width: number; height: number }
): boolean {
  const steps = 40;
  const margin = 1; // liten epsilon for å tolerere at en linje treffer akkurat kanten
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    if (
      x > box.x + margin &&
      x < box.x + box.width - margin &&
      y > box.y + margin &&
      y < box.y + box.height - margin
    ) {
      return true;
    }
  }
  return false;
}

function assertNoRouteCrossesForeignBox(layout: Awaited<ReturnType<typeof layoutFlowDocument>>) {
  const boxByNodeId = new Map(layout.nodes.map((n) => [n.id, n]));
  for (const laidOutEdge of layout.edges) {
    const { edge, points } = laidOutEdge;
    if (!points || points.length < 2) continue;
    for (const [nodeId, box] of boxByNodeId) {
      if (nodeId === edge.source || nodeId === edge.target) continue;
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        if (!a || !b) continue;
        expect(segmentHitsBox(a, b, box), `kant ${edge.id} krysser node ${nodeId}`).toBe(false);
      }
    }
  }
}

describe('layoutFlowDocument — akseptansekriterier', () => {
  it('A) enkel 2-nodersgraf (A -> B) gir en kompakt, gyldig layout', async () => {
    const d = doc([node('a'), node('b')], [edge('e1', 'a', 'b')]);
    const layout = await layoutFlowDocument(d);
    expect(layout.nodes).toHaveLength(2);
    expect(layout.edges).toHaveLength(1);
    expect(layout.complexity.tier).toBe('simple');
    const edgeLayout = layout.edges[0];
    expect(edgeLayout?.points?.length).toBeGreaterThanOrEqual(2);
    assertNoRouteCrossesForeignBox(layout);
  });

  it('B) lineær kjede (A -> B -> C -> D) legges ut venstre->høyre i stigende x', async () => {
    const d = doc(
      [node('a'), node('b'), node('c'), node('d')],
      [edge('e1', 'a', 'b'), edge('e2', 'b', 'c'), edge('e3', 'c', 'd')]
    );
    const layout = await layoutFlowDocument(d);
    const xById = new Map(layout.nodes.map((n) => [n.id, n.x]));
    expect(xById.get('a')!).toBeLessThan(xById.get('b')!);
    expect(xById.get('b')!).toBeLessThan(xById.get('c')!);
    expect(xById.get('c')!).toBeLessThan(xById.get('d')!);
    assertNoRouteCrossesForeignBox(layout);
  });

  it('C) fan-out (A -> B, B -> C/D/E) gir B ekte ELK-porter fordelt DISTRIBUTED', async () => {
    const d = doc(
      [node('a'), node('b'), node('c'), node('d'), node('e')],
      [edge('e1', 'a', 'b'), edge('e2', 'b', 'c'), edge('e3', 'b', 'd'), edge('e4', 'b', 'e')]
    );
    const layout = await layoutFlowDocument(d);
    const bNode = layout.nodes.find((n) => n.id === 'b');
    expect(bNode).toBeTruthy();
    // b har 1 innkommende (vest) + 3 utgående (øst) porter
    expect(bNode!.ports).toHaveLength(4);
    const eastPorts = bNode!.ports.filter((p) => p.side === 'EAST');
    expect(eastPorts).toHaveLength(3);
    // Ingen to porter på samme side skal havne på nøyaktig samme y (ELKs
    // DISTRIBUTED-portjustering sprer dem jevnt langs siden).
    const ys = eastPorts.map((p) => p.y);
    expect(new Set(ys).size).toBe(ys.length);
    assertNoRouteCrossesForeignBox(layout);
  });

  it('D) feedback-kant (A -> B -> C -> D -> A) klassifiseres og ruter uten å gå gjennom sentrum', async () => {
    const d = doc(
      [node('a'), node('b'), node('c'), node('d')],
      [edge('e1', 'a', 'b'), edge('e2', 'b', 'c'), edge('e3', 'c', 'd'), edge('e4', 'd', 'a')]
    );
    const layout = await layoutFlowDocument(d);
    const feedback = layout.edges.find((e) => e.id === 'e4');
    expect(feedback?.isFeedback).toBe(true);
    // De tre "fremover"-kantene skal IKKE klassifiseres som feedback.
    expect(layout.edges.filter((e) => e.id !== 'e4').every((e) => !e.isFeedback)).toBe(true);
    assertNoRouteCrossesForeignBox(layout);
  });

  it('E) kompleks graf med hub, database, lange labels og feedback-kant følger hovedflyten uten kollisjon', async () => {
    const d = doc(
      [
        node('frontend', { type: 'frontend', label: 'Frontend' }),
        node('svcA', { label: 'Service A' }),
        node('svcB', { label: 'Service B' }),
        node('svcC', { label: 'Service C' }),
        node('svcD', { label: 'Service D' }),
        node('decision', { type: 'decision', label: 'Beslutning' }),
        node('db', { type: 'database', label: 'Database' }),
        node('external', { type: 'external', label: 'Eksternt system' }),
      ],
      [
        edge('e1', 'frontend', 'svcA', { label: 'Ber om vurdering av søknad' }),
        edge('e2', 'svcA', 'svcB', { label: 'Videresender til beregning av grunnlag' }),
        edge('e3', 'svcA', 'db', { type: 'write', label: 'Lagrer mellomresultat' }),
        edge('e4', 'svcB', 'db', { type: 'read', label: 'Henter historiske data' }),
        edge('e5', 'svcB', 'svcC', { label: 'Sender videre til vurdering' }),
        edge('e6', 'svcC', 'decision', { label: 'Sjekker om vilkår er oppfylt' }),
        edge('e7', 'decision', 'svcD', { label: 'Vilkår oppfylt — fortsetter' }),
        edge('e8', 'decision', 'svcA', { label: 'Vilkår ikke oppfylt — send tilbake for ny vurdering' }),
        edge('e9', 'svcD', 'external', { type: 'call', label: 'Henter tilleggsdata' }),
        edge('e10', 'svcD', 'frontend', { type: 'løsning', label: 'Svarer med resultat' }),
        edge('e11', 'svcA', 'svcC', { label: 'Parallell forespørsel' }),
      ],
      // ekstra parallell kant mellom samme par (svcA -> svcC) for å teste
      // at mergeEdges: false holder dem visuelt separate
    );
    d.edges.push(edge('e12', 'svcA', 'svcC', { label: 'Andre parallelle forespørsel' }));

    const layout = await layoutFlowDocument(d);
    expect(layout.complexity.tier).not.toBe('simple');

    // e8 (decision -> svcA) er en reell tilbakekant i denne grafen.
    const feedbackEdge = layout.edges.find((e) => e.id === 'e8');
    expect(feedbackEdge?.isFeedback).toBe(true);

    // Alle kanter skal ha målt labelText og (utenom selvreferanser) en
    // faktisk ELK-rute med minst 2 punkter.
    for (const e of layout.edges) {
      expect(e.labelText).toBeTruthy();
      expect(e.points?.length ?? 0).toBeGreaterThanOrEqual(2);
    }

    // ELK velger portsidene selv. Linjen skal gå ut fra porten i retning
    // bort fra boksen, på den siden porten oppgir.
    const portById = new Map(layout.nodes.flatMap((n) => n.ports.map((p) => [p.id, p] as const)));
    for (const e of layout.edges) {
      if (!e.points || !e.sourcePortId || !e.targetPortId) continue;
      const ends = [
        [portById.get(e.sourcePortId)!, e.points[0]!, e.points[1]!],
        [portById.get(e.targetPortId)!, e.points[e.points.length - 1]!, e.points[e.points.length - 2]!],
      ] as const;
      for (const [port, end, next] of ends) {
        const leavesOutward =
          port.side === 'EAST' ? next.x > end.x : port.side === 'WEST' ? next.x < end.x : port.side === 'NORTH' ? next.y < end.y : next.y > end.y;
        expect(leavesOutward, `${e.id} ${port.id} ${port.side}`).toBe(true);
      }
    }

    assertNoRouteCrossesForeignBox(layout);

    // Kantene starter/slutter i riktig port, også når de går inn/ut av eller
    // ligger inni en app-ramme (koordinatene er da relative til rammen).
    for (const e of layout.edges) {
      if (!e.points || !e.sourcePortId || !e.targetPortId) continue;
      const first = e.points[0]!;
      const last = e.points[e.points.length - 1]!;
      const src = portById.get(e.sourcePortId)!;
      const tgt = portById.get(e.targetPortId)!;
      expect(Math.hypot(first.x - src.x, first.y - src.y), `${e.id} start`).toBeLessThan(12);
      expect(Math.hypot(last.x - tgt.x, last.y - tgt.y), `${e.id} slutt`).toBeLessThan(12);
    }

    // App-rammen omslutter sine egne noder og overlapper ingen andre.
    for (const g of layout.groups) {
      for (const n of layout.nodes) {
        const inside = n.x >= g.x && n.y >= g.y && n.x + n.width <= g.x + g.width && n.y + n.height <= g.y + g.height;
        const overlaps = n.x < g.x + g.width && g.x < n.x + n.width && n.y < g.y + g.height && g.y < n.y + n.height;
        if (g.nodeIds.includes(n.id)) expect(inside, `${n.id} skal ligge i ${g.id}`).toBe(true);
        else expect(overlaps, `${n.id} skal ikke overlappe ${g.id}`).toBe(false);
      }
    }
  });
});

describe('computeGraphComplexity', () => {
  it('klassifiserer en liten graf som simple', () => {
    const d = doc([node('a'), node('b')], [edge('e1', 'a', 'b')]);
    expect(computeGraphComplexity(d).tier).toBe('simple');
  });

  it('klassifiserer en graf med høy grad som dense selv om node/edge-antall er lavt', () => {
    const d = doc(
      [node('hub'), node('a'), node('b'), node('c'), node('d'), node('e'), node('f'), node('g')],
      [
        edge('e1', 'hub', 'a'),
        edge('e2', 'hub', 'b'),
        edge('e3', 'hub', 'c'),
        edge('e4', 'hub', 'd'),
        edge('e5', 'hub', 'e'),
        edge('e6', 'hub', 'f'),
        edge('e7', 'hub', 'g'),
      ]
    );
    expect(computeGraphComplexity(d).tier).toBe('dense');
    expect(computeGraphComplexity(d).maxDegree).toBe(7);
  });
});

describe('measureLabelSize', () => {
  it('gir større bredde for lengre tekst', () => {
    const short = measureLabelSize('abc');
    const long = measureLabelSize('en betydelig lengre label-tekst med mange tegn');
    expect(long.width).toBeGreaterThan(short.width);
  });

  it('returnerer alltid positiv bredde/høyde, selv for tom tekst', () => {
    const size = measureLabelSize('');
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });
});

describe('edgeCanvasLabel', () => {
  it('prefikser med stegnummer når satt', () => {
    const e = edge('e1', 'a', 'b', { label: 'gjør noe' });
    expect(edgeCanvasLabel(e, 3)).toBe('3 · gjør noe');
  });

  it('faller tilbake til rå label når steg mangler', () => {
    const e = edge('e1', 'a', 'b', { label: 'gjør noe' });
    expect(edgeCanvasLabel(e, undefined)).toBe('gjør noe');
  });

  it('viser kun stegnummeret når kanten mangler label', () => {
    const e = edge('e1', 'a', 'b');
    expect(edgeCanvasLabel(e, 5)).toBe('5');
  });
});

describe('NODE_WIDTH', () => {
  it('er en positiv konstant brukt av layoutet', () => {
    expect(NODE_WIDTH).toBeGreaterThan(0);
  });
});

describe('wrapLabel', () => {
  it('beholder korte etiketter på én linje', () => {
    expect(wrapLabel('@behov Godkjenning')).toEqual(['@behov Godkjenning']);
  });

  it('bryter lange etiketter over flere linjer uten å miste ord', () => {
    const text = '@event_name overstyr_inntekt_og_refusjon / overstyr_arbeidsforhold / skjønnsmessig_fastsettelse';
    const lines = wrapLabel(text);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join(' ')).toBe(text);
  });

  it('gir en målt bredde som ikke vokser ubegrenset med tekstlengden', () => {
    const size = measureLabelSize('ord '.repeat(60));
    expect(size.width).toBeLessThanOrEqual(LABEL_MAX_TEXT_WIDTH + 20);
    expect(size.height).toBeGreaterThan(measureLabelSize('ord').height);
  });
});

describe('computeSpacing', () => {
  it('holder seg innenfor grensene for både små og svært tette grafer', () => {
    for (const c of [
      { nodeCount: 2, edgeCount: 1, maxDegree: 1 },
      { nodeCount: 30, edgeCount: 120, maxDegree: 40 },
    ]) {
      const p = computeSpacing({ tier: 'dense', ...c });
      expect(p.nodeNodeBetweenLayers).toBeGreaterThanOrEqual(SPACING_LIMITS.betweenLayers.min);
      expect(p.nodeNodeBetweenLayers).toBeLessThanOrEqual(SPACING_LIMITS.betweenLayers.max);
      expect(p.nodeNode).toBeGreaterThanOrEqual(SPACING_LIMITS.nodeNode.min);
      expect(p.nodeNode).toBeLessThanOrEqual(SPACING_LIMITS.nodeNode.max);
    }
  });

  it('gir mer luft til tette grafer enn til enkle', () => {
    const simple = computeSpacing({ tier: 'simple', nodeCount: 3, edgeCount: 2, maxDegree: 1 });
    const dense = computeSpacing({ tier: 'dense', nodeCount: 8, edgeCount: 20, maxDegree: 8 });
    expect(dense.nodeNode).toBeGreaterThan(simple.nodeNode);
    expect(dense.nodeNodeBetweenLayers).toBeGreaterThan(simple.nodeNodeBetweenLayers);
  });
});

describe('adjustSpacingForViewport', () => {
  const base = computeSpacing({ tier: 'medium', nodeCount: 6, edgeCount: 10, maxDegree: 4 });
  const viewport = { width: 1200, height: 800 };

  it('korter ned lagavstanden og bruker ledig høyde når diagrammet er bredt og flatt', () => {
    const p = adjustSpacingForViewport(base, { width: 4000, height: 400 }, viewport, 'RIGHT');
    expect(p.nodeNodeBetweenLayers).toBe(SPACING_LIMITS.betweenLayers.min);
    expect(p.nodeNode).toBeGreaterThanOrEqual(base.nodeNode);
  });

  it('strammer inn avstanden innad i lagene når diagrammet er høyere enn skjermen', () => {
    const p = adjustSpacingForViewport(base, { width: 600, height: 2000 }, viewport, 'RIGHT');
    expect(p.nodeNode).toBe(SPACING_LIMITS.nodeNode.min);
    expect(p.nodeNodeBetweenLayers).toBeGreaterThanOrEqual(base.nodeNodeBetweenLayers);
  });

  it('lar avstandene være uendret når sideforholdet allerede passer', () => {
    expect(adjustSpacingForViewport(base, { width: 1500, height: 1000 }, viewport, 'RIGHT')).toBe(base);
  });

  it('tar hensyn til flytretningen ved DOWN', () => {
    const p = adjustSpacingForViewport(base, { width: 600, height: 3000 }, viewport, 'DOWN');
    expect(p.nodeNodeBetweenLayers).toBe(SPACING_LIMITS.betweenLayers.min);
  });
});

describe('layout av ekte flyter i arkitektur/flows', () => {
  const flowsDir = fileURLToPath(new URL('../../../flows/', import.meta.url));
  const files = readdirSync(flowsDir).filter((f) => f.endsWith('.flow.json'));
  // Etikett (maks bredde + padding) + lagavstand på begge sider + litt
  // rom for kantkanaler. Før beregnet spacing var dette opptil ~1400 px.
  const MAX_COLUMN_GAP = 480;
  const MIN_GAP = 20;

  it.each(files)('%s har verken overlappende bokser eller urimelig store avstander', async (file) => {
    const parsed = parseFlowDocument(JSON.parse(readFileSync(`${flowsDir}${file}`, 'utf8')));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const layout = await layoutFlowDocument(parsed.data, { viewport: { width: 1200, height: 800 } });

    for (const a of layout.nodes) {
      for (const b of layout.nodes) {
        if (a === b) continue;
        const overlapX = a.x < b.x + b.width && b.x < a.x + a.width;
        const overlapY = a.y < b.y + b.height && b.y < a.y + a.height;
        expect(overlapX && overlapY, `${a.id} overlapper ${b.id}`).toBe(false);
        if (overlapY && b.x >= a.x + a.width) expect(b.x - a.x - a.width).toBeGreaterThanOrEqual(MIN_GAP);
        if (overlapX && b.y >= a.y + a.height) expect(b.y - a.y - a.height).toBeGreaterThanOrEqual(MIN_GAP);
      }
    }

    const columns = [...new Set(layout.nodes.map((n) => Math.round(n.x)))].sort((x, y) => x - y);
    for (let i = 1; i < columns.length; i++) {
      expect(columns[i]! - columns[i - 1]! - NODE_WIDTH).toBeLessThanOrEqual(MAX_COLUMN_GAP);
    }

    assertNoRouteCrossesForeignBox(layout);

    // ELK plasserer labelene utenfor boksene, og de skal ligge inntil linjen.
    for (const e of layout.edges) {
      if (!e.labelText || !e.points) continue;
      expect(e.labelBox, `${e.id} mangler labelplassering`).toBeDefined();
      const l = e.labelBox!;
      for (const n of layout.nodes) {
        const overlap = l.x < n.x + n.width && n.x < l.x + l.width && l.y < n.y + n.height && n.y < l.y + l.height;
        expect(overlap, `label på ${e.id} ligger over ${n.id}`).toBe(false);
      }
      expect(labelAnchor(e.points, l)).toEqual({ x: l.x + l.width / 2, y: l.y + l.height / 2 });
    }

    // Kantene starter/slutter i riktig port, også når de går inn/ut av eller
    // ligger inni en app-ramme (koordinatene er da relative til rammen).
    const portById = new Map(layout.nodes.flatMap((n) => n.ports.map((p) => [p.id, p] as const)));
    for (const e of layout.edges) {
      if (!e.points || !e.sourcePortId || !e.targetPortId) continue;
      const first = e.points[0]!;
      const last = e.points[e.points.length - 1]!;
      const src = portById.get(e.sourcePortId)!;
      const tgt = portById.get(e.targetPortId)!;
      expect(Math.hypot(first.x - src.x, first.y - src.y), `${e.id} start`).toBeLessThan(12);
      expect(Math.hypot(last.x - tgt.x, last.y - tgt.y), `${e.id} slutt`).toBeLessThan(12);
    }

    // App-rammen omslutter sine egne noder og overlapper ingen andre.
    for (const g of layout.groups) {
      for (const n of layout.nodes) {
        const inside = n.x >= g.x && n.y >= g.y && n.x + n.width <= g.x + g.width && n.y + n.height <= g.y + g.height;
        const overlaps = n.x < g.x + g.width && g.x < n.x + n.width && n.y < g.y + g.height && g.y < n.y + n.height;
        if (g.nodeIds.includes(n.id)) expect(inside, `${n.id} skal ligge i ${g.id}`).toBe(true);
        else expect(overlaps, `${n.id} skal ikke overlappe ${g.id}`).toBe(false);
      }
    }
  });

  it('tegner app-rammer rundt noder som hører til samme app', async () => {
    const parsed = parseFlowDocument(JSON.parse(readFileSync(`${flowsDir}avviksvurdering-25prosent-flyt.flow.json`, 'utf8')));
    if (!parsed.ok) throw new Error('ugyldig flyt');
    const layout = await layoutFlowDocument(parsed.data);
    expect(layout.groups.map((g) => g.label)).toEqual(['Spinnvill']);
    expect(layout.groups[0]!.nodeIds).toContain('spinnvill');
  });
});

describe('portSideFromGeometry', () => {
  const box = { width: 240, height: 100 };
  it('finner siden porten ligger på (ELK legger porter rett utenfor kanten)', () => {
    expect(portSideFromGeometry({ x: -6, y: 40, width: 6, height: 6 }, box)).toBe('WEST');
    expect(portSideFromGeometry({ x: 240, y: 40, width: 6, height: 6 }, box)).toBe('EAST');
    expect(portSideFromGeometry({ x: 100, y: -6, width: 6, height: 6 }, box)).toBe('NORTH');
    expect(portSideFromGeometry({ x: 100, y: 100, width: 6, height: 6 }, box)).toBe('SOUTH');
  });
});
