import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled.js';
import type { FlowDocument, FlowEdge, FlowNode } from '../schema/flow';
import { computeEdgeSteps } from '../lib/flowSteps';
import { CYLINDER_EXTRA_HEIGHT } from '../lib/cylinder';
import { resolveAppGroups, type AppGroup } from '../lib/appGroups';

const elk = new ELK();

export const NODE_WIDTH = 240;
const BASE_NODE_HEIGHT = 66; // header + label, ingen summary
const SUMMARY_LINE_HEIGHT = 15;
const CHARS_PER_LINE = 34; // grov tilnærming for NODE_WIDTH ved 11px tekst
const DECISION_CHARS_PER_LINE = 29;

export function estimateNodeHeight(node: FlowNode): number {
  const extra = node.type === 'database' ? CYLINDER_EXTRA_HEIGHT : 0;
  if (!node.summary) return BASE_NODE_HEIGHT + extra;
  const charsPerLine = node.type === 'decision' ? DECISION_CHARS_PER_LINE : CHARS_PER_LINE;
  const lines = Math.max(1, Math.ceil(node.summary.length / charsPerLine));
  return BASE_NODE_HEIGHT + lines * SUMMARY_LINE_HEIGHT + extra;
}

const LABEL_FONT_SIZE = 11;
const LABEL_FONT_WEIGHT = 500;
const LABEL_FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const LABEL_PADDING_X = 8; // ~ labelBgPadding [4,2] * 2 sider + litt slark
const LABEL_PADDING_Y = 6;
const LABEL_LINE_HEIGHT = 14;
const LABEL_FALLBACK_CHAR_WIDTH = 6.2; // brukt når `canvas` ikke er tilgjengelig (SSR/tester)

export const LABEL_MAX_TEXT_WIDTH = 160;

let measureCanvas: HTMLCanvasElement | null = null;

function measureTextWidth(text: string): number {
  if (typeof document !== 'undefined') {
    try {
      if (!measureCanvas) measureCanvas = document.createElement('canvas');
      const ctx = measureCanvas.getContext('2d');
      if (ctx) {
        ctx.font = `${LABEL_FONT_WEIGHT} ${LABEL_FONT_SIZE}px ${LABEL_FONT_FAMILY}`;
        return ctx.measureText(text).width;
      }
    } catch {
      // Faller igjennom til tilnærmingen under.
    }
  }
  return text.length * LABEL_FALLBACK_CHAR_WIDTH;
}

export function wrapLabel(text: string, maxWidth = LABEL_MAX_TEXT_WIDTH): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [text];
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && measureTextWidth(candidate) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function measureLabelSize(text: string): { width: number; height: number } {
  const lines = wrapLabel(text);
  const width = Math.max(0, ...lines.map(measureTextWidth));
  return {
    width: Math.ceil(width) + LABEL_PADDING_X,
    height: lines.length * LABEL_LINE_HEIGHT + LABEL_PADDING_Y,
  };
}

export function edgeCanvasLabel(edge: FlowEdge, step: number | undefined): string | undefined {
  if (step === undefined) return edge.label;
  return edge.label ? `${step} · ${edge.label}` : `${step}`;
}

export interface SpacingProfile {
  nodeNodeBetweenLayers: number;
  nodeNode: number;
  edgeNode: number;
  edgeEdge: number;
  edgeNodeBetweenLayers: number;
  edgeEdgeBetweenLayers: number;
  edgeLabel: number;
  labelLabel: number;
  thoroughness: number;
  highDegreeThreshold: number;
  componentComponent: number;
}

