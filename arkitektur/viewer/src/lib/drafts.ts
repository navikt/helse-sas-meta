import { NodeTypeSchema, type NodeType } from '../schema/flow';

const NODE_TYPES: readonly NodeType[] = NodeTypeSchema.options;

/**
 * «Forslag»: bokser og koblinger brukeren tegner selv i vieweren for å
 * diskutere mulige endringer i arkitekturen. De finnes IKKE i systemet i
 * dag, og skrives aldri til *.flow.json — de lagres kun lokalt i
 * nettleseren (localStorage), per flytfil.
 */

export const DRAFT_PREFIX = 'draft:';
export const DRAFT_COLOR = '#7c3aed';
export const DRAFT_NODE_SIZE = { width: 180, height: 72 };

export interface DraftNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
}

export interface DraftEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string | null;
  targetHandle: string | null;
  label: string;
}

export interface Drafts {
  nodes: DraftNode[];
  edges: DraftEdge[];
}

export const EMPTY_DRAFTS: Drafts = { nodes: [], edges: [] };

export function isDraftId(id: string | null | undefined): boolean {
  return !!id && id.startsWith(DRAFT_PREFIX);
}

export function newDraftId(kind: 'node' | 'edge'): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${DRAFT_PREFIX}${kind}-${Date.now().toString(36)}-${random}`;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

const str = (v: unknown, max = 200): string | undefined =>
  typeof v === 'string' && v.length <= max ? v : undefined;
const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

/** Tolker lagrede forslag defensivt — ugyldige elementer hoppes over i
 * stedet for at hele visningen feiler. */
export function parseDrafts(raw: unknown): Drafts {
  if (!isObject(raw)) return EMPTY_DRAFTS;
  const nodes: DraftNode[] = [];
  for (const n of Array.isArray(raw.nodes) ? raw.nodes : []) {
    if (!isObject(n)) continue;
    const id = str(n.id);
    const label = str(n.label, 500);
    const type = NODE_TYPES.find((t) => t === n.type);
    const x = num(n.x);
    const y = num(n.y);
    if (!id || !isDraftId(id) || label === undefined || !type || x === undefined || y === undefined) continue;
    nodes.push({ id, type, label, x, y });
  }
  const edges: DraftEdge[] = [];
  for (const e of Array.isArray(raw.edges) ? raw.edges : []) {
    if (!isObject(e)) continue;
    const id = str(e.id);
    const source = str(e.source);
    const target = str(e.target);
    const label = str(e.label, 500) ?? '';
    if (!id || !isDraftId(id) || !source || !target) continue;
    edges.push({
      id,
      source,
      target,
      sourceHandle: str(e.sourceHandle) ?? null,
      targetHandle: str(e.targetHandle) ?? null,
      label,
    });
  }
  return { nodes, edges };
}

const storageKey = (file: string) => `arkitektur-viewer:forslag:${file}`;

export function loadDrafts(file: string, storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): Drafts {
  try {
    const raw = storage?.getItem(storageKey(file));
    return raw ? parseDrafts(JSON.parse(raw)) : EMPTY_DRAFTS;
  } catch {
    return EMPTY_DRAFTS;
  }
}

/**
 * Lagrer forslagene. Returnerer `true` bare hvis innholdet faktisk endret
 * seg, slik at andre paneler med samme flyt kun varsles ved reelle
 * endringer (og to paneler ikke kan sende oppdateringer frem og tilbake).
 */
export function saveDrafts(
  file: string,
  drafts: Drafts,
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | undefined = globalThis.localStorage
): boolean {
  try {
    const key = storageKey(file);
    const empty = drafts.nodes.length === 0 && drafts.edges.length === 0;
    const next = empty ? null : JSON.stringify(drafts);
    if ((storage?.getItem(key) ?? null) === next) return false;
    if (next == null) storage?.removeItem(key);
    else storage?.setItem(key, next);
    return true;
  } catch {
    // Full eller utilgjengelig localStorage: forslagene lever da bare i
    // minnet til siden lastes på nytt.
    return false;
  }
}

/** Varsler andre paneler på samme side (sammenligningsmodus) om at
 * forslagene for en flyt er endret, så de ikke overskriver hverandre. */
export const DRAFTS_CHANGED_EVENT = 'arkitektur-viewer:forslag-endret';

export interface DraftsChangedDetail {
  file: string;
  sourceId: string;
}

export function notifyDraftsChanged(detail: DraftsChangedDetail): void {
  globalThis.dispatchEvent?.(new CustomEvent<DraftsChangedDetail>(DRAFTS_CHANGED_EVENT, { detail }));
}
