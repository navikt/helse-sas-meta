/**
 * Ramme rundt noder som hører til samme app (se `lib/appGroups.ts`). Rendres
 * som en egen, ikke-interaktiv React Flow-node bak boksene. Størrelsen
 * beregnes av `FlowPanel` ut fra medlemmenes live posisjon, så rammen følger
 * med når boksene dras.
 *
 * SIKKERHET: `label` kan være agent-generert tekst og rendres kun som
 * escaped React-tekst.
 */
export interface AppGroupFrameData extends Record<string, unknown> {
  label: string;
  dimmed?: boolean;
}

export function AppGroupFrame({ data }: { data: AppGroupFrameData }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        border: '1.5px dashed #94a3b8',
        borderRadius: 14,
        background: 'rgba(241, 245, 249, 0.55)',
        opacity: data.dimmed ? 0.4 : 1,
        transition: 'opacity 150ms ease',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: 12,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          color: '#475569',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          whiteSpace: 'nowrap',
        }}
      >
        App: {data.label}
      </div>
    </div>
  );
}