export interface Viewport {
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export const SPACING_LIMITS = {
  betweenLayers: { min: 40, max: 90 },
  nodeNode: { min: 36, max: 90 },
} as const;

export function computeSpacing(complexity: GraphComplexity): SpacingProfile {
  const { nodeCount, edgeCount, maxDegree } = complexity;
  const density = nodeCount === 0 ? 0 : edgeCount / nodeCount; // typisk 1-3
  const degree = Math.min(maxDegree, 10);

  const nodeNodeBetweenLayers = clamp(44 + degree * 3, SPACING_LIMITS.betweenLayers.min, SPACING_LIMITS.betweenLayers.max);
  const nodeNode = clamp(40 + density * 8 + degree * 2, SPACING_LIMITS.nodeNode.min, SPACING_LIMITS.nodeNode.max);
  const edgeNode = clamp(Math.round(nodeNode * 0.45), 18, 40);
  const edgeEdge = clamp(Math.round(nodeNode * 0.3), 12, 28);

  return {
    nodeNodeBetweenLayers: Math.round(nodeNodeBetweenLayers),
    nodeNode: Math.round(nodeNode),
    edgeNode,
    edgeEdge,
    edgeNodeBetweenLayers: clamp(Math.round(nodeNodeBetweenLayers * 0.4), 16, 32),
    edgeEdgeBetweenLayers: clamp(Math.round(nodeNodeBetweenLayers * 0.25), 10, 20),
    edgeLabel: 6,
    labelLabel: 6,
    thoroughness: clamp(10 + edgeCount * 2, 10, 60),
    highDegreeThreshold: maxDegree >= 6 ? 4 : 5,
    componentComponent: Math.round(nodeNode * 1.2),
  };
}

export function adjustSpacingForViewport(
  profile: SpacingProfile,
  bbox: { width: number; height: number },
  viewport: Viewport,
  direction: 'RIGHT' | 'DOWN'
): SpacingProfile {
  if (bbox.width <= 0 || bbox.height <= 0 || viewport.width <= 0 || viewport.height <= 0) return profile;

  const along = direction === 'RIGHT' ? bbox.width : bbox.height;
  const across = direction === 'RIGHT' ? bbox.height : bbox.width;
  const viewAlong = direction === 'RIGHT' ? viewport.width : viewport.height;
  const viewAcross = direction === 'RIGHT' ? viewport.height : viewport.width;
  // > 1: diagrammet er relativt lengre i flytretningen enn lerretet.
  const stretch = along / across / (viewAlong / viewAcross);
  const TOLERANCE = 1.25;

  if (stretch > TOLERANCE) {
    // Hvor mye ledig plass på tvers finnes (når diagrammet skaleres til å
    // passe i flytretningen)? Bruk en del av den til luft innad i lagene.
    const spareFactor = Math.min(stretch / TOLERANCE, 2);
    return {
      ...profile,
      nodeNodeBetweenLayers: SPACING_LIMITS.betweenLayers.min,
      edgeNodeBetweenLayers: Math.min(profile.edgeNodeBetweenLayers, 16),
      edgeEdgeBetweenLayers: Math.min(profile.edgeEdgeBetweenLayers, 10),
      nodeNode: Math.round(clamp(profile.nodeNode * spareFactor, SPACING_LIMITS.nodeNode.min, SPACING_LIMITS.nodeNode.max)),
    };
  }
  if (stretch < 1 / TOLERANCE) {
    const spareFactor = Math.min(1 / stretch / TOLERANCE, 2);
    return {
      ...profile,
      nodeNode: SPACING_LIMITS.nodeNode.min,
      edgeNode: Math.min(profile.edgeNode, 18),
      edgeEdge: Math.min(profile.edgeEdge, 12),
      nodeNodeBetweenLayers: Math.round(
        clamp(profile.nodeNodeBetweenLayers * spareFactor, SPACING_LIMITS.betweenLayers.min, SPACING_LIMITS.betweenLayers.max)
      ),
    };
  }
  return profile;
}

export type ComplexityTier = 'simple' | 'medium' | 'dense';

export interface GraphComplexity {
  tier: ComplexityTier;
  nodeCount: number;
  edgeCount: number;
  maxDegree: number;
}

export function computeGraphComplexity(doc: FlowDocument): GraphComplexity {
  const nodeCount = doc.nodes.length;
  const edgeCount = doc.edges.length;
  const degree = new Map<string, number>();
  for (const edge of doc.edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }
  const maxDegree = degree.size === 0 ? 0 : Math.max(...degree.values());

  let tier: ComplexityTier;
  if (nodeCount <= 4 && edgeCount <= 4 && maxDegree <= 2) {
    tier = 'simple';
  } else if (nodeCount <= 10 && edgeCount <= 16 && maxDegree <= 6) {
    tier = 'medium';
  } else {
    tier = 'dense';
  }
  return { tier, nodeCount, edgeCount, maxDegree };
}

function detectFeedbackEdgeIds(doc: FlowDocument): Set<string> {
  const outgoing = new Map<string, { edgeId: string; target: string }[]>();
  for (const node of doc.nodes) outgoing.set(node.id, []);
  const directPairs = new Set<string>(); // "source|target" for alle kanter
  for (const edge of doc.edges) {
    if (edge.source === edge.target) continue; // selvreferanser er ikke "feedback"
    outgoing.get(edge.source)?.push({ edgeId: edge.id, target: edge.target });
    directPairs.add(`${edge.source}|${edge.target}`);
  }

  const UNVISITED = 0;
  const IN_STACK = 1;
  const DONE = 2;
  const state = new Map<string, 0 | 1 | 2>();
  const feedback = new Set<string>();

  function dfs(nodeId: string): void {
    state.set(nodeId, IN_STACK);
    for (const { edgeId, target } of outgoing.get(nodeId) ?? []) {
      const targetState = state.get(target) ?? UNVISITED;
      if (targetState === IN_STACK) {
        // Hopp over rene request/response-par (motsatt kant finnes mellom
        // nøyaktig samme to noder) — se forklaring i docblock over.
        const isDirectResponsePair = directPairs.has(`${target}|${nodeId}`);
        if (!isDirectResponsePair) feedback.add(edgeId);
      } else if (targetState === UNVISITED) {
        dfs(target);
      }
    }
    state.set(nodeId, DONE);
  }

  for (const node of doc.nodes) {
    if ((state.get(node.id) ?? UNVISITED) === UNVISITED) dfs(node.id);
  }
  return feedback;
}

export type PortSide = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';

const PORT_SIZE = 6;

export function portSideFromGeometry(
  port: { x: number; y: number; width: number; height: number },
  node: { width: number; height: number }
): PortSide {
  const cx = port.x + port.width / 2;
  const cy = port.y + port.height / 2;
  const distances: [PortSide, number][] = [
    ['WEST', Math.abs(cx)],
    ['EAST', Math.abs(cx - node.width)],
    ['NORTH', Math.abs(cy)],
    ['SOUTH', Math.abs(cy - node.height)],
  ];
  return distances.reduce((best, d) => (d[1] < best[1] ? d : best))[0];
}

export interface XY {
  x: number;
  y: number;
}

export interface LaidOutPort {
  id: string;
  x: number;
  y: number;
  side: PortSide;
}

export interface LaidOutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  node: FlowNode;
  ports: LaidOutPort[];
}

