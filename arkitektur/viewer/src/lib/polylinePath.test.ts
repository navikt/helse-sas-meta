import { describe, expect, it } from 'vitest';
import { buildRoundedPath, distanceToPolyline, labelAnchor, orthogonalRoute, pointAtFraction, segmentCrossesBox, translatePoints, type HandleSide } from './polylinePath';

describe('buildRoundedPath', () => {
  it('returns empty string for no points', () => {
    expect(buildRoundedPath([])).toBe('');
  });

  it('returns a single move-to for one point', () => {
    expect(buildRoundedPath([{ x: 1, y: 2 }])).toBe('M 1 2');
  });

  it('returns a straight line for two points', () => {
    expect(buildRoundedPath([{ x: 0, y: 0 }, { x: 10, y: 0 }])).toBe('M 0 0 L 10 0');
  });

  it('rounds a single corner with a quadratic bezier', () => {
    const path = buildRoundedPath(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      2
    );
    expect(path).toContain('M 0 0');
    expect(path).toContain('Q 10 0');
    expect(path).toContain('L 10 10');
  });

  it('clamps the corner radius so it never exceeds half of a short segment', () => {
    // Segmentene er kun 2 lange — en radius på 10 skal klemmes ned til 1,
    // ikke krasje eller produsere en rute som overlapper naboer.
    const path = buildRoundedPath(
      [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
      ],
      10
    );
    expect(path).toMatch(/^M 0 0 L 1 0 Q 2 0 2 1 L 2 2$/);
  });

  it('handles multiple bend points in sequence', () => {
    const path = buildRoundedPath(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 10 },
      ],
      2
    );
    // To hjørner å runde av (ved punkt 2 og punkt 3).
    expect(path.match(/Q/g)?.length).toBe(2);
    expect(path.endsWith('L 20 10')).toBe(true);
  });
});

describe('pointAtFraction', () => {
  it('returns origo for no points', () => {
    expect(pointAtFraction([], 0.5)).toEqual({ x: 0, y: 0 });
  });

  it('returns the only point when there is just one', () => {
    expect(pointAtFraction([{ x: 3, y: 4 }], 0.5)).toEqual({ x: 3, y: 4 });
  });

  it('returns the start point at fraction 0', () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
    expect(pointAtFraction(points, 0)).toEqual({ x: 0, y: 0 });
  });

  it('returns the end point at fraction 1', () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
    expect(pointAtFraction(points, 1)).toEqual({ x: 10, y: 10 });
  });

  it('finds the midpoint across multiple segments by arc length', () => {
    // Totalt 20 lang (10 + 10) — midtpunktet (10) er nøyaktig ved bend-punktet.
    const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
    expect(pointAtFraction(points, 0.5)).toEqual({ x: 10, y: 0 });
  });

  it('interpolates within a segment', () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
    // 25 % av 20 total lengde = 5 inn i første segment.
    expect(pointAtFraction(points, 0.25)).toEqual({ x: 5, y: 0 });
  });

  it('handles a degenerate (zero-length) polyline gracefully', () => {
    const points = [{ x: 5, y: 5 }, { x: 5, y: 5 }];
    expect(pointAtFraction(points, 0.5)).toEqual({ x: 5, y: 5 });
  });

  it('clamps fractions outside 0..1', () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
    expect(pointAtFraction(points, -1)).toEqual({ x: 0, y: 0 });
    expect(pointAtFraction(points, 2)).toEqual({ x: 10, y: 0 });
  });
});

describe('translatePoints', () => {
  it('returns the same points unchanged when both deltas are zero', () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 5 }];
    expect(translatePoints(points, { x: 0, y: 0 }, { x: 0, y: 0 })).toEqual(points);
  });

  it('moves a single-point route by the source delta', () => {
    expect(translatePoints([{ x: 5, y: 5 }], { x: 2, y: -3 }, { x: 100, y: 100 })).toEqual([
      { x: 7, y: 2 },
    ]);
  });

  it('moves the first point fully by sourceDelta and the last fully by targetDelta', () => {
    const points = [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 }];
    const result = translatePoints(points, { x: 10, y: 0 }, { x: 0, y: 20 });
    expect(result[0]).toEqual({ x: 10, y: 0 });
    expect(result[2]).toEqual({ x: 10, y: 20 });
  });

  it('linearly blends intermediate points between source and target deltas', () => {
    const points = [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 }];
    const result = translatePoints(points, { x: 10, y: 0 }, { x: 0, y: 20 });
    // Midtpunktet (indeks 1 av 3, blend=0.5) skal ligge halvveis mellom de to
    // forskyvningene.
    expect(result[1]).toEqual({ x: 5 + 5, y: 10 });
  });
});

