import { describe, expect, it } from 'vitest';
import { isConnectionFree, isHandleOccupied } from './handleOccupancy';

const edges = [
  { id: 'e1', source: 'a', target: 'b', sourceHandle: 'p1', targetHandle: 'p2' },
  { id: 'e2', source: 'b', target: 'c', sourceHandle: 'p3', targetHandle: 'p4' },
];

describe('isHandleOccupied', () => {
  it('detects a handle used as source', () => {
    expect(isHandleOccupied(edges, 'a', 'p1')).toBe(true);
  });

  it('detects a handle used as target', () => {
    expect(isHandleOccupied(edges, 'b', 'p2')).toBe(true);
  });

  it('ignores the edge being reconnected', () => {
    expect(isHandleOccupied(edges, 'b', 'p2', 'e1')).toBe(false);
  });

  it('distinguishes nodes with the same handle id', () => {
    expect(isHandleOccupied(edges, 'c', 'p1')).toBe(false);
  });
});

describe('isConnectionFree', () => {
  it('rejects reconnecting onto a point used by another edge', () => {
    expect(isConnectionFree(edges, { source: 'a', target: 'b', sourceHandle: 'p1', targetHandle: 'p3' }, 'e1')).toBe(
      false
    );
  });

  it('allows keeping its own point', () => {
    expect(isConnectionFree(edges, { source: 'a', target: 'b', sourceHandle: 'p1', targetHandle: 'p2' }, 'e1')).toBe(
      true
    );
  });

  it('allows a free point', () => {
    expect(isConnectionFree(edges, { source: 'a', target: 'c', sourceHandle: 'p1', targetHandle: 'p9' }, 'e1')).toBe(
      true
    );
  });
});