export interface LaidOutEdge {
  id: string;
  edge: FlowEdge;
  points?: XY[];
  sourcePortId?: string;
  targetPortId?: string;
  labelText?: string;
  labelBox?: { x: number; y: number; width: number; height: number };
  isFeedback: boolean;
}

export interface LaidOutGroup extends AppGroup {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutResult {
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
  groups: LaidOutGroup[];
  complexity: GraphComplexity;
}

export const GROUP_PADDING = { top: 30, left: 14, right: 14, bottom: 14 } as const;

interface ElkPortLayout {
  id: string;
  x?: number;
  y?: number;
  layoutOptions?: Record<string, string>;
}
interface ElkNodeLayout {
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  ports?: ElkPortLayout[];
  children?: ElkNodeLayout[];
}
interface ElkEdgeSection {
  startPoint: XY;
  bendPoints?: XY[];
  endPoint: XY;
}
interface ElkEdgeLayout {
  id: string;
  /** Id-en til noden kantens koordinater er relative til (root eller en
   * gruppe). */
  container?: string;
  sections?: ElkEdgeSection[];
  labels?: { x?: number; y?: number; width?: number; height?: number }[];
}
interface ElkGraphLayout {
  children?: ElkNodeLayout[];
  edges?: ElkEdgeLayout[];
}

export interface LayoutOptions {
  /** Størrelsen på lerretet diagrammet skal vises i. Brukes til å tilpasse
   * avstandene til tilgjengelig plass (se `adjustSpacingForViewport`). */
  viewport?: Viewport;
}

export async function layoutFlowDocument(doc: FlowDocument, options: LayoutOptions = {}): Promise<LayoutResult> {
  const elkDirection = doc.direction === 'DOWN' ? 'DOWN' : 'RIGHT';
  const complexity = computeGraphComplexity(doc);
  const baseProfile = computeSpacing(complexity);

  const first = await runLayout(doc, baseProfile, complexity);
  if (!options.viewport || first.nodes.length === 0) return first;

  const bbox = boundingBox(first.nodes);
  const adjusted = adjustSpacingForViewport(baseProfile, bbox, options.viewport, elkDirection);
  if (adjusted === baseProfile) return first;
  return runLayout(doc, adjusted, complexity);
}

function boundingBox(nodes: LaidOutNode[]): { width: number; height: number } {
  const minX = Math.min(...nodes.map((n) => n.x));
  const minY = Math.min(...nodes.map((n) => n.y));
  const maxX = Math.max(...nodes.map((n) => n.x + n.width));
  const maxY = Math.max(...nodes.map((n) => n.y + n.height));
  return { width: maxX - minX, height: maxY - minY };
}

async function runLayout(
  doc: FlowDocument,
  profile: SpacingProfile,
  complexity: GraphComplexity
): Promise<LayoutResult> {
  const elkDirection = doc.direction === 'DOWN' ? 'DOWN' : 'RIGHT';
  const appGroups = resolveAppGroups(doc);
  const groupIdByNodeId = new Map<string, string>();
  for (const group of appGroups) for (const nodeId of group.nodeIds) groupIdByNodeId.set(nodeId, group.id);

  const feedbackEdgeIds = detectFeedbackEdgeIds(doc);
  const edgeSteps = computeEdgeSteps(doc);

  const sourcePortId = (edgeId: string) => `${edgeId}__src`;
  const targetPortId = (edgeId: string) => `${edgeId}__tgt`;

  const portsByNode = new Map<string, string[]>();
  for (const node of doc.nodes) portsByNode.set(node.id, []);
  for (const edge of doc.edges) {
    if (edge.source === edge.target) continue;
    portsByNode.get(edge.source)?.push(sourcePortId(edge.id));
    portsByNode.get(edge.target)?.push(targetPortId(edge.id));
  }

  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': elkDirection,
      'elk.layered.spacing.nodeNodeBetweenLayers': String(profile.nodeNodeBetweenLayers),
      'elk.spacing.nodeNode': String(profile.nodeNode),
      'elk.spacing.edgeNode': String(profile.edgeNode),
      'elk.spacing.edgeEdge': String(profile.edgeEdge),
      'elk.layered.spacing.edgeNodeBetweenLayers': String(profile.edgeNodeBetweenLayers),
      'elk.layered.spacing.edgeEdgeBetweenLayers': String(profile.edgeEdgeBetweenLayers),
      'elk.spacing.edgeLabel': String(profile.edgeLabel),
      'elk.spacing.labelLabel': String(profile.labelLabel),
      'elk.spacing.componentComponent': String(profile.componentComponent),
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.thoroughness': String(profile.thoroughness),
      'elk.layered.mergeEdges': 'false',
      'elk.edgeLabels.placement': 'CENTER',
      'elk.layered.edgeLabels.centerLabelPlacementStrategy': 'MEDIAN_LAYER',
      'elk.layered.feedbackEdges': 'true',
      'elk.portAlignment.default': 'DISTRIBUTED',
      'elk.separateConnectedComponents': 'true',
      'elk.layered.highDegreeNodes.treatment': 'true',
      'elk.layered.highDegreeNodes.threshold': String(profile.highDegreeThreshold),
    },
    children: [] as ElkNode[],
  };

  const elkNodes = doc.nodes.map((node) => ({
      id: node.id,
      width: NODE_WIDTH,
      height: estimateNodeHeight(node),
      // FREE: ELK velger både side og rekkefølge for hver port. Å låse
      // sidene (databaser over/under, tilbakekanter på toppen) ga mange
      // flere kryssende linjer enn å la ELK bestemme.
      layoutOptions: { 'elk.portConstraints': 'FREE' },
      ports: (portsByNode.get(node.id) ?? []).map((id) => ({ id, width: PORT_SIZE, height: PORT_SIZE })),
    }));
  const elkNodeById = new Map(elkNodes.map((n) => [n.id, n]));
  elkGraph.children = [
    ...elkNodes.filter((n) => !groupIdByNodeId.has(n.id)),
    ...appGroups.map((group) => ({
      id: group.id,
      layoutOptions: {
        'elk.padding': `[top=${GROUP_PADDING.top},left=${GROUP_PADDING.left},bottom=${GROUP_PADDING.bottom},right=${GROUP_PADDING.right}]`,
      },
      children: group.nodeIds.map((id) => elkNodeById.get(id)).filter((n) => n !== undefined),
    })),
  ];
  if (appGroups.length > 0) {
    // Kanter mellom noder i ulike grupper (eller inn/ut av en gruppe) rutes
    // av ELK på tvers av hierarkiet i én og samme layout.
    (elkGraph.layoutOptions as Record<string, string>)['elk.hierarchyHandling'] = 'INCLUDE_CHILDREN';
  }

  const elkGraphWithEdges = {
    ...elkGraph,
    edges: doc.edges.map((edge) => {
      const labelText = edgeCanvasLabel(edge, edgeSteps.get(edge.id));
      const labels = labelText
        ? [{ text: labelText, ...measureLabelSize(labelText) }]
        : undefined;
      if (edge.source === edge.target) {
        // Selvreferanser: ingen porter (ELKs layered-algoritme ruter uansett
        // ikke disse via `sections` — se fallback i `ElkRoutedEdge`).
        return { id: edge.id, sources: [edge.source], targets: [edge.target], labels };
      }
      return {
        id: edge.id,
        sources: [sourcePortId(edge.id)],
        targets: [targetPortId(edge.id)],
        labels,
      };
    }),
  };

  let laidOut: ElkGraphLayout;
  try {
    laidOut = (await elk.layout(elkGraphWithEdges)) as ElkGraphLayout;
  } catch {
    const { ['elk.layered.compaction.postCompaction.strategy']: _omitted, ...withoutCompaction } = elkGraphWithEdges.layoutOptions;
    laidOut = (await elk.layout({ ...elkGraphWithEdges, layoutOptions: withoutCompaction })) as ElkGraphLayout;
  }

  const nodesById = new Map(doc.nodes.map((n) => [n.id, n]));
  const containerOffset = new Map<string, XY>([['root', { x: 0, y: 0 }]]);
  const groupsById = new Map(appGroups.map((g) => [g.id, g]));
  const groups: LaidOutGroup[] = [];
  const flatChildren: { child: ElkNodeLayout; offset: XY }[] = [];
  for (const child of laidOut.children ?? []) {
    const group = groupsById.get(child.id);
    if (!group) {
      flatChildren.push({ child, offset: { x: 0, y: 0 } });
      continue;
    }
    const offset = { x: child.x ?? 0, y: child.y ?? 0 };
    containerOffset.set(child.id, offset);
    groups.push({ ...group, ...offset, width: child.width ?? 0, height: child.height ?? 0 });
    for (const member of child.children ?? []) flatChildren.push({ child: member, offset });
  }

  const nodes: LaidOutNode[] = flatChildren.map(({ child, offset }) => {
    const node = nodesById.get(child.id);
    if (!node) {
      throw new Error(`ELK returnerte ukjent node-id: ${child.id}`);
    }
    const x = offset.x + (child.x ?? 0);
    const y = offset.y + (child.y ?? 0);
    const ports: LaidOutPort[] = (child.ports ?? []).map((port) => ({
      id: port.id,
      x: x + (port.x ?? 0),
      y: y + (port.y ?? 0),
      side: portSideFromGeometry(
        { x: port.x ?? 0, y: port.y ?? 0, width: PORT_SIZE, height: PORT_SIZE },
        { width: child.width ?? NODE_WIDTH, height: child.height ?? estimateNodeHeight(node) }
      ),
    }));
    return {
      id: child.id,
      x,
      y,
      width: child.width ?? NODE_WIDTH,
      height: child.height ?? estimateNodeHeight(node),
      node,
      ports,
    };
  });

  const elkEdgesById = new Map((laidOut.edges ?? []).map((e) => [e.id, e]));

  const edgesById = new Map(doc.edges.map((e) => [e.id, e]));
  const edges: LaidOutEdge[] = doc.edges.map((edge) => {
    const found = edgesById.get(edge.id);
    if (!found) {
      throw new Error(`Ukjent edge-id under layout: ${edge.id}`);
    }
    const elkEdge = elkEdgesById.get(edge.id);
    const section = elkEdge?.sections?.[0];
    const offset = containerOffset.get(elkEdge?.container ?? 'root') ?? { x: 0, y: 0 };
    const points: XY[] | undefined = section
      ? [section.startPoint, ...(section.bendPoints ?? []), section.endPoint].map((p) => ({
          x: p.x + offset.x,
          y: p.y + offset.y,
        }))
      : undefined;
    const elkLabel = elkEdge?.labels?.[0];
    const labelBox =
      elkLabel && elkLabel.x !== undefined && elkLabel.y !== undefined
        ? { x: elkLabel.x + offset.x, y: elkLabel.y + offset.y, width: elkLabel.width ?? 0, height: elkLabel.height ?? 0 }
        : undefined;
    return {
      id: edge.id,
      edge: found,
      points,
      labelBox,
      sourcePortId: edge.source === edge.target ? undefined : sourcePortId(edge.id),
      targetPortId: edge.source === edge.target ? undefined : targetPortId(edge.id),
      labelText: edgeCanvasLabel(edge, edgeSteps.get(edge.id)),
      isFeedback: feedbackEdgeIds.has(edge.id),
    };
  });

  // Behold dokumentets node-rekkefølge (gruppering endrer ELKs rekkefølge).
  const nodeOrder = new Map(doc.nodes.map((n, i) => [n.id, i]));
  nodes.sort((a, b) => (nodeOrder.get(a.id) ?? 0) - (nodeOrder.get(b.id) ?? 0));

  return { nodes, edges, groups, complexity };
}
