import type { FlowDocument, FlowEdge, FlowNode } from '../schema/flow';
import { computeEdgeSteps } from '../lib/flowSteps';

/**
 * Strukturert forklaringspanel.
 *
 * - Uten valgt node/kant: viser overordnet tittel/beskrivelse for hele flyten.
 * - Med valgt node: viser KUN forklaringen for den noden — label, type,
 *   summary, usikkerhet, evidens, samt hvilke kanter (inn/ut) som faktisk
 *   kobler seg til nettopp denne noden.
 * - Med valgt kant: viser KUN forklaringen for den kanten — kilde → mål,
 *   type, label, usikkerhet, evidens.
 *
 * SIKKERHET: `label`, `summary`, `symbol`, `note` og `description` er alltid
 * agent-generert (LLM) tekst og behandles som untrusted input. Alt rendres
 * her som vanlig, escaped React-tekst-child — aldri via
 * `dangerouslySetInnerHTML` eller andre markup-tolkende metoder.
 */

export type Selection =
  | { kind: 'node'; item: FlowNode }
  | { kind: 'edge'; item: FlowEdge }
  | null;

export function ExplanationPanel({
  doc,
  selected,
  onHighlightEdge,
  highlightedEdgeId,
}: {
  doc: FlowDocument | null;
  selected: Selection;
  /** Klikk i en kant-liste i panelet fremhever kanten i diagrammet, men
   * bytter IKKE forklaringen — den vises kun ved klikk i selve diagrammet. */
  onHighlightEdge?: (edge: FlowEdge) => void;
  highlightedEdgeId?: string | null;
}) {
  if (!doc) {
    return (
      <aside style={panelStyle}>
        <p style={{ color: '#64748b', fontSize: 13 }}>Ingen flyt lastet.</p>
      </aside>
    );
  }

  if (!selected) {
    const steps = computeEdgeSteps(doc);
    const nodeLabelById = new Map(doc.nodes.map((n) => [n.id, n.label]));
    const orderedEdges = [...doc.edges].sort((a, b) => (steps.get(a.id) ?? 0) - (steps.get(b.id) ?? 0));

    return (
      <aside style={panelStyle}>
        <SectionLabel>Oversikt</SectionLabel>
        <h2 style={{ fontSize: 16, margin: '4px 0 8px' }}>{doc.title}</h2>
        {doc.description && <Paragraphs text={doc.description} />}
        <Hint>Klikk på en boks eller pil i diagrammet for å se en avgrenset forklaring for nettopp den.</Hint>

        {orderedEdges.length > 0 && (
          <>
            <SubHeading>Rekkefølge ({orderedEdges.length} steg)</SubHeading>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 6px' }}>
              Samme tall som på pilene i diagrammet. Klikk på et steg for å fremheve det i diagrammet.
            </p>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {orderedEdges.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => onHighlightEdge?.(e)}
                    aria-pressed={e.id === highlightedEdgeId}
                    style={edgeButtonStyle(e, e.id === highlightedEdgeId, !!onHighlightEdge)}
                  >
                    <StepBadge step={steps.get(e.id)} />
                    <span>
                      <div style={{ color: '#1e293b', fontWeight: 500 }}>
                        {nodeLabelById.get(e.source) ?? e.source} → {nodeLabelById.get(e.target) ?? e.target}
                      </div>
                      <div style={{ color: '#64748b', marginTop: 2 }}>
                        {e.label ?? e.type}
                        {e.uncertain && <span style={{ color: '#b45309', marginLeft: 6, fontWeight: 600 }}>Usikker</span>}
                      </div>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </>
        )}
      </aside>
    );
  }

  if (selected.kind === 'node') {
    const node = selected.item;
    const incoming = doc.edges.filter((e) => e.target === node.id);
    const outgoing = doc.edges.filter((e) => e.source === node.id);
    const nodeLabelById = new Map(doc.nodes.map((n) => [n.id, n.label]));
    const steps = computeEdgeSteps(doc);

    return (
      <aside style={panelStyle}>
        <SectionLabel>Node</SectionLabel>
        <TitleRow label={node.label} type={node.type} uncertain={node.uncertain} />
        {node.summary && <Paragraphs text={node.summary} marginTop={8} />}
        {node.uncertain && (
          <UncertainNote>Denne noden er markert som usikker av agenten.</UncertainNote>
        )}

        <SubHeading>Inn ({incoming.length})</SubHeading>
        {incoming.length === 0 ? (
          <Empty>Ingen innkommende kanter.</Empty>
        ) : (
          <EdgeList edges={incoming} labelFor={(id) => nodeLabelById.get(id) ?? id} onHighlightEdge={onHighlightEdge} highlightedEdgeId={highlightedEdgeId} direction="in" steps={steps} />
        )}

        <SubHeading>Ut ({outgoing.length})</SubHeading>
        {outgoing.length === 0 ? (
          <Empty>Ingen utgående kanter.</Empty>
        ) : (
          <EdgeList edges={outgoing} labelFor={(id) => nodeLabelById.get(id) ?? id} onHighlightEdge={onHighlightEdge} highlightedEdgeId={highlightedEdgeId} direction="out" steps={steps} />
        )}

        <SubHeading>Evidens</SubHeading>
        <EvidenceList evidence={node.evidence} />
      </aside>
    );
  }

  // selected.kind === 'edge'
  const edge = selected.item;
  const nodeLabelById = new Map(doc.nodes.map((n) => [n.id, n.label]));
  const edgeStep = computeEdgeSteps(doc).get(edge.id);

  return (
    <aside style={panelStyle}>
      <SectionLabel>Kant</SectionLabel>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StepBadge step={edgeStep} />
        <TitleRow label={edge.label ?? edge.id} type={edge.type} uncertain={edge.uncertain} />
      </div>
      <p style={{ fontSize: 13, color: '#334155', marginTop: 8 }}>
        <strong>{nodeLabelById.get(edge.source) ?? edge.source}</strong>
        {' → '}
        <strong>{nodeLabelById.get(edge.target) ?? edge.target}</strong>
      </p>
      {edge.uncertain && (
        <UncertainNote>Denne koblingen er markert som usikker av agenten — ikke 100 % bekreftet i kode.</UncertainNote>
      )}
      <SubHeading>Evidens</SubHeading>
      <EvidenceList evidence={edge.evidence} />
    </aside>
  );
}

