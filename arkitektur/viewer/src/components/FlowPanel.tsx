import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  reconnectEdge,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type ReactFlowInstance,
  MarkerType,
  Panel,
  ConnectionMode,
} from '@xyflow/react';
import { parseFlowDocument, type FlowDocument, type FlowEdge, type FlowNode } from '../schema/flow';
import { GROUP_PADDING, layoutFlowDocument, type XY } from '../layout/elkLayout';
import type { AppGroup } from '../lib/appGroups';
import { AppGroupFrame } from './AppGroupFrame';
import { FlowNodeCard, type FlowNodeData, type NodePort } from './FlowNodeCard';
import { ElkRoutedEdge } from './ElkRoutedEdge';
import { ExplanationPanel } from './ExplanationPanel';
import { Legend } from './Legend';
import { EDGE_TYPE_COLOR } from '../styles/edgeTypeStyles';
import { avoidBoxes, crossesAnyRealBox, type AvoidBox } from '../lib/boxAvoidance';
import { isConnectionFree, isHandleOccupied } from '../lib/handleOccupancy';
import {
  SIDES,
  computeFreeSlots,
  pickBestPointOnSide,
  sideOfFreeSlotId,
  sidePointPosition,
  type SidePoint,
} from '../lib/freeSlots';
import { hasDatabaseNodes, withoutDatabases } from '../lib/docFilter';
import {
  DRAFT_COLOR,
  DRAFT_NODE_SIZE,
  isDraftId,
  loadDrafts,
  newDraftId,
  saveDrafts,
  notifyDraftsChanged,
  DRAFTS_CHANGED_EVENT,
  type DraftsChangedDetail,
  type DraftEdge,
  type DraftNode,
} from '../lib/drafts';
import { DraftNodeCard, type DraftNodeData } from './DraftNodeCard';

/** Alle tilkoblingspunkter (ELK-porter + ledige punkter) på en node. */
function pointsOf(node: Node | undefined): SidePoint[] {
  if (!node) return [];
  const data = node.data as { ports?: SidePoint[]; freeSlots?: SidePoint[] };
  return [...(data.ports ?? []), ...(data.freeSlots ?? [])];
}

