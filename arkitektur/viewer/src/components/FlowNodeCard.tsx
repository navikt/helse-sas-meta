import { Handle, Position } from '@xyflow/react';
import type { FlowNode, NodeType } from '../schema/flow';
import type { PortSide } from '../layout/elkLayout';
import { CylinderShape, cylinderHandleOffset } from './CylinderShape';
import { CYLINDER_RIM } from '../lib/cylinder';
import { HEXAGON_PADDING, HexagonShape, hexagonHandleStyle } from './HexagonShape';

/**
 * SIKKERHET: `label`, `summary`, `symbol`/`note` i evidence er alltid
 * agent-generert (LLM) tekst og skal behandles som untrusted input. Alt
 * rendres her som vanlig React-tekst-child (automatisk escaped av React).
 * IKKE bruk `dangerouslySetInnerHTML` eller andre markup-tolkende
 * rendering-metoder for disse feltene noe sted i vieweren.
 */

export const NODE_TYPE_STYLES: Record<NodeType, { bg: string; border: string; icon: string }> = {
  service: { bg: '#eef2ff', border: '#6366f1', icon: '🧩' },
  process: { bg: '#f0fdf4', border: '#22c55e', icon: '⚙️' },
  decision: { bg: '#fffbeb', border: '#f59e0b', icon: '❓' },
  event: { bg: '#fdf4ff', border: '#c026d3', icon: '⚡' },
  external: { bg: '#f1f5f9', border: '#64748b', icon: '🌐' },
  database: { bg: '#ecfeff', border: '#0891b2', icon: '🗄️' },
  frontend: { bg: '#fff1f2', border: '#e11d48', icon: '🖥️' },
};

// Handlene er kun visuelle markører for hvor en kant kan feste seg – selve
// dra-og-slipp-interaksjonen for å flytte et kant-endepunkt håndteres av
// React Flows innebygde "reconnect"-ankre (se edgesReconnectable/onReconnect
// i FlowPanel.tsx), som ligger i et eget lag under nodene. Handlene her har
// derfor `pointerEvents: 'none'` slik at museklikk helt inntil boks-kanten
// går videre til reconnect-ankeret i stedet for å bli fanget opp av handlen
// selv (som ellers alltid ville startet en *ny* forbindelse i stedet for å
// la brukeren flytte den eksisterende pilen).
const HANDLE_STYLE: React.CSSProperties = {
  width: 8,
  height: 8,
  background: '#94a3b8',
  border: '1px solid #ffffff',
  opacity: 0.6,
  pointerEvents: 'none',
};

const POSITION_BY_SIDE: Record<PortSide, Position> = {
  NORTH: Position.Top,
  SOUTH: Position.Bottom,
  EAST: Position.Right,
  WEST: Position.Left,
};

function portStyle(side: PortSide, pctAlongSide: number): React.CSSProperties {
  const pct = Math.min(100, Math.max(0, pctAlongSide));
  return side === 'NORTH' || side === 'SOUTH'
    ? { ...HANDLE_STYLE, left: `${pct}%` }
    : { ...HANDLE_STYLE, top: `${pct}%` };
}

/**
 * Ett tilkoblingspunkt på denne noden, slik ELK selv plasserte det under
 * layout (se `layout/elkLayout.ts`: `portConstraints: FIXED_SIDE` +
 * `portAlignment.default: DISTRIBUTED`). Erstatter det tidligere,
 * frittstående klient-side "slot"-systemet — ELKs egen port-modell er nå
 * eneste kilde til hvor en kant fester seg på boksen, så det er umulig for
 * layoutet og de faktisk rendrede håndtakene å komme i utakt med hverandre.
 */
export interface NodePort {
  id: string;
  side: PortSide;
  /** Posisjon langs siden, 0-100 (prosent), beregnet av FlowPanel ut fra
   * ELKs absolutte port-koordinat relativt til nodens boks. */
  pctAlongSide: number;
}