describe('orthogonalRoute', () => {
  it('is a straight line when boxes are aligned horizontally', () => {
    expect(orthogonalRoute({ x: 0, y: 50 }, 'right', { x: 200, y: 50 }, 'left')).toEqual([
      { x: 0, y: 50 },
      { x: 200, y: 50 },
    ]);
  });

  it('is a straight line when boxes are aligned vertically', () => {
    expect(orthogonalRoute({ x: 40, y: 0 }, 'bottom', { x: 40, y: 100 }, 'top')).toEqual([
      { x: 40, y: 0 },
      { x: 40, y: 100 },
    ]);
  });

  it('treats near-alignment as straight', () => {
    expect(orthogonalRoute({ x: 0, y: 50 }, 'right', { x: 200, y: 50.6 }, 'left')).toHaveLength(2);
  });

  it('bends with a horizontal-vertical-horizontal step when target moves down', () => {
    expect(orthogonalRoute({ x: 0, y: 50 }, 'right', { x: 200, y: 150 }, 'left')).toEqual([
      { x: 0, y: 50 },
      { x: 100, y: 50 },
      { x: 100, y: 150 },
      { x: 200, y: 150 },
    ]);
  });

  it('uses a single corner between a horizontal and vertical side', () => {
    expect(orthogonalRoute({ x: 0, y: 0 }, 'right', { x: 100, y: 100 }, 'top')).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ]);
  });

  it('produces only axis-aligned segments when target is behind source', () => {
    const route = orthogonalRoute({ x: 200, y: 0 }, 'right', { x: 0, y: 100 }, 'left');
    for (let i = 0; i < route.length - 1; i++) {
      const a = route[i]!;
      const b = route[i + 1]!;
      expect(a.x === b.x || a.y === b.y).toBe(true);
    }
  });
});

describe('orthogonalRoute rundt egne bokser', () => {
  const crosses = (route: { x: number; y: number }[], box: { x: number; y: number; width: number; height: number }) =>
    route.slice(1).some((p, i) => segmentCrossesBox(route[i]!, p, box));

  const sourceBox = { x: 0, y: 0, width: 100, height: 60 };
  const targetBox = { x: 300, y: 0, width: 100, height: 60 };
  const cases: [HandleSide, HandleSide][] = [];
  const sides: HandleSide[] = ['top', 'bottom', 'left', 'right'];
  for (const s of sides) for (const t of sides) cases.push([s, t]);

  const handle = (box: typeof sourceBox, side: HandleSide) =>
    side === 'top'
      ? { x: box.x + box.width / 2, y: box.y }
      : side === 'bottom'
        ? { x: box.x + box.width / 2, y: box.y + box.height }
        : side === 'left'
          ? { x: box.x, y: box.y + box.height / 2 }
          : { x: box.x + box.width, y: box.y + box.height / 2 };

  const offsetTarget = { x: -220, y: 40, width: 100, height: 60 };
  it.each(cases)('forskjøvet: kilde %s → mål %s går ikke gjennom egne bokser', (s, t) => {
    const route = orthogonalRoute(handle(sourceBox, s), s, handle(offsetTarget, t), t, 20, {
      source: sourceBox,
      target: offsetTarget,
    });
    expect(crosses(route, sourceBox)).toBe(false);
    expect(crosses(route, offsetTarget)).toBe(false);
  });

  it.each(cases)('kilde %s → mål %s går ikke gjennom kilde- eller målboksen', (s, t) => {
    const route = orthogonalRoute(handle(sourceBox, s), s, handle(targetBox, t), t, 20, {
      source: sourceBox,
      target: targetBox,
    });
    expect(crosses(route, sourceBox)).toBe(false);
    expect(crosses(route, targetBox)).toBe(false);
    for (let i = 1; i < route.length; i++) {
      const a = route[i - 1]!;
      const b = route[i]!;
      expect(a.x === b.x || a.y === b.y).toBe(true);
    }
  });

  it('beholder rett linje når boksene står i linje', () => {
    const route = orthogonalRoute(handle(sourceBox, 'right'), 'right', handle(targetBox, 'left'), 'left', 20, {
      source: sourceBox,
      target: targetBox,
    });
    expect(route).toHaveLength(2);
  });
});

describe('labelAnchor', () => {
  const route = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 200 }];
  it('bruker ELKs labelplassering når den ligger inntil linjen', () => {
    expect(labelAnchor(route, { x: 20, y: 2, width: 60, height: 20 })).toEqual({ x: 50, y: 12 });
  });
  it('faller tilbake til midtpunktet når linjen er tegnet om bort fra labelen', () => {
    expect(labelAnchor(route, { x: 300, y: 300, width: 60, height: 20 })).toEqual(pointAtFraction(route, 0.5));
    expect(labelAnchor(route)).toEqual(pointAtFraction(route, 0.5));
  });
  it('måler korteste avstand til polylinjen', () => {
    expect(distanceToPolyline({ x: 50, y: 10 }, route)).toBe(10);
    expect(distanceToPolyline({ x: 130, y: 100 }, route)).toBe(30);
  });
});