function handlePosition(
  node: Node | undefined,
  size: { width: number; height: number } | undefined,
  handleId: string | null | undefined
): XY | undefined {
  if (!node || !size) return undefined;
  const box = { ...node.position, ...size };
  const point = pointsOf(node).find((p) => p.id === handleId);
  return point ? sidePointPosition(box, point) : { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/**
 * Når et kant-endepunkt slippes på en side av en boks, flyttes det til det
 * ledige punktet på DEN siden som ligger nærmest kantens andre ende. Da blir
 * linjen så rett som mulig, og kanter ut av samme side ligger i samme
 * rekkefølge som målene sine (ingen unødvendige kryssinger).
 */
function snapToBestPoint(
  dropped: Connection,
  movingEnd: 'source' | 'target',
  ignoreEdgeId: string | null,
  edges: Edge[],
  nodes: Node[],
  sizes: Map<string, { width: number; height: number }>
): Connection {
  const movedSource = movingEnd === 'source';
  const nodeId = movedSource ? dropped.source : dropped.target;
  const handleId = movedSource ? dropped.sourceHandle : dropped.targetHandle;
  const otherNodeId = movedSource ? dropped.target : dropped.source;
  const otherHandleId = movedSource ? dropped.targetHandle : dropped.sourceHandle;
  if (nodeId === otherNodeId) return dropped;

  const node = nodes.find((n) => n.id === nodeId);
  const size = sizes.get(nodeId);
  const droppedPoint = pointsOf(node).find((p) => p.id === handleId);
  const otherEnd = handlePosition(
    nodes.find((n) => n.id === otherNodeId),
    sizes.get(otherNodeId),
    otherHandleId
  );
  if (!node || !size || !droppedPoint || !otherEnd) return dropped;

  const best = pickBestPointOnSide(pointsOf(node), droppedPoint.side, { ...node.position, ...size }, otherEnd, (id) =>
    isHandleOccupied(edges, nodeId, id, ignoreEdgeId)
  );
  if (!best) return dropped;
  return movedSource ? { ...dropped, sourceHandle: best.id } : { ...dropped, targetHandle: best.id };
}

/** Selv-handlene finnes bare som én type (kilde ELLER mål) og er kun ment
 * for selvreferanser. */
function usesSelfHandleWrongly(connection: Connection, movingEnd: 'source' | 'target'): boolean {
  if (connection.source === connection.target) return false;
  const handle = movingEnd === 'source' ? connection.sourceHandle : connection.targetHandle;
  return handle === 'self-source' || handle === 'self-target';
}

/**
 * Finner punktet en forslag-kobling skal tegnes fra/til. Lagrede punkter
 * kan forsvinne ved ny layout (f.eks. når en ELK-port dukker opp oppå et
 * ledig punkt etter database-bryteren). Da velges nærmeste ledige punkt på
 * samme side — eller, om siden er ukjent, punktet nærmest den andre enden.
 */
function resolveDraftHandle(
  node: Node | undefined,
  size: { width: number; height: number } | undefined,
  handleId: string | null | undefined,
  otherEnd: XY | undefined,
  isOccupied: (id: string) => boolean
): string | null | undefined {
  const points = pointsOf(node);
  if (!node || !size || !otherEnd || points.some((p) => p.id === handleId)) return handleId;
  const box = { ...node.position, ...size };
  const side = sideOfFreeSlotId(handleId);
  const sides = side ? [side] : SIDES;
  let best: SidePoint | undefined;
  let bestDist = Infinity;
  for (const candidateSide of sides) {
    const p = pickBestPointOnSide(points, candidateSide, box, otherEnd, isOccupied);
    if (!p) continue;
    const pos = sidePointPosition(box, p);
    const d = Math.hypot(pos.x - otherEnd.x, pos.y - otherEnd.y);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best?.id ?? handleId;
}

function toDraftRfNode(draft: DraftNode, startEditing = false): Node<DraftNodeData> {
  return {
    id: draft.id,
    type: 'draftNode',
    position: { x: draft.x, y: draft.y },
    data: { draft, freeSlots: computeFreeSlots([], DRAFT_NODE_SIZE.width, DRAFT_NODE_SIZE.height), startEditing },
    style: { ...DRAFT_NODE_SIZE },
  };
}

function toDraftRfEdge(draft: DraftEdge): Edge {
  return {
    id: draft.id,
    source: draft.source,
    target: draft.target,
    sourceHandle: draft.sourceHandle,
    targetHandle: draft.targetHandle,
    type: 'elkRouted',
    label: draft.label || undefined,
    data: { draft: true },
    style: { stroke: DRAFT_COLOR, strokeWidth: 2, strokeDasharray: '8 4' },
    labelStyle: { fontSize: 11, fill: '#3b0764', fontWeight: 600 },
    labelBgStyle: { fill: '#f3e8ff', fillOpacity: 0.95 },
    labelBgPadding: [4, 2],
    labelBgBorderRadius: 4,
    markerEnd: { type: MarkerType.ArrowClosed, color: DRAFT_COLOR },
  };
}

function Switch({
  label,
  checked,
  onToggle,
  color,
  style,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  color: string;
  style?: React.CSSProperties;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', cursor: 'pointer', ...style }}>
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        style={{
          position: 'relative',
          width: 36,
          height: 20,
          borderRadius: 10,
          border: 'none',
          padding: 0,
          background: checked ? color : '#cbd5e1',
          cursor: 'pointer',
          transition: 'background 150ms ease',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            transition: 'left 150ms ease',
          }}
        />
      </button>
    </label>
  );
}

const draftButtonStyle: React.CSSProperties = {
  fontSize: 12,
  padding: '4px 10px',
  borderRadius: 6,
  border: `1px solid ${DRAFT_COLOR}`,
  background: DRAFT_COLOR,
  color: '#ffffff',
  cursor: 'pointer',
  fontWeight: 600,
};

type Selection =
  | { kind: 'node'; item: FlowNode }
  | { kind: 'edge'; item: FlowEdge }
  | null;

/**
 * Selvstendig diagram-panel: filvelger + React Flow-canvas + forklaringspanel
 * for ÉN flyt. Flere instanser av denne komponenten kan vises samtidig på
 * siden (se App.tsx "sammenlign to flyter"-modus), hver med sitt eget
 * filvalg og sin egen uavhengige state — de påvirker ikke hverandre.
 */
export function FlowPanel({
  files,
  defaultFile,
  title,
}: {
  files: string[];
  defaultFile?: string;
  title?: string;
}) {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [rawDoc, setDoc] = useState<FlowDocument | null>(null);
  // Av/på for visning av databaser og koblingene deres. Når de skjules,
  // beregnes layouten på nytt uten dem, så det ikke blir stående tomme hull.
  const [showDatabases, setShowDatabases] = useState(true);
  const doc = useMemo(
    () => (rawDoc && !showDatabases ? withoutDatabases(rawDoc) : rawDoc),
    [rawDoc, showDatabases]
  );
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node<FlowNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  // Ingen to kanter skal kunne dele samme tilkoblingspunkt. Under en
  // reconnect-drag husker vi hvilken kant som flyttes, slik at dens eget
  // (nåværende) punkt ikke regnes som opptatt, og viser de ledige punktene.
  const reconnectingEdgeIdRef = useRef<string | null>(null);
  // Hvilken ende av kanten som dras. React Flow oppgir typen til den
  // MOTSATTE (faste) enden i onReconnectStart.
  const reconnectingEndRef = useRef<'source' | 'target' | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [groups, setGroups] = useState<AppGroup[]>([]);
  // Forslag (bokser/koblinger tegnet av brukeren, finnes ikke i dag). Lever
  // separat fra flyten slik at ny layout (f.eks. database-bryteren) ikke
  // fjerner dem, og lagres per flytfil i nettleseren.
  const [drawMode, setDrawMode] = useState(false);
  const [draftNodes, setDraftNodes] = useState<Node<DraftNodeData>[]>([]);
  const [draftEdges, setDraftEdges] = useState<Edge[]>([]);
  const loadedDraftFileRef = useRef<string | null>(null);
  // `selection` styrer hvilken forklaring som vises i panelet, og settes
  // KUN ved klikk i selve diagrammet. `focusedEdge` settes ved klikk i
  // kant-listene i panelet, og fremhever kanten i diagrammet uten å bytte
  // forklaringen.
  const [selection, setSelection] = useState<Selection>(null);
  const [focusedEdge, setFocusedEdge] = useState<FlowEdge | null>(null);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // Node-posisjonene slik ELK sist beregnet dem (før eventuell manuell
  // dra-og-slipp av brukeren). Brukes til å regne ut hvor mye en node har
  // flyttet seg siden ELKs rute ble tegnet, slik at tilhørende kant-linjer
  // (som ellers ville stått igjen på sin opprinnelige, nå utdaterte plass)
  // kan følge med boksen i sanntid — se `displayEdges` under.
  const layoutPositionsRef = useRef<Map<string, XY>>(new Map());

  // Størrelsen (bredde/høyde) hver node fikk av ELK — endres ikke ved
  // manuell dra-og-slipp (kun posisjonen gjør), så denne trenger ikke
  // oppdateres på nytt for hvert render. Brukes sammen med nodens LIVE
  // posisjon (fra React Flow-state) til å bygge boks-hindringer for
  // `avoidBoxes` i `displayEdges` under.
  const nodeSizeRef = useRef<Map<string, { width: number; height: number }>>(new Map());

  const canvasRef = useRef<HTMLDivElement | null>(null);


  // Sett initielt filvalg når fil-listen kommer inn, eller når et ønsket
  // standardvalg (defaultFile) faktisk finnes blant de tilgjengelige filene.
  useEffect(() => {
    if (selectedFile) return;
    if (files.length === 0) return;
    const preferred = defaultFile && files.includes(defaultFile) ? defaultFile : files[0];
    setSelectedFile(preferred ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, defaultFile]);

  useEffect(() => {
    if (!selectedFile) {
      setDoc(null);
      setSelection(null);
      setFocusedEdge(null);
      setError(null);
      return;
    }

    // Nullstill visningen med en gang et nytt filvalg starter, slik at et
    // tidligere diagram aldri blir stående igjen på skjermen mens en annen
    // fil lastes eller feiler.
    setDoc(null);
    setSelection(null);
    setFocusedEdge(null);
    setError(null);

    // AbortController + cancelled-flagg sikrer at et svar fra en tidligere,
    // fortsatt utestående request ikke kan overskrive state for filen
    // brukeren faktisk har valgt nå (race ved raskt filbytte).
    const controller = new AbortController();
    let cancelled = false;

    fetch(`/api/flow/${encodeURIComponent(selectedFile)}`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Kunne ikke hente ${selectedFile} (HTTP ${r.status})`);
        }
        return r.json();
      })
      .then((raw) => {
        if (cancelled) return;
        const result = parseFlowDocument(raw);
        if (!result.ok) {
          setDoc(null);
          setError(
            result.errors
              .map((e) => `${e.path.join('.')}: ${e.message}`)
              .join('\n')
          );
          return;
        }
        setDoc(result.data);
      })
      .catch((e) => {
        if (cancelled || (e instanceof Error && e.name === 'AbortError')) return;
        setDoc(null);
        setError(String(e));
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selectedFile]);

  const panelIdRef = useRef(newDraftId('node'));
  const reloadDrafts = useCallback((file: string) => {
    const drafts = file ? loadDrafts(file) : { nodes: [], edges: [] };
    setDraftNodes(drafts.nodes.map((d) => toDraftRfNode(d)));
    setDraftEdges(drafts.edges.map(toDraftRfEdge));
  }, []);

  useEffect(() => {
    loadedDraftFileRef.current = selectedFile || null;
    reloadDrafts(selectedFile);
  }, [selectedFile, reloadDrafts]);

  // Viser to paneler samme flyt (sammenligningsmodus), holdes forslagene i
  // synk i stedet for at panelene overskriver hverandres endringer.
  useEffect(() => {
    const onChanged = (event: Event) => {
      const detail = (event as CustomEvent<DraftsChangedDetail>).detail;
      if (!detail || detail.sourceId === panelIdRef.current) return;
      if (detail.file === loadedDraftFileRef.current) reloadDrafts(detail.file);
    };
    window.addEventListener(DRAFTS_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(DRAFTS_CHANGED_EVENT, onChanged);
  }, [reloadDrafts]);

  useEffect(() => {
    const file = loadedDraftFileRef.current;
    if (!file) return;
    const changed = saveDrafts(file, {
      nodes: draftNodes.map((n) => ({ ...n.data.draft, x: n.position.x, y: n.position.y })),
      edges: draftEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? null,
        targetHandle: e.targetHandle ?? null,
        label: typeof e.label === 'string' ? e.label : '',
      })),
    });
    if (changed) notifyDraftsChanged({ file, sourceId: panelIdRef.current });
  }, [draftNodes, draftEdges]);

  useEffect(() => {
    if (!doc) {
      setNodes([]);
      setEdges([]);
      setGroups([]);
      return;
    }
    let cancelled = false;
    // Lerretets størrelse NÅR flyten lastes, slik at avstandene tilpasses
    // tilgjengelig plass. Vi beregner bevisst ikke layout på nytt ved
    // senere endring av vindusstørrelse — det ville forkastet bokser
    // brukeren har flyttet manuelt.
    const rect = canvasRef.current?.getBoundingClientRect();
    const viewport = rect && rect.width > 0 && rect.height > 0 ? { width: rect.width, height: rect.height } : undefined;
    layoutFlowDocument(doc, { viewport }).then((layout) => {
      if (cancelled) return;
      layoutPositionsRef.current = new Map(layout.nodes.map((n) => [n.id, { x: n.x, y: n.y }]));
      nodeSizeRef.current = new Map(layout.nodes.map((n) => [n.id, { width: n.width, height: n.height }]));
      setGroups(layout.groups.map(({ id, label, nodeIds }) => ({ id, label, nodeIds })));

      // Porter er nå ELKs EGNE, ekte porter (se `layout/elkLayout.ts`:
      // `portConstraints: FIXED_SIDE` + `portAlignment.default:
      // DISTRIBUTED`) — det tidligere, frittstående klient-side
      // "slot"-systemet (`lib/handleAssignment.ts`) er fjernet. ELK har
      // allerede plassert portene jevnt fordelt og brukt DEM til selve
      // ruteberegningen, så det er nå umulig for det rendrede håndtaket og
      // den tegnede linjen å komme i utakt (den tidligere "opptil 240px
      // avvik"-bugen kan strukturelt ikke lenger oppstå).
      setNodes(
        layout.nodes.map((n) => {
          const ports: NodePort[] = n.ports.map((port) => {
            const pctAlongSide =
              port.side === 'NORTH' || port.side === 'SOUTH'
                ? ((port.x - n.x) / n.width) * 100
                : ((port.y - n.y) / n.height) * 100;
            return { id: port.id, side: port.side, pctAlongSide };
          });
          // Selv-handlene (høyre midt / topp midt) regnes også som opptatte
          // posisjoner, så ingen ledige punkter legges oppå dem.
          const taken: NodePort[] = [
            ...ports,
            { id: 'self-source', side: 'EAST', pctAlongSide: 50 },
            { id: 'self-target', side: 'NORTH', pctAlongSide: 50 },
          ];
          const freeSlots = computeFreeSlots(taken, n.width, n.height);
          return {
            id: n.id,
            type: 'flowNode',
            position: { x: n.x, y: n.y },
            data: { flowNode: n.node, ports, freeSlots, size: { width: n.width, height: n.height } },
            style: { width: n.width, height: n.height },
          };
        })
      );

      setEdges(
        layout.edges.map(({ id, edge, points, sourcePortId, targetPortId, labelText, labelBox }) => ({
          id,
          source: edge.source,
          target: edge.target,
          sourceHandle: sourcePortId ?? 'self-source',
          targetHandle: targetPortId ?? 'self-target',
          type: 'elkRouted',
          data: { points, labelBox },
          label: labelText,
          animated: false,
          style: {
            stroke: EDGE_TYPE_COLOR[edge.type] ?? '#94a3b8',
            strokeWidth: 1.5,
            strokeDasharray: edge.uncertain ? '6 4' : undefined,
          },
          labelStyle: { fontSize: 11, fill: '#334155', fontWeight: 500 },
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.92 },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
          markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_TYPE_COLOR[edge.type] ?? '#94a3b8' },
        }))
      );
    });
    return () => {
      cancelled = true;
    };
  }, [doc]);

  const nodeTypes = useMemo(() => ({ flowNode: FlowNodeCard, appGroup: AppGroupFrame, draftNode: DraftNodeCard }), []);
  const edgeTypes = useMemo(() => ({ elkRouted: ElkRoutedEdge }), []);

  const nodesById = useMemo(() => new Map((doc?.nodes ?? []).map((n) => [n.id, n])), [doc]);
  const edgesById = useMemo(() => new Map((doc?.edges ?? []).map((e) => [e.id, e])), [doc]);

  // Nullstill valg/fremheving som peker på noe som nå er skjult.
  useEffect(() => {
    if (selection?.kind === 'node' && !nodesById.has(selection.item.id)) setSelection(null);
    if (selection?.kind === 'edge' && !edgesById.has(selection.item.id)) setSelection(null);
    if (focusedEdge && !edgesById.has(focusedEdge.id)) setFocusedEdge(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesById, edgesById]);

  // Hvilken kant og hvilke noder som hører til gjeldende valg (node eller
  // kant). Brukes til å fremheve akkurat det steget i skissen — f.eks. når
  // brukeren klikker på et element i "Rekkefølge"-listen i
  // forklaringspanelet — i stedet for kun å oppdatere teksten i panelet.
  const highlight: Selection = focusedEdge ? { kind: 'edge', item: focusedEdge } : selection;
  const highlightedEdgeId = highlight?.kind === 'edge' ? highlight.item.id : null;
  const highlightedNodeIds = useMemo(() => {
    if (!highlight) return null;
    if (highlight.kind === 'node') return new Set([highlight.item.id]);
    return new Set([highlight.item.source, highlight.item.target]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedEdge, selection]);

  // Fremhevede visnings-noder/-kanter avledes fra den "rå" nodes/edges-
  // staten (som eies av onNodesChange/onEdgesChange, f.eks. ved drag) —
  // selve posisjonene endres ikke her, kun stil/opacity for å vise valget.
  const allNodes = useMemo((): Node[] => [...nodes, ...draftNodes], [nodes, draftNodes]);
  // Størrelse per boks: ELK-størrelsen for flytens bokser, fast størrelse
  // for forslag. Avhenger av `nodes` fordi `nodeSizeRef` fylles på nytt
  // rett før en ny layout settes.
  const nodeSizes = useMemo(() => {
    const map = new Map(nodeSizeRef.current);
    for (const n of draftNodes) map.set(n.id, DRAFT_NODE_SIZE);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, draftNodes]);

  // Boksen (posisjon + størrelse) til hver node, ut fra LIVE
  // render-posisjon (`nodes`, som drag/reconnect oppdaterer) — brukes til
  // å garantere at ingen kant-linje noensinne overlapper en boks den ikke
  // skal til/fra, se `avoidBoxes` i `displayEdges` under. Regnes ut på
  // nytt for hvert node-drag, slik at avoidance alltid reflekterer
  // gjeldende boks-plassering.
  const liveBoxes = useMemo(() => {
    const map = new Map<string, AvoidBox>();
    for (const n of allNodes) {
      const size = nodeSizes.get(n.id);
      if (!size) continue;
      map.set(n.id, { x: n.position.x, y: n.position.y, width: size.width, height: size.height });
    }
    return map;
  }, [allNodes, nodeSizes]);

  // Forslag-koblinger til bokser som ikke vises (f.eks. skjulte databaser)
  // tegnes ikke, men beholdes til boksen vises igjen. Punkter som ikke
  // finnes lenger løses opp ett og ett, slik at to koblinger aldri havner i
  // samme punkt.
  const visibleDraftEdges = useMemo(() => {
    const byId = new Map(allNodes.map((n) => [n.id, n]));
    const visible = draftEdges.filter((e) => liveBoxes.has(e.source) && liveBoxes.has(e.target));
    const resolved: Edge[] = [];
    visible.forEach((e, i) => {
      const others = [...edges, ...resolved, ...visible.slice(i + 1)];
      const source = byId.get(e.source);
      const target = byId.get(e.target);
      const sourceSize = nodeSizes.get(e.source);
      const targetSize = nodeSizes.get(e.target);
      const sourceHandle = resolveDraftHandle(
        source,
        sourceSize,
        e.sourceHandle,
        handlePosition(target, targetSize, e.targetHandle),
        (id) => isHandleOccupied(others, e.source, id)
      );
      const targetHandle = resolveDraftHandle(
        target,
        targetSize,
        e.targetHandle,
        handlePosition(source, sourceSize, sourceHandle),
        (id) => isHandleOccupied([...others, { ...e, targetHandle: null, sourceHandle }], e.target, id, e.id)
      );
      resolved.push(
        sourceHandle === e.sourceHandle && targetHandle === e.targetHandle ? e : { ...e, sourceHandle, targetHandle }
      );
    });
    return resolved;
  }, [draftEdges, edges, allNodes, liveBoxes, nodeSizes]);

  // Alle kanter slik de faktisk tegnes — grunnlaget for regelen om at ingen
  // to kanter deler tilkoblingspunkt.
  const allEdges = useMemo(() => {
    const visibleIds = new Set(visibleDraftEdges.map((e) => e.id));
    return [...edges, ...visibleDraftEdges, ...draftEdges.filter((e) => !visibleIds.has(e.id))];
  }, [edges, visibleDraftEdges, draftEdges]);

  const occupiedSlots = useCallback(
    (nodeId: string, slots: SidePoint[] | undefined) =>
      reconnecting
        ? (slots ?? [])
            .filter((slot) => isHandleOccupied(allEdges, nodeId, slot.id, reconnectingEdgeIdRef.current))
            .map((slot) => slot.id)
        : drawMode
          ? (slots ?? []).filter((slot) => isHandleOccupied(allEdges, nodeId, slot.id)).map((slot) => slot.id)
          : undefined,
    [reconnecting, drawMode, allEdges]
  );

  const updateDraftNode = useCallback((id: string, patch: Partial<Pick<DraftNode, 'label' | 'type'>>) => {
    setDraftNodes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, draft: { ...n.data.draft, ...patch }, startEditing: false } } : n
      )
    );
  }, []);

  const displayNodes = useMemo((): Node[] => {
    const flowNodes: Node[] = nodes.map((n) => ({
      ...n,
      // Bare forslag kan slettes. Uten dette ville React Flow også tatt med
      // forslag-koblinger til en «slettet» ekte boks.
      deletable: false,
      data: {
        ...n.data,
        highlighted: highlightedNodeIds?.has(n.id) ?? false,
        dimmed: highlightedNodeIds != null && !highlightedNodeIds.has(n.id),
        showFreeSlots: reconnecting,
        drawMode,
        // Settet med handles holdes stabilt (React Flow mellomlagrer
        // handle-posisjonene); opptatte punkter skjules kun visuelt.
        occupiedSlotIds: occupiedSlots(n.id, n.data.freeSlots),
      },
    }));
    const drafts: Node[] = draftNodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        showFreeSlots: reconnecting,
        drawMode,
        occupiedSlotIds: occupiedSlots(n.id, n.data.freeSlots),
        onUpdate: updateDraftNode,
      },
    }));

    // App-rammer: beregnes fra medlemmenes LIVE posisjon, så rammen følger
    // med når en boks dras. Legges først og med lav zIndex, slik at de
    // tegnes bak boksene og ikke fanger klikk.
    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const frames: Node[] = [];
    for (const group of groups) {
      const members = group.nodeIds
        .map((id) => {
          const n = nodeById.get(id);
          const size = nodeSizeRef.current.get(id);
          return n && size ? { ...n.position, ...size } : undefined;
        })
        .filter((m) => m !== undefined);
      if (members.length < 2) continue;
      const minX = Math.min(...members.map((m) => m.x)) - GROUP_PADDING.left;
      const minY = Math.min(...members.map((m) => m.y)) - GROUP_PADDING.top;
      const maxX = Math.max(...members.map((m) => m.x + m.width)) + GROUP_PADDING.right;
      const maxY = Math.max(...members.map((m) => m.y + m.height)) + GROUP_PADDING.bottom;
      frames.push({
        id: `__group__${group.id}`,
        type: 'appGroup',
        position: { x: minX, y: minY },
        data: {
          label: group.label,
          dimmed: highlightedNodeIds != null && !group.nodeIds.some((id) => highlightedNodeIds.has(id)),
        },
        style: { width: maxX - minX, height: maxY - minY, pointerEvents: 'none' },
        draggable: false,
        selectable: false,
        focusable: false,
        connectable: false,
        zIndex: -1,
      });
    }
    return [...frames, ...flowNodes, ...drafts];
  }, [nodes, draftNodes, highlightedNodeIds, groups, reconnecting, drawMode, occupiedSlots, updateDraftNode]);

  const displayEdges = useMemo(
    () =>
      // Forslag-koblinger til bokser som ikke vises (f.eks. skjulte
      // databaser) tegnes ikke, men beholdes til boksen vises igjen.
      [...edges, ...visibleDraftEdges].map((e) => {
        const isHighlighted = e.id === highlightedEdgeId;
        const isDimmed = highlightedEdgeId != null && !isHighlighted;

        // Kant-linjen er tegnet langs ELKs opprinnelige rute (`data.points`),
        // beregnet ut fra node-posisjonene på layout-tidspunktet. Hvis
        // brukeren siden har dratt kilde- og/eller mål-noden et annet sted,
        // må ruten forskyves tilsvarende — ellers henger linjen igjen på sin
        // gamle plass og ser "løsrevet" fra boksen ut.
        const points = (e.data as { points?: XY[] } | undefined)?.points;
        const obstacles: AvoidBox[] = [];
        for (const [nodeId, box] of liveBoxes) {
          if (nodeId === e.source || nodeId === e.target) continue;
          obstacles.push(box);
        }

        // Har brukeren flyttet kilde- eller mål-boksen siden ELK beregnet
        // ruten (eller koblet kanten om, slik at ELK-ruten er forkastet)?
        // Da er ELKs knekkpunkter utdaterte — vi tegner i stedet en
        // ortogonal rute fra de live handlene (se `ElkRoutedEdge`), som
        // bøyer seg naturlig og blir rett igjen når boksene står i linje.
        const hasMoved = (nodeId: string) => {
          const live = allNodes.find((n) => n.id === nodeId);
          const layoutPos = layoutPositionsRef.current.get(nodeId);
          return !!live && !!layoutPos && (live.position.x !== layoutPos.x || live.position.y !== layoutPos.y);
        };
        const orthogonal =
          e.source !== e.target && (!points || points.length < 2 || hasMoved(e.source) || hasMoved(e.target));

        let routed = points;
        // ELK-ruten holder seg allerede unna boksene, bare med mindre klaring
        // enn `avoidBoxes` krever. Den skal derfor bare rutes om når den
        // faktisk går gjennom en boks (f.eks. en tredje boks dratt over den).
        if (!orthogonal && points && points.length > 0 && crossesAnyRealBox(points, obstacles)) {
          // Garantien om at linjen aldri overlapper en boks: rut ELK-ruten
          // rundt ALLE andre noders LIVE bokser — også midt i en drag av en
          // helt tredje node som linjen ellers ville krysset.
          routed = avoidBoxes(points, obstacles);
        }

        return {
          ...e,
          deletable: isDraftId(e.id),
          data: {
            ...e.data,
            points: routed,
            orthogonal,
            obstacles,
            sourceBox: liveBoxes.get(e.source),
            targetBox: liveBoxes.get(e.target),
          },
          zIndex: isHighlighted ? 1000 : undefined,
          style: {
            ...e.style,
            strokeWidth: isHighlighted ? 3.5 : 1.5,
            opacity: isDimmed ? 0.3 : 1,
          },
          labelStyle: {
            ...e.labelStyle,
            fontWeight: isHighlighted ? 700 : 500,
            fontSize: isHighlighted ? 12 : 11,
          },
          labelBgStyle: {
            ...e.labelBgStyle,
            fillOpacity: isDimmed ? 0.4 : 0.92,
          },
        };
      }),
    [edges, visibleDraftEdges, highlightedEdgeId, allNodes, liveBoxes]
  );

  // Panorerer/zoomer canvaset til det valgte elementet, slik at et klikk i
  // "Rekkefølge"-listen (eller node/kant-listene i forklaringspanelet) også
  // faktisk bringer det aktuelle steget inn i synsfeltet — ikke bare
  // fremhever det utenfor skjermen.
  const reactFlowInstance = useRef<ReactFlowInstance<any, any> | null>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  useEffect(() => {
    if (!highlightedNodeIds || highlightedNodeIds.size === 0) return;
    const ids = [...highlightedNodeIds];
    reactFlowInstance.current?.fitView({
      nodes: ids.map((id) => ({ id })),
      duration: 400,
      padding: 0.35,
      maxZoom: 1.2,
    });
  }, [highlightedNodeIds]);

  // Lar brukeren dra på noder (posisjon) og dra/flytte kant-endepunkter i
  // vieweren. Dette endrer kun den lokale, midlertidige visningen — det
  // skriver ikke tilbake til *.flow.json-filen eller agentens output.
  // Bare forslag kan slettes (Delete/Backspace) — boksene og koblingene fra
  // flyten beskriver dagens system og skal alltid vises.
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const own = changes.filter((c) => !('id' in c) || !c.id.startsWith('__group__'));
    const draft = own.filter((c) => 'id' in c && isDraftId(c.id)) as NodeChange<Node<DraftNodeData>>[];
    const real = own.filter((c) => !('id' in c && isDraftId(c.id)) && c.type !== 'remove') as NodeChange<
      Node<FlowNodeData>
    >[];
    if (real.length > 0) setNodes((nds) => applyNodeChanges(real, nds));
    if (draft.length > 0) {
      setDraftNodes((nds) => applyNodeChanges(draft, nds));
      const removed = new Set(draft.flatMap((c) => (c.type === 'remove' ? [c.id] : [])));
      if (removed.size > 0) {
        setDraftEdges((eds) => eds.filter((e) => !removed.has(e.source) && !removed.has(e.target)));
      }
    }
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    const draft = changes.filter((c) => 'id' in c && isDraftId(c.id));
    const real = changes.filter((c) => !('id' in c && isDraftId(c.id)) && c.type !== 'remove');
    if (real.length > 0) setEdges((eds) => applyEdgeChanges(real, eds));
    if (draft.length > 0) setDraftEdges((eds) => applyEdgeChanges(draft, eds));
  }, []);

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      // Slippet vurderes etter at endepunktet er flyttet til beste ledige
      // punkt på samme side (se `snapToBestPoint`), slik at det holder å
      // treffe riktig side av boksen.
      const conn: Connection = {
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? null,
        targetHandle: connection.targetHandle ?? null,
      };
      const movingId = reconnectingEdgeIdRef.current;
      // En ny kobling dras alltid fra kilden, så det er målenden som flyttes.
      const movingEnd = movingId ? reconnectingEndRef.current : 'target';
      if (!movingEnd || usesSelfHandleWrongly(conn, movingEnd)) return false;
      // Koblinger fra dagens flyt kan ikke kobles til et forslag — da ville
      // de forsvunnet om forslaget slettes.
      if (movingId && !isDraftId(movingId) && (isDraftId(conn.source) || isDraftId(conn.target))) return false;
      const snapped = snapToBestPoint(conn, movingEnd, movingId, allEdges, allNodes, nodeSizes);
      return isConnectionFree(allEdges, snapped, movingId);
    },
    [allEdges, allNodes, nodeSizes]
  );

  // Ny kobling tegnet i tegnemodus: blir alltid et forslag.
  const onConnect = useCallback(
    (connection: Connection) => {
      if (usesSelfHandleWrongly(connection, 'target')) return;
      const snapped = snapToBestPoint(connection, 'target', null, allEdges, allNodes, nodeSizes);
      if (!isConnectionFree(allEdges, snapped)) return;
      setDraftEdges((eds) => [
        ...eds,
        toDraftRfEdge({
          id: newDraftId('edge'),
          source: snapped.source,
          target: snapped.target,
          sourceHandle: snapped.sourceHandle,
          targetHandle: snapped.targetHandle,
          label: '',
        }),
      ]);
    },
    [allEdges, allNodes, nodeSizes]
  );

  const addDraftNode = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const instance = reactFlowInstance.current;
    const center =
      rect && instance
        ? instance.screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
        : { x: 0, y: 0 };
    setDraftNodes((prev) => {
      // Forskyv litt per ny boks, så flere nye bokser ikke havner oppå hverandre.
      const offset = (prev.length % 6) * 24;
      const draft: DraftNode = {
        id: newDraftId('node'),
        type: 'process',
        label: 'Ny boks',
        x: center.x - DRAFT_NODE_SIZE.width / 2 + offset,
        y: center.y - DRAFT_NODE_SIZE.height / 2 + offset,
      };
      return [...prev, toDraftRfNode(draft, true)];
    });
  }, []);

  const clearDrafts = useCallback(() => {
    if (!window.confirm('Slette alle forslag (bokser og koblinger) for denne flyten?')) return;
    setDraftNodes([]);
    setDraftEdges([]);
  }, []);

  const editDraftEdgeLabel = useCallback((edge: Edge) => {
    if (!isDraftId(edge.id)) return;
    const current = typeof edge.label === 'string' ? edge.label : '';
    const next = window.prompt('Tekst på koblingen (forslag):', current);
    if (next == null) return;
    const label = next.trim().slice(0, 200);
    setDraftEdges((eds) => eds.map((e) => (e.id === edge.id ? { ...e, label: label || undefined } : e)));
  }, []);

  const onReconnect = useCallback((oldEdge: Edge, droppedConnection: Connection) => {
    const movingEnd = reconnectingEndRef.current;
    if (!movingEnd || usesSelfHandleWrongly(droppedConnection, movingEnd)) return;
    if (!isDraftId(oldEdge.id) && (isDraftId(droppedConnection.source) || isDraftId(droppedConnection.target))) return;
    const newConnection = snapToBestPoint(droppedConnection, movingEnd, oldEdge.id, allEdges, allNodes, nodeSizes);
    if (!isConnectionFree(allEdges, newConnection, oldEdge.id)) return;
    const setList = isDraftId(oldEdge.id) ? setDraftEdges : setEdges;
    setList((eds) => {
      return (
      // VIKTIG: `reconnectEdge` genererer som DEFAULT en helt ny edge-id
      // (`xy-edge__<kilde><kildeHandle>-<mål><målHandle>`) for den ombygde
      // kanten, siden `shouldReplaceId` er `true` hvis ikke annet oppgis.
      // Uten `shouldReplaceId: false` her ville derfor et forsøk på å
      // matche på `oldEdge.id` (for å fjerne den nå ugyldige ELK-ruten,
      // se under) ALDRI truffet — den nye kanten har jo en annen id enn
      // den gamle. Det var akkurat dette som gjorde at reconnect av
      // KILDE-enden (hvor sourceHandle endres og dermed id-en) så "rar" ut:
      // den utdaterte ELK-ruten ble aldri ryddet bort, mens reconnect av
      // MÅL-enden tilfeldigvis så noenlunde greit ut for små forskyvninger.
      reconnectEdge(oldEdge, newConnection, eds, { shouldReplaceId: false }).map((e) => {
        if (e.id !== oldEdge.id) return e;
        // Når brukeren manuelt kobler en kant om til et annet
        // tilkoblingspunkt (annen slot, eller helt annen boks), er ELKs
        // opprinnelige, kollisjonsbeviste rute ikke lenger gyldig — dens
        // mellompunkter ble beregnet for et helt annet start-/sluttpunkt,
        // og ville gitt en rute som svinger av i feil vinkel i stedet for
        // å gå rett inn i boksen. Vi forkaster derfor ELK-ruten for akkurat
        // denne kanten; `ElkRoutedEdge` tegner da en ortogonal rute
        // mellom de faktiske (live) handlene.
        return { ...e, data: { ...e.data, points: undefined } };
      })
      );
    });
  }, [allEdges, allNodes, nodeSizes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, minWidth: 0 }}>
      <header style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {title && <strong style={{ fontSize: 13, color: '#334155' }}>{title}</strong>}
        <select
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
          style={{ fontSize: 13, padding: '4px 8px' }}
        >
          {files.length === 0 && <option value="">Ingen *.flow.json funnet i arkitektur/flows/</option>}
          {files.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        {doc && <span style={{ fontSize: 13, color: '#475569' }}>{doc.title}</span>}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {drawMode && (
            <>
              <button type="button" onClick={addDraftNode} style={draftButtonStyle}>
                ＋ Ny boks
              </button>
              {(draftNodes.length > 0 || draftEdges.length > 0) && (
                <button type="button" onClick={clearDrafts} style={{ ...draftButtonStyle, background: '#ffffff', color: DRAFT_COLOR }}>
                  Slett alle forslag
                </button>
              )}
            </>
          )}
          {doc && (
            <Switch
              label={`Tegn forslag${draftNodes.length + draftEdges.length > 0 ? ` (${draftNodes.length + draftEdges.length})` : ''}`}
              checked={drawMode}
              onToggle={() => setDrawMode((v) => !v)}
              color={DRAFT_COLOR}
            />
          )}
          {rawDoc && hasDatabaseNodes(rawDoc) && (
            <Switch label="Vis databaser" checked={showDatabases} onToggle={() => setShowDatabases((v) => !v)} color="#0891b2" />
          )}
        </div>
      </header>

      {error && (
        <pre style={{ color: '#b91c1c', background: '#fef2f2', padding: 12, margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>
          {error}
        </pre>
      )}

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div ref={canvasRef} style={{ flex: 1, minWidth: 0 }}>
          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={(instance) => {
              reactFlowInstance.current = instance;
            }}
            fitView
            nodesDraggable
            edgesReconnectable
            reconnectRadius={22}
            connectionRadius={30}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onReconnect={onReconnect}
            onConnect={onConnect}
            onConnectStart={() => setReconnecting(true)}
            onConnectEnd={() => setReconnecting(false)}
            // Source- og target-handle ligger oppå hverandre i hvert punkt;
            // Loose gjør at det ikke spiller noen rolle hvilken av dem
            // koblingen slippes på.
            connectionMode={ConnectionMode.Loose}
            connectionLineStyle={{ stroke: DRAFT_COLOR, strokeWidth: 2, strokeDasharray: '8 4' }}
            deleteKeyCode={['Backspace', 'Delete']}
            // Dobbeltklikk brukes til å redigere forslag, ikke til zoom.
            zoomOnDoubleClick={false}
            onEdgeDoubleClick={(_, edge) => editDraftEdgeLabel(edge)}
            onReconnectStart={(_, edge, oppositeHandleType) => {
              reconnectingEdgeIdRef.current = edge.id;
              reconnectingEndRef.current = oppositeHandleType === 'target' ? 'source' : 'target';
              setReconnecting(true);
            }}
            onReconnectEnd={() => {
              reconnectingEdgeIdRef.current = null;
              reconnectingEndRef.current = null;
              setReconnecting(false);
            }}
            isValidConnection={isValidConnection}
            onNodeClick={(_, node) => {
              const flowNode = nodesById.get(node.id);
              if (flowNode) {
                setSelection({ kind: 'node', item: flowNode });
                setFocusedEdge(null);
              }
            }}
            onEdgeClick={(_, edge) => {
              const flowEdge = edgesById.get(edge.id);
              if (flowEdge) {
                setSelection({ kind: 'edge', item: flowEdge });
                setFocusedEdge(null);
              }
            }}
            onPaneClick={() => {
              setSelection(null);
              setFocusedEdge(null);
            }}
          >
            <Background />
            <Controls />
            <MiniMap pannable zoomable />
            <Legend />
            {drawMode && (
              <Panel position="bottom-center">
                <div
                  style={{
                    background: '#faf5ff',
                    border: `1px solid ${DRAFT_COLOR}`,
                    borderRadius: 6,
                    padding: '6px 10px',
                    fontSize: 12,
                    color: '#3b0764',
                    maxWidth: 520,
                    textAlign: 'center',
                  }}
                >
                  Tegnemodus: dra fra en lilla prikk på en boks til en annen boks for å tegne en kobling. Dobbeltklikk på
                  et forslag for å endre tekst. Merk og trykk Delete for å slette. Forslag lagres bare i denne
                  nettleseren.
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
        <div style={{ position: 'relative', display: 'flex', minHeight: 0 }}>
          {panelCollapsed ? (
            <button
              type="button"
              onClick={() => setPanelCollapsed(false)}
              aria-label="Vis oversiktspanelet"
              aria-expanded={false}
              title="Vis oversikt"
              style={{
                width: 32,
                borderLeft: '1px solid #e2e8f0',
                borderTop: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                background: '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '12px 0',
                color: '#475569',
                fontSize: 12,
              }}
            >
              <span aria-hidden="true">«</span>
              <span style={{ writingMode: 'vertical-rl', fontWeight: 600 }}>Oversikt</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setPanelCollapsed(true)}
                aria-label="Minimer oversiktspanelet"
                aria-expanded={true}
                title="Minimer oversikt"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1,
                  width: 26,
                  height: 26,
                  border: '1px solid #e2e8f0',
                  borderRadius: 4,
                  background: '#ffffff',
                  cursor: 'pointer',
                  color: '#475569',
                  lineHeight: 1,
                }}
              >
                »
              </button>
              <ExplanationPanel
                doc={doc}
                selected={selection}
                onHighlightEdge={(edge) => setFocusedEdge((current) => (current?.id === edge.id ? null : edge))}
                highlightedEdgeId={highlightedEdgeId}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