export interface FlowNodeData {
  flowNode: FlowNode;
  /** Porter ELK genererte for denne noden (én per tilkoblet kant-ende). */
  ports?: NodePort[];
  /** Ledige tilkoblingspunkter på alle fire sider (se `lib/freeSlots.ts`),
   * slik at en kant kan kobles om til en side uten eksisterende porter. */
  freeSlots?: NodePort[];
  /** Satt mens brukeren drar et kant-endepunkt: viser de ledige punktene. */
  showFreeSlots?: boolean;
  /** Ledige punkter som en annen kant allerede bruker (skjules). */
  occupiedSlotIds?: string[];
  /** Tegnemodus for forslag: ledige punkter vises svakt og kan dras fra
   * for å tegne en ny kobling. */
  drawMode?: boolean;
  /**
   * Satt til `true` når noden er del av gjeldende valgt steg (enten valgt
   * direkte, eller kilde/mål for en valgt kant) — f.eks. etter klikk i
   * "Rekkefølge"-listen i forklaringspanelet. Gir en tydelig visuell
   * fremheving slik at brukeren finner igjen steget i skissen.
   */
  highlighted?: boolean;
  /** Størrelsen ELK ga noden (brukes til å tegne sylinderen for databaser). */
  size?: { width: number; height: number };
  /**
   * Satt til `true` når NOE annet er valgt (node eller kant), men denne
   * noden IKKE er en del av det — toner ned resten av diagrammet slik at
   * den fremhevede delen skiller seg tydeligere ut.
   */
  dimmed?: boolean;
  [key: string]: unknown;
}