function edgeButtonStyle(e: FlowEdge, active: boolean, clickable: boolean): React.CSSProperties {
  return {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    textAlign: 'left',
    fontSize: 12,
    background: active ? '#fffbeb' : '#f8fafc',
    border: `${active ? 2 : 1}px solid ${active || e.uncertain ? '#f59e0b' : '#e2e8f0'}`,
    borderStyle: e.uncertain && !active ? 'dashed' : 'solid',
    borderRadius: 6,
    padding: active ? '5px 7px' : '6px 8px',
    cursor: clickable ? 'pointer' : 'default',
  };
}

function EdgeList({
  edges,
  labelFor,
  onHighlightEdge,
  highlightedEdgeId,
  direction,
  steps,
}: {
  edges: FlowEdge[];
  labelFor: (id: string) => string;
  onHighlightEdge?: (edge: FlowEdge) => void;
  highlightedEdgeId?: string | null;
  direction: 'in' | 'out';
  steps: Map<string, number>;
}) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '4px 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {edges.map((e) => (
        <li key={e.id}>
          <button
            type="button"
            onClick={() => onHighlightEdge?.(e)}
            aria-pressed={e.id === highlightedEdgeId}
            style={edgeButtonStyle(e, e.id === highlightedEdgeId, !!onHighlightEdge)}
          >
            <StepBadge step={steps.get(e.id)} />
            <span>
              <div style={{ color: '#1e293b', fontWeight: 500 }}>{e.label ?? e.type}</div>
              <div style={{ color: '#64748b', marginTop: 2 }}>
                {direction === 'in' ? `fra ${labelFor(e.source)}` : `til ${labelFor(e.target)}`}
                {e.uncertain && <span style={{ color: '#b45309', marginLeft: 6, fontWeight: 600 }}>Usikker</span>}
              </div>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function EvidenceList({ evidence }: { evidence: FlowNode['evidence'] }) {
  if (evidence.length === 0) {
    return <Empty>Ingen evidens oppgitt.</Empty>;
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '4px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {evidence.map((ev, i) => (
        <li
          key={i}
          style={{
            fontSize: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            padding: '6px 8px',
          }}
        >
          <div style={{ fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all' }}>
            {ev.file}
            {ev.line !== undefined ? `:${ev.line}` : ''}
          </div>
          {ev.symbol && <div style={{ color: '#475569' }}>symbol: {ev.symbol}</div>}
          {ev.note && <div style={{ color: '#475569' }}>{ev.note}</div>}
        </li>
      ))}
    </ul>
  );
}

function Paragraphs({ text, marginTop = 0 }: { text: string; marginTop?: number }) {
  // Splitt agent-generert tekst på tomme linjer (avsnitt) eller enkeltlinjer,
  // og render hvert avsnitt som egen <p>. Alt er fortsatt vanlig, escaped
  // React-tekst — ingen markup tolkes.
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const items = paragraphs.length > 0 ? paragraphs : [text];
  return (
    <div style={{ marginTop }}>
      {items.map((p, i) => (
        <p key={i} style={{ fontSize: 13, color: '#334155', lineHeight: 1.55, margin: i === 0 ? 0 : '8px 0 0' }}>
          {p}
        </p>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 4 }}>
      {children}
    </div>
  );
}

/**
 * Liten, rund tallmerke som viser en kants steg-nummer — samme tall som
 * vises på selve pilen i diagrammet (se `lib/flowSteps.ts`), slik at en
 * leser kan gå mellom denne listen og skissen og vite nøyaktig hvilken
 * pil de ser på.
 */
function StepBadge({ step }: { step: number | undefined }) {
  if (step === undefined) return null;
  return (
    <span
      aria-hidden="true"
      style={{
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: '#334155',
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {step}
    </span>
  );
}

function TitleRow({ label, type, uncertain }: { label: string; type: string; uncertain: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <h2 style={{ fontSize: 16, margin: 0 }}>{label}</h2>
      <span style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', borderRadius: 4, padding: '2px 6px' }}>
        {type}
      </span>
      {uncertain && (
        <span style={{ fontSize: 11, color: '#b45309', fontWeight: 600 }}>Usikker</span>
      )}
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 12, margin: '14px 0 6px', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3 }}>
      {children}
    </h3>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{children}</p>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 16, lineHeight: 1.4 }}>{children}</p>;
}

function UncertainNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 12,
        color: '#92400e',
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: 6,
        padding: '6px 8px',
        marginTop: 8,
      }}
    >
      {children}
    </p>
  );
}

const panelStyle: React.CSSProperties = {
  width: 380,
  borderLeft: '1px solid #e2e8f0',
  padding: 16,
  paddingRight: 40,
  overflowY: 'auto',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};
