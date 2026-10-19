import { useEffect, useRef, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeTypeSchema, type NodeType } from '../schema/flow';
import type { PortSide } from '../layout/elkLayout';
import { DRAFT_COLOR, DRAFT_NODE_SIZE, type DraftNode } from '../lib/drafts';
import { CYLINDER_RIM } from '../lib/cylinder';
import { CylinderShape, cylinderHandleOffset } from './CylinderShape';
import { HEXAGON_PADDING, HexagonShape, hexagonHandleStyle } from './HexagonShape';
import { NODE_TYPE_STYLES, type NodePort } from './FlowNodeCard';

/**
 * En boks brukeren har tegnet selv som FORSLAG til endring — finnes ikke i
 * systemet i dag. Markeres tydelig: lilla stiplet ramme, skravert bakgrunn
 * og et «FORSLAG»-merke. Dobbeltklikk for å endre navn og type.
 *
 * SIKKERHET: label er brukerinput og rendres kun som vanlig React-tekst.
 */
export interface DraftNodeData {
  draft: DraftNode;
  freeSlots: NodePort[];
  showFreeSlots?: boolean;
  occupiedSlotIds?: string[];
  drawMode?: boolean;
  /** Åpne redigering med en gang (nylig opprettet boks). */
  startEditing?: boolean;
  onUpdate?: (id: string, patch: Partial<Pick<DraftNode, 'label' | 'type'>>) => void;
  [key: string]: unknown;
}

const POSITION_BY_SIDE: Record<PortSide, Position> = {
  NORTH: Position.Top,
  SOUTH: Position.Bottom,
  EAST: Position.Right,
  WEST: Position.Left,
};

const TYPE_OPTIONS: readonly NodeType[] = NodeTypeSchema.options;

export function DraftNodeCard({ data, selected }: { data: DraftNodeData; selected?: boolean }) {
  const { draft, freeSlots, showFreeSlots, occupiedSlotIds, drawMode, startEditing, onUpdate } = data;
  const [editing, setEditing] = useState(!!startEditing);
  const [label, setLabel] = useState(draft.label);
  const [type, setType] = useState<NodeType>(draft.type);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    onUpdate?.(draft.id, { label: label.trim() || 'Ny boks', type });
    setEditing(false);
  };

  const isCylinder = draft.type === 'database';
  const isHexagon = draft.type === 'decision';
  const shaped = isCylinder || isHexagon;
  const handleStyle = (slot: NodePort): React.CSSProperties => {
    const pct = `${Math.min(100, Math.max(0, slot.pctAlongSide))}%`;
    const visible = (showFreeSlots || drawMode) && !occupiedSlotIds?.includes(slot.id);
    return {
      ...(slot.side === 'NORTH' || slot.side === 'SOUTH' ? { left: pct } : { top: pct }),
      width: 7,
      height: 7,
      background: DRAFT_COLOR,
      border: '1px solid #ffffff',
      opacity: visible ? (showFreeSlots ? 0.9 : 0.45) : 0,
      pointerEvents: drawMode ? 'all' : 'none',
      ...(isCylinder ? cylinderHandleOffset(slot.side, slot.pctAlongSide) : {}),
      ...(isHexagon
        ? hexagonHandleStyle(slot.side, slot.pctAlongSide, DRAFT_NODE_SIZE.width, DRAFT_NODE_SIZE.height)
        : {}),
    };
  };

  const typeStyle = NODE_TYPE_STYLES[draft.type];

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        border: shaped ? 'none' : `2px dashed ${DRAFT_COLOR}`,
        borderRadius: 10,
        padding: isCylinder ? `${CYLINDER_RIM * 2 + 1}px 12px ${CYLINDER_RIM}px` : isHexagon ? HEXAGON_PADDING : '8px 12px',
        background: shaped
          ? 'transparent'
          : `repeating-linear-gradient(135deg, #faf5ff, #faf5ff 8px, #f3e8ff 8px, #f3e8ff 16px)`,
        boxShadow: shaped ? 'none' : selected ? `0 0 0 3px rgba(124, 58, 237, 0.3)` : '0 1px 3px rgba(0,0,0,0.08)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        position: 'relative',
      }}
      title="Forslag – finnes ikke i systemet i dag. Dobbeltklikk for å redigere."
    >
      {isCylinder && (
        <CylinderShape
          width={DRAFT_NODE_SIZE.width}
          height={DRAFT_NODE_SIZE.height}
          fill="#f3e8ff"
          stroke={DRAFT_COLOR}
          dashed
          glow={selected ? 'rgba(124, 58, 237, 0.5)' : undefined}
        />
      )}
      {isHexagon && (
        <HexagonShape
          width={DRAFT_NODE_SIZE.width}
          height={DRAFT_NODE_SIZE.height}
          fill="#f3e8ff"
          stroke={DRAFT_COLOR}
          dashed
          glow={selected ? 'rgba(124, 58, 237, 0.5)' : undefined}
        />
      )}
      {freeSlots.map((slot) => (
        <Handle
          key={`${slot.id}-target`}
          type="target"
          id={slot.id}
          position={POSITION_BY_SIDE[slot.side]}
          style={handleStyle(slot)}
        />
      ))}
      {/* Source øverst, så en ny kobling starter i riktig ende. */}
      {freeSlots.map((slot) => (
        <Handle key={slot.id} type="source" id={slot.id} position={POSITION_BY_SIDE[slot.side]} style={handleStyle(slot)} />
      ))}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span aria-hidden="true">{typeStyle.icon}</span>
        <span style={{ fontSize: 10, textTransform: 'uppercase', color: '#64748b', letterSpacing: 0.4 }}>{draft.type}</span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: '#ffffff',
            background: DRAFT_COLOR,
            borderRadius: 4,
            padding: '1px 5px',
          }}
        >
          FORSLAG
        </span>
      </div>

      {editing ? (
        <div className="nodrag" style={{ position: 'relative', display: 'flex', gap: 4, marginTop: 4 }}>
          <input
            ref={inputRef}
            value={label}
            aria-label="Navn på boks"
            maxLength={120}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') {
                setLabel(draft.label);
                setType(draft.type);
                setEditing(false);
              }
            }}
            style={{ flex: 1, minWidth: 0, fontSize: 12, padding: '2px 4px' }}
          />
          <select
            value={type}
            aria-label="Type boks"
            onChange={(e) => setType(e.target.value as NodeType)}
            onKeyDown={(e) => e.stopPropagation()}
            style={{ fontSize: 11 }}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button type="button" onClick={commit} style={{ fontSize: 11 }}>
            OK
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative', fontSize: 14, fontWeight: 600, marginTop: 4, color: '#3b0764' }}>{draft.label}</div>
      )}
    </div>
  );
}
