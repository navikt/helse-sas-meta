export const EDGE_TYPE_COLOR: Record<string, string> = {
  behov: '#6366f1',
  løsning: '#22c55e',
  event: '#c026d3',
  call: '#0ea5e9',
  read: '#64748b',
  write: '#64748b',
  flow: '#94a3b8',
};

export const EDGE_TYPE_LABEL: Record<string, string> = {
  behov: 'behov – en app uttrykker behov for data/beregning',
  løsning: 'løsning – en behovsbesvarer leverer svaret',
  event: 'event – en hendelse publiseres/konsumeres',
  call: 'call – direkte synkront kall (f.eks. HTTP)',
  read: 'read – leser fra en database/kilde',
  write: 'write – skriver til en database/kilde',
  flow: 'flow – generell rekkefølge/prosess-steg',
};