export function FlowNodeCard({ data }: { data: FlowNodeData }) {
  const { flowNode, ports, freeSlots, showFreeSlots, occupiedSlotIds, drawMode, highlighted, dimmed } = data;
  const style = NODE_TYPE_STYLES[flowNode.type];
  const isDecision = flowNode.type === 'decision';
  // Databaser tegnes som sylinder når vi kjenner størrelsen.
  const cylinder = flowNode.type === 'database' && data.size ? data.size : undefined;
  // Decision tegnes som avlang sekskant.
  const hexagon = isDecision && data.size ? data.size : undefined;
  const shaped = !!(cylinder || hexagon);
  const handleStyle = (side: PortSide, pct: number): React.CSSProperties => {
    if (cylinder) return { ...portStyle(side, pct), ...cylinderHandleOffset(side, pct) };
    if (hexagon) return { ...portStyle(side, pct), ...hexagonHandleStyle(side, pct, hexagon.width, hexagon.height) };
    return portStyle(side, pct);
  };
  const freeStyle = (port: NodePort): React.CSSProperties => ({
    ...handleStyle(port.side, port.pctAlongSide),
    width: 6,
    height: 6,
    background: '#38bdf8',
    opacity: occupiedSlotIds?.includes(port.id) ? 0 : showFreeSlots ? 0.9 : drawMode ? 0.45 : 0,
    pointerEvents: drawMode ? 'all' : 'none',
    transition: 'opacity 120ms ease',
  });

  return (
    <div
      style={{
        position: 'relative',
        background: shaped ? 'transparent' : style.bg,
        border: shaped ? 'none' : `2px ${flowNode.uncertain ? 'dashed' : 'solid'} ${highlighted ? '#f59e0b' : style.border}`,
        borderRadius: '10px',
        padding: cylinder ? `${CYLINDER_RIM * 2 + 4}px 14px ${CYLINDER_RIM + 4}px` : hexagon ? HEXAGON_PADDING : '10px 14px',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        boxShadow: shaped
          ? 'none'
          : highlighted
            ? '0 0 0 3px rgba(245, 158, 11, 0.35), 0 2px 6px rgba(0,0,0,0.15)'
            : '0 1px 3px rgba(0,0,0,0.08)',
        overflow: shaped ? 'visible' : 'hidden',
        opacity: dimmed ? 0.35 : 1,
        transition: 'opacity 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
      }}
      title={flowNode.summary ?? undefined}
    >
      {cylinder && (
        <CylinderShape
          width={cylinder.width}
          height={cylinder.height}
          fill={style.bg}
          stroke={highlighted ? '#f59e0b' : style.border}
          strokeWidth={highlighted ? 3 : 2}
          dashed={flowNode.uncertain}
          glow={highlighted ? 'rgba(245, 158, 11, 0.6)' : undefined}
        />
      )}
      {hexagon && (
        <HexagonShape
          width={hexagon.width}
          height={hexagon.height}
          fill={style.bg}
          stroke={highlighted ? '#f59e0b' : style.border}
          strokeWidth={highlighted ? 3 : 2}
          dashed={flowNode.uncertain}
          glow={highlighted ? 'rgba(245, 158, 11, 0.6)' : undefined}
        />
      )}
      {/*
        Selvreferanser (source === target) rutes ikke av ELKs
        layered-algoritme og har derfor ingen ELK-port — de bruker disse to
        faste hjørne-handlene i stedet (uendret oppførsel siden tidligere).
      */}
      <Handle type="source" id="self-source" position={Position.Right} style={portStyle('EAST', 50)} />
      <Handle type="target" id="self-target" position={Position.Top} style={portStyle('NORTH', 50)} />

      {/*
        Ett handle-par (source + target) per ELK-port. Hver port tilhører i
        praksis kun ÉN kant-ende (enten kildens eller målets), men vi
        rendrer begge Handle-typene på samme id/posisjon — nøyaktig samme,
        velprøvde mønster som det forrige faste slot-systemet brukte — slik
        at React Flows reconnect-funksjonalitet fungerer uendret uansett
        hvilken rolle porten faktisk har.
      */}
      {(ports ?? []).map((port) => (
        <Handle
          key={port.id}
          type="source"
          id={port.id}
          position={POSITION_BY_SIDE[port.side]}
          style={handleStyle(port.side, port.pctAlongSide)}
        />
      ))}
      {(ports ?? []).map((port) => (
        <Handle
          key={`${port.id}-target`}
          type="target"
          id={port.id}
          position={POSITION_BY_SIDE[port.side]}
          style={handleStyle(port.side, port.pctAlongSide)}
        />
      ))}

      {/*
        Ledige punkter på alle fire sider. Usynlige til vanlig; vises mens
        en kant dras slik at brukeren ser hvor den kan slippes. Hvert punkt
        er både source og target, akkurat som ELK-portene over.
      */}
      {(freeSlots ?? []).map((slot) => (
        <Handle
          key={`${slot.id}-target`}
          type="target"
          id={slot.id}
          position={POSITION_BY_SIDE[slot.side]}
          style={freeStyle(slot)}
        />
      ))}
      {/* Source-handlene rendres sist, så de ligger øverst: en ny kobling
          dratt fra et punkt starter da i riktig ende (kilde → mål). */}
      {(freeSlots ?? []).map((slot) => (
        <Handle key={slot.id} type="source" id={slot.id} position={POSITION_BY_SIDE[slot.side]} style={freeStyle(slot)} />
      ))}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span aria-hidden="true">{style.icon}</span>
        <span style={{ fontSize: 10, textTransform: 'uppercase', color: '#64748b', letterSpacing: 0.4 }}>
          {flowNode.type}
        </span>
        {flowNode.uncertain && (
          <span style={{ fontSize: 10, color: '#b45309', fontWeight: 600 }}>Usikker</span>
        )}
      </div>
      <div style={{ position: 'relative', fontSize: 14, fontWeight: 600, marginTop: 4, color: '#1e293b' }}>
        {flowNode.label}
      </div>
      {flowNode.summary && (
        <div style={{ position: 'relative', fontSize: 11, color: '#475569', marginTop: 4, lineHeight: 1.3 }}>
          {flowNode.summary}
        </div>
      )}
    </div>
  );
}
