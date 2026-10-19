import { useState } from 'react';
import { Panel } from '@xyflow/react';
import type { NodeType } from '../schema/flow';
import { NODE_TYPE_STYLES } from './FlowNodeCard';
import { EDGE_TYPE_COLOR, EDGE_TYPE_LABEL } from '../styles/edgeTypeStyles';
import { DRAFT_COLOR } from '../lib/drafts';

/**
 * Kort tegnforklaring for boks-typer, kant-typer og de
 * to spesielle visuelle markørene (stiplet kant/boks = "uncertain", altså
 * at arkitekturagenten selv er usikker på om denne delen av flyten stemmer).
 * Er minimert som standard og åpnes ved behov.
 * Rendres som et `Panel` inne i selve React Flow-canvaset (samme mekanisme
 * som `Controls`/`MiniMap`), slik at den flytter seg med zoom/pan uten å
 * konkurrere med resten av UI-et rundt.
 */

const NODE_TYPE_ORDER: NodeType[] = [
  'service',
  'process',
  'decision',
  'event',
  'external',
  'database',
  'frontend',
];

const NODE_TYPE_LABEL: Record<NodeType, string> = {
  service: 'Tjeneste/applikasjon',
  process: 'Funksjonelt steg/delprosess',
  decision: 'Beslutningspunkt',
  event: 'Sentral hendelse (eget element, f.eks. fan-out)',
  external: 'Eksternt system',
  database: 'Database',
  frontend: 'Frontend/brukerhandling',
};

const EDGE_TYPE_ORDER = ['behov', 'løsning', 'event', 'call', 'read', 'write', 'flow'];

export function Legend() {
  const [open, setOpen] = useState(false);

  return (
    <Panel position="top-left">
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: 12,
          color: '#334155',
          maxWidth: 260,
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            color: '#334155',
          }}
          aria-expanded={open}
        >
          <span>Tegnforklaring</span>
          <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        </button>

        {open && (
          <div
            style={{
              padding: '0 10px 10px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              maxHeight: 'calc(100vh - 180px)',
              overflowY: 'auto',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#64748b', textTransform: 'uppercase', fontSize: 10 }}>
                Bokser (noder)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {NODE_TYPE_ORDER.map((type) => {
                  const style = NODE_TYPE_STYLES[type];
                  return (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {type === 'database' ? (
                        <svg width="14" height="16" aria-hidden="true" style={{ flexShrink: 0 }}>
                          <path
                            d="M 1 4 A 6 3 0 0 1 13 4 L 13 12 A 6 3 0 0 1 1 12 Z"
                            fill={style.bg}
                            stroke={style.border}
                            strokeWidth="1.5"
                          />
                          <path d="M 1 4 A 6 3 0 0 0 13 4" fill="none" stroke={style.border} strokeWidth="1.5" />
                        </svg>
                      ) : type === 'decision' ? (
                        <svg width="16" height="14" aria-hidden="true" style={{ flexShrink: 0 }}>
                          <polygon
                            points="4,1 12,1 15,7 12,13 4,13 1,7"
                            fill={style.bg}
                            stroke={style.border}
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <span
                          aria-hidden="true"
                          style={{
                            display: 'inline-block',
                            width: 14,
                            height: 14,
                            borderRadius: 3,
                            background: style.bg,
                            border: `2px solid ${style.border}`,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span>{NODE_TYPE_LABEL[type]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#64748b', textTransform: 'uppercase', fontSize: 10 }}>
                Piler (kanter)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {EDGE_TYPE_ORDER.map((type) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      aria-hidden="true"
                      style={{
                        display: 'inline-block',
                        width: 16,
                        height: 2,
                        background: EDGE_TYPE_COLOR[type] ?? '#94a3b8',
                        flexShrink: 0,
                      }}
                    />
                    <span>{EDGE_TYPE_LABEL[type] ?? type}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 6, color: '#64748b' }}>
                Tallet foran hver pil-label (f.eks. "1 · ...") viser
                rekkefølgen — samme tall finner du igjen i
                "Rekkefølge"-listen i forklaringspanelet.
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#64748b', textTransform: 'uppercase', fontSize: 10 }}>
                Usikkerhet
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: '#ffffff',
                      border: '2px dashed #94a3b8',
                      flexShrink: 0,
                    }}
                  />
                  <span>Stiplet boks = usikker node</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="6" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <line x1="0" y1="3" x2="16" y2="3" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
                  </svg>
                  <span>Stiplet pil = usikker kant</span>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#64748b', textTransform: 'uppercase', fontSize: 10 }}>
                Forslag
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: 'repeating-linear-gradient(135deg, #faf5ff, #faf5ff 3px, #f3e8ff 3px, #f3e8ff 6px)',
                      border: `2px dashed ${DRAFT_COLOR}`,
                      flexShrink: 0,
                    }}
                  />
                  <span>Lilla, skravert boks = forslag, finnes ikke i dag</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="6" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <line x1="0" y1="3" x2="16" y2="3" stroke={DRAFT_COLOR} strokeWidth="2" strokeDasharray="4 3" />
                  </svg>
                  <span>Lilla stiplet pil = foreslått kobling</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
