import { describe, expect, it } from 'vitest';
import { FlowDocumentSchema, parseFlowDocument } from './flow';

function validDoc() {
  return {
    version: 1 as const,
    title: '25% avviksvurdering',
    description: 'Spesialist ber Spinnvill vurdere avvik.',
    direction: 'RIGHT' as const,
    nodes: [
      { id: 'spesialist', type: 'service', label: 'Spesialist' },
      { id: 'spinnvill', type: 'service', label: 'Spinnvill' },
    ],
    edges: [
      {
        id: 'spesialist-spinnvill',
        source: 'spesialist',
        target: 'spinnvill',
        type: 'behov',
        label: '@behov Avviksvurdering',
      },
    ],
  };
}

describe('parseFlowDocument', () => {
  it('godtar et gyldig dokument', () => {
    const result = parseFlowDocument(validDoc());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.nodes).toHaveLength(2);
      expect(result.data.edges).toHaveLength(1);
      // defaults blir satt
      expect(result.data.nodes[0]?.uncertain).toBe(false);
      expect(result.data.nodes[0]?.evidence).toEqual([]);
    }
  });

  it('avviser duplicate node id med presis path', () => {
    const doc = validDoc();
    doc.nodes.push({ id: 'spesialist', type: 'service', label: 'Duplikat' });
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const err = result.errors.find((e) => e.message.includes('Duplikat node-id'));
      expect(err).toBeDefined();
      expect(err?.path).toEqual(['nodes', 2, 'id']);
    }
  });

  it('avviser duplicate edge id med presis path', () => {
    const doc = validDoc();
    doc.edges.push({ ...doc.edges[0]!, id: doc.edges[0]!.id });
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const err = result.errors.find((e) => e.message.includes('Duplikat edge-id'));
      expect(err).toBeDefined();
      expect(err?.path).toEqual(['edges', 1, 'id']);
    }
  });

  it('avviser edge med ukjent source med presis path', () => {
    const doc = validDoc();
    doc.edges[0]!.source = 'ukjent-node';
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const err = result.errors.find((e) => e.message.includes('ukjent source-node'));
      expect(err).toBeDefined();
      expect(err?.path).toEqual(['edges', 0, 'source']);
    }
  });

  it('avviser edge med ukjent target med presis path', () => {
    const doc = validDoc();
    doc.edges[0]!.target = 'ukjent-node';
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const err = result.errors.find((e) => e.message.includes('ukjent target-node'));
      expect(err).toBeDefined();
      expect(err?.path).toEqual(['edges', 0, 'target']);
    }
  });

  it('godtar self-loop edges (kan være gyldig for retry/republisering)', () => {
    const doc = validDoc();
    doc.edges[0]!.source = 'spesialist';
    doc.edges[0]!.target = 'spesialist';
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(true);
  });

  it('avviser ukjente felter pga .strict()', () => {
    const doc: Record<string, unknown> = validDoc();
    doc.unknownTopLevelField = 'oops';
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser ukjente felter på node-nivå', () => {
    const doc = validDoc();
    (doc.nodes[0] as Record<string, unknown>).extra = 'not allowed';
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser ukjente felter på evidence-nivå', () => {
    const doc = validDoc();
    (doc.nodes[0] as Record<string, unknown>).evidence = [
      { file: 'src/Foo.kt', line: 1, extra: 'nope' },
    ];
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser for mange nodes', () => {
    const doc = validDoc();
    doc.nodes = Array.from({ length: 201 }, (_, i) => ({
      id: `n${i}`,
      type: 'service' as const,
      label: `Node ${i}`,
    }));
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser for mange edges', () => {
    const doc = validDoc() as unknown as Record<string, unknown>;
    doc.nodes = [
      { id: 'a', type: 'service', label: 'A' },
      { id: 'b', type: 'service', label: 'B' },
    ];
    doc.edges = Array.from({ length: 501 }, (_, i) => ({
      id: `e${i}`,
      source: 'a',
      target: 'b',
      type: 'flow' as const,
    }));
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser for mange evidence-elementer på én node', () => {
    const doc = validDoc();
    (doc.nodes[0] as Record<string, unknown>).evidence = Array.from({ length: 21 }, (_, i) => ({
      file: `src/File${i}.kt`,
      line: i + 1,
    }));
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser ugyldig id (mellomrom/spesialtegn)', () => {
    const doc = validDoc();
    doc.nodes[0]!.id = 'ugyldig id!';
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser for lang id', () => {
    const doc = validDoc();
    doc.nodes[0]!.id = 'a'.repeat(101);
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser absolutt evidence path (unix)', () => {
    const doc = validDoc();
    (doc.nodes[0] as Record<string, unknown>).evidence = [{ file: '/etc/passwd', line: 1 }];
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser absolutt evidence path (windows)', () => {
    const doc = validDoc();
    (doc.nodes[0] as Record<string, unknown>).evidence = [
      { file: 'C:\\Windows\\System32\\evil.kt', line: 1 },
    ];
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser evidence path med ".."', () => {
    const doc = validDoc();
    (doc.nodes[0] as Record<string, unknown>).evidence = [
      { file: '../../etc/passwd', line: 1 },
    ];
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser evidence path med "~"', () => {
    const doc = validDoc();
    (doc.nodes[0] as Record<string, unknown>).evidence = [{ file: '~/secrets.kt', line: 1 }];
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser URL i evidence.file', () => {
    const doc = validDoc();
    (doc.nodes[0] as Record<string, unknown>).evidence = [
      { file: 'https://example.com/evil.kt', line: 1 },
    ];
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser file: URI i evidence.file', () => {
    const doc = validDoc();
    (doc.nodes[0] as Record<string, unknown>).evidence = [
      { file: 'file:///etc/passwd', line: 1 },
    ];
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser kontrolltegn i evidence.file', () => {
    const doc = validDoc();
    (doc.nodes[0] as Record<string, unknown>).evidence = [
      { file: 'src/Foo\u0000.kt', line: 1 },
    ];
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser whitespace-only evidence.file', () => {
    const doc = validDoc();
    (doc.nodes[0] as Record<string, unknown>).evidence = [{ file: '   ', line: 1 }];
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('godtar gyldig repo-relativ evidence path', () => {
    const doc = validDoc();
    (doc.nodes[0] as Record<string, unknown>).evidence = [
      { file: 'spesialist/spesialist-kafka/src/main/kotlin/Foo.kt', line: 42, symbol: 'Foo.bar()' },
    ];
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(true);
  });

  it('godtar eksplisitt step-nummer på en kant', () => {
    const doc = validDoc();
    (doc.edges[0] as Record<string, unknown>).step = 3;
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.edges[0]?.step).toBe(3);
    }
  });

  it('tillater flere kanter med samme step (parallelt fan-out)', () => {
    const doc = validDoc();
    doc.nodes.push({ id: 'sparkel', type: 'service', label: 'Sparkel' });
    (doc.edges[0] as Record<string, unknown>).step = 1;
    doc.edges.push({
      id: 'spesialist-sparkel',
      source: 'spesialist',
      target: 'sparkel',
      type: 'behov',
      label: '@behov Inntekt',
      step: 1,
    } as (typeof doc.edges)[number] & { step: number });
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(true);
  });

  it('avviser negativt eller null step', () => {
    const doc = validDoc();
    (doc.edges[0] as Record<string, unknown>).step = 0;
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('avviser step som ikke er et heltall', () => {
    const doc = validDoc();
    (doc.edges[0] as Record<string, unknown>).step = 1.5;
    const result = parseFlowDocument(doc);
    expect(result.ok).toBe(false);
  });

  it('FlowDocumentSchema kan brukes direkte for rå shape-validering', () => {
    const result = FlowDocumentSchema.safeParse(validDoc());
    expect(result.success).toBe(true);
  });
});
