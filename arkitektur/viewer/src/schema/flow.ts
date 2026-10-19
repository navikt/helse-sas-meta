import { z } from 'zod';

/**
 * Semantic flow format produced by the arkitekturagent.
 *
 * The agent only describes *what* the flow looks like (services, events,
 * behov/løsning, decisions, evidence). It never computes x/y coordinates —
 * layout is always calculated locally by ELK in the viewer.
 *
 * SECURITY / TRUST NOTE:
 * All string content in this document (labels, summaries, evidence notes,
 * file paths, symbols) comes from an LLM-driven agent and MUST be treated
 * as untrusted input. The viewer must only ever render these strings as
 * plain, escaped React text/children (e.g. `<span>{label}</span>`).
 * NEVER pass any field from a FlowDocument into `dangerouslySetInnerHTML`,
 * `innerHTML`, or any HTML/markdown renderer that interprets markup.
 *
 * This schema uses `.strict()` on every object so unknown fields fail
 * validation loudly instead of silently passing through — this makes
 * schema drift between the agent instruction and this file visible early.
 */

// ---------------------------------------------------------------------------
// Reusable primitives
// ---------------------------------------------------------------------------

/** Characters allowed in stable graph ids: letters, digits, `.` `_` `:` `-`. */
const ID_PATTERN = /^[A-Za-z0-9._:-]+$/;

const IdSchema = z
  .string()
  .min(1, 'id kan ikke være tom')
  .max(100, 'id kan ikke være lengre enn 100 tegn')
  .regex(ID_PATTERN, 'id kan kun inneholde bokstaver, tall, og . _ : -');

const LabelSchema = z
  .string()
  .min(1, 'label kan ikke være tom')
  .max(200, 'label kan ikke være lengre enn 200 tegn');

const SummarySchema = z
  .string()
  .max(2000, 'summary kan ikke være lengre enn 2000 tegn');

const SymbolSchema = z
  .string()
  .min(1)
  .max(200, 'symbol kan ikke være lengre enn 200 tegn');

const NoteSchema = z
  .string()
  .min(1)
  .max(500, 'note kan ikke være lengre enn 500 tegn');

/** Matches any ASCII control character (0x00–0x1F, 0x7F), inkl. NUL. */
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_PATTERN = /[\u0000-\u001f\u007f]/;

/** URI-schemes som ikke er en repo-relativ POSIX-path. */
const URI_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/**
 * Repo-relative file path used as evidence.
 * - ingen absolutte paths (`/...`, `C:\...`)
 * - ingen `~`
 * - ingen `..`-segmenter (path traversal)
 * - ingen backslash (unngå Windows-style paths / blandet separator)
 * - ingen URI-schemes (`http:`, `https:`, `file:`, `vscode:`, osv.)
 * - ingen kontrolltegn (inkl. NUL)
 * - ikke tom eller kun whitespace
 *
 * NB: dette er ren streng-validering. Det gjøres ingen filsystem-oppslag
 * her — verken for å sjekke at filen finnes, eller for å normalisere den.
 */
const EvidenceFileSchema = z
  .string()
  .min(1, 'evidence.file kan ikke være tom')
  .max(300, 'evidence.file kan ikke være lengre enn 300 tegn')
  .refine((value) => value.trim().length > 0, 'evidence.file kan ikke være kun whitespace')
  .refine((value) => !CONTROL_CHAR_PATTERN.test(value), 'evidence.file kan ikke inneholde kontrolltegn')
  .refine((value) => !URI_SCHEME_PATTERN.test(value), 'evidence.file kan ikke være en URI (f.eks. http:, https:, file:, vscode:)')
  .refine((value) => !value.startsWith('/'), 'evidence.file kan ikke være en absolutt path')
  .refine((value) => !/^[A-Za-z]:[\\/]/.test(value), 'evidence.file kan ikke være en absolutt Windows-path')
  .refine((value) => !value.includes('~'), 'evidence.file kan ikke inneholde "~"')
  .refine((value) => !value.includes('\\'), 'evidence.file kan ikke inneholde backslash')
  .refine(
    (value) => !value.split('/').some((segment) => segment === '..'),
    'evidence.file kan ikke inneholde ".."-segmenter',
  );

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const NodeTypeSchema = z.enum([
  'service',
  'process',
  'decision',
  'event',
  'external',
  'database',
  'frontend',
]);
export type NodeType = z.infer<typeof NodeTypeSchema>;

export const EdgeTypeSchema = z.enum([
  'behov',
  'løsning',
  'event',
  'call',
  'read',
  'write',
  'flow',
]);
export type EdgeType = z.infer<typeof EdgeTypeSchema>;

export const DirectionSchema = z.enum(['RIGHT', 'DOWN']);
export type Direction = z.infer<typeof DirectionSchema>;

