import { useEffect, useState } from 'react';
import '@xyflow/react/dist/style.css';
import './reactflow-overrides.css';
import { FlowPanel } from './components/FlowPanel';

const SPORHUND_OUTBOX_FLOW = 'sporhund-outbox-flyt.flow.json';
const VILKARSPROVING_OUTBOX_FLOW = 'sp-vilkarsproving-outbox-flyt.flow.json';

export function App() {
  const [files, setFiles] = useState<string[]>([]);
  // "Sammenlign to flyter": viser to uavhengige diagram-paneler stablet på
  // samme side, hvert med sitt eget filvalg. Brukes bl.a. til å sette
  // eksisterende og planlagt outbox-mønster (sporhund vs. sp-vilkårsprøving)
  // side om side uten at de påvirker hverandre.
  const [compareMode, setCompareMode] = useState(false);

  // Hent listen over tilgjengelige *.flow.json-filer fra det lokale
  // dev-server-endepunktet (se vite.config.ts). Ingen eksterne kall.
  useEffect(() => {
    fetch('/api/flows')
      .then((r) => r.json())
      .then((list: string[]) => setFiles(list))
      .catch(() => setFiles([]));
  }, []);

  const canCompareOutboxFlows =
    files.includes(SPORHUND_OUTBOX_FLOW) && files.includes(VILKARSPROVING_OUTBOX_FLOW);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/*
        Gjør React Flows innebygde "reconnect"-ankre (de usynlige punktene
        der en pil kan gripes og dras til et annet tilkoblingspunkt) synlige
        ved hover, slik at brukeren ser at kant-endepunktet faktisk kan
        flyttes. Selve dra-funksjonaliteten kommer fra edgesReconnectable +
        onReconnect i FlowPanel, ikke fra denne stylingen. Gjelder alle
        React Flow-instanser på siden (også i sammenlign-modus).
      */}
      <style>{`
        .react-flow__edge-updater:hover {
          stroke: #2563eb !important;
          stroke-width: 6px !important;
          fill: rgba(37, 99, 235, 0.15) !important;
          cursor: grab;
        }
        .react-flow__edge-updater:active {
          cursor: grabbing;
        }
      `}</style>
      <header style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <strong style={{ fontSize: 15 }}>Arkitektur-viewer</strong>
        <label style={{ fontSize: 13, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <input
            type="checkbox"
            checked={compareMode}
            onChange={(e) => setCompareMode(e.target.checked)}
          />
          Sammenlign to flyter
        </label>
      </header>

      {compareMode ? (
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{ flex: 1, minWidth: 0, borderRight: '1px solid #e2e8f0' }}>
            <FlowPanel
              files={files}
              defaultFile={canCompareOutboxFlows ? SPORHUND_OUTBOX_FLOW : files[0]}
              title="Eksisterende"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FlowPanel
              files={files}
              defaultFile={canCompareOutboxFlows ? VILKARSPROVING_OUTBOX_FLOW : (files[1] ?? files[0])}
              title="Planlagt"
            />
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0 }}>
          <FlowPanel files={files} />
        </div>
      )}
    </div>
  );
}