// ---------------------------------------------------------------------------
// Document schemas
// ---------------------------------------------------------------------------

export const EvidenceSchema = z
  .object({
    file: EvidenceFileSchema,
    line: z.number().int().positive().max(2_000_000).optional(),
    symbol: SymbolSchema.optional(),
    note: NoteSchema.optional(),
  })
  .strict();
export type Evidence = z.infer<typeof EvidenceSchema>;

const EvidenceListSchema = z
  .array(EvidenceSchema)
  .max(20, 'maks 20 evidence-elementer per node/edge')
  .optional()
  .default([]);

export const FlowNodeSchema = z
  .object({
    id: IdSchema,
    type: NodeTypeSchema,
    label: LabelSchema,
    summary: SummarySchema.optional(),
    group: IdSchema.optional(),
    uncertain: z.boolean().optional().default(false),
    evidence: EvidenceListSchema,
  })
  .strict();
export type FlowNode = z.infer<typeof FlowNodeSchema>;

export const FlowEdgeSchema = z
  .object({
    id: IdSchema,
    source: IdSchema,
    target: IdSchema,
    type: EdgeTypeSchema,
    label: LabelSchema.optional(),
    uncertain: z.boolean().optional().default(false),
    /**
     * Valgfritt, eksplisitt steg-nummer for å vise leserekkefølgen i
     * diagrammet (f.eks. "1", "2", "3" ...). Flere kanter kan dele samme
     * tall når de skjer parallelt (fan-out fra samme kilde). Hvis feltet
     * ikke er satt, faller vieweren tilbake til kantens posisjon i
     * `edges`-arrayet (1-indeksert) — agenten kan derfor la feltet stå
     * tomt så lenge kantene er skrevet i faktisk rekkefølge.
     */
    step: z.number().int().positive().max(500).optional(),
    evidence: EvidenceListSchema,
  })
  .strict();
export type FlowEdge = z.infer<typeof FlowEdgeSchema>;

const MAX_NODES = 200;
const MAX_EDGES = 500;

export const FlowDocumentSchema = z
  .object({
    version: z.literal(1),
    title: LabelSchema,
    description: SummarySchema.optional().default(''),
    direction: DirectionSchema.optional().default('RIGHT'),
    nodes: z
      .array(FlowNodeSchema)
      .min(1, 'dokumentet må ha minst én node')
      .max(MAX_NODES, `maks ${MAX_NODES} nodes per dokument`),
    edges: z.array(FlowEdgeSchema).max(MAX_EDGES, `maks ${MAX_EDGES} edges per dokument`).default([]),
  })
  .strict();
export type FlowDocument = z.infer<typeof FlowDocumentSchema>;

export interface FlowValidationError {
  message: string;
  path: (string | number)[];
}

export type FlowParseResult =
  | { ok: true; data: FlowDocument }
  | { ok: false; errors: FlowValidationError[] };

/**
 * Parses and validates a raw JSON flow document.
 *
 * Beyond the zod shape validation, this also enforces graph-level
 * invariants that zod alone can't express:
 * - unike node-ider
 * - unike edge-ider
 * - edge source/target må referere til eksisterende noder
 *
 * Self-loop edges (source === target) er tillatt på schema-nivå — de kan
 * være semantisk gyldige for retry, republisering eller intern/reentrant
 * flyt. Agentinstruksen bør heller unngå dem med mindre de faktisk er
 * relevante for den flyten som beskrives.
 */
export function parseFlowDocument(raw: unknown): FlowParseResult {
  const result = FlowDocumentSchema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path,
      })),
    };
  }

  const doc = result.data;
  const nodeIds = new Set(doc.nodes.map((n) => n.id));
  const errors: FlowValidationError[] = [];

  const seenNodeIds = new Set<string>();
  doc.nodes.forEach((node, index) => {
    if (seenNodeIds.has(node.id)) {
      errors.push({
        message: `Duplikat node-id: "${node.id}"`,
        path: ['nodes', index, 'id'],
      });
    }
    seenNodeIds.add(node.id);
  });

  const seenEdgeIds = new Set<string>();
  doc.edges.forEach((edge, index) => {
    if (seenEdgeIds.has(edge.id)) {
      errors.push({
        message: `Duplikat edge-id: "${edge.id}"`,
        path: ['edges', index, 'id'],
      });
    }
    seenEdgeIds.add(edge.id);

    if (!nodeIds.has(edge.source)) {
      errors.push({
        message: `Edge "${edge.id}" refererer til ukjent source-node "${edge.source}"`,
        path: ['edges', index, 'source'],
      });
    }
    if (!nodeIds.has(edge.target)) {
      errors.push({
        message: `Edge "${edge.id}" refererer til ukjent target-node "${edge.target}"`,
        path: ['edges', index, 'target'],
      });
    }
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: doc };
}
