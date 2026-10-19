import { describe, expect, it } from 'vitest';
import { SIDES, SLOT_CLEARANCE, computeFreeSlots, isFreeSlotId, pickBestPointOnSide, sideOfFreeSlotId, sidePointPosition, type SidePoint } from './freeSlots';

const along = (p: SidePoint, w: number, h: number) =>
  (p.pctAlongSide / 100) * (p.side === 'NORTH' || p.side === 'SOUTH' ? w : h);

describe('computeFreeSlots', () => {
  it('gir minst ett ledig punkt på hver side', () => {
    const slots = computeFreeSlots([], 180, 60);
    for (const side of SIDES) expect(slots.some((s) => s.side === side)).toBe(true);
  });

  it('holder avstand til eksisterende porter og har unike id-er', () => {
    const ports: SidePoint[] = [
      { id: 'a', side: 'EAST', pctAlongSide: 50 },
      { id: 'b', side: 'NORTH', pctAlongSide: 30 },
    ];
    const slots = computeFreeSlots(ports, 200, 80);
    for (const slot of slots) {
      for (const port of ports.filter((p) => p.side === slot.side)) {
        expect(Math.abs(along(slot, 200, 80) - along(port, 200, 80))).toBeGreaterThanOrEqual(SLOT_CLEARANCE);
      }
    }
    expect(new Set(slots.map((s) => s.id)).size).toBe(slots.length);
    expect(slots.every((s) => isFreeSlotId(s.id))).toBe(true);
  });

  it('beholder ett punkt selv når siden er full av porter', () => {
    const ports: SidePoint[] = [10, 30, 50, 70, 90].map((pct, i) => ({ id: `p${i}`, side: 'WEST', pctAlongSide: pct }));
    const slots = computeFreeSlots(ports, 160, 40).filter((s) => s.side === 'WEST');
    expect(slots).toHaveLength(1);
  });
});

describe('pickBestPointOnSide', () => {
  const box = { x: 0, y: 0, width: 200, height: 80 };
  const points: SidePoint[] = [
    { id: 'n1', side: 'NORTH', pctAlongSide: 10 },
    { id: 'n2', side: 'NORTH', pctAlongSide: 50 },
    { id: 'n3', side: 'NORTH', pctAlongSide: 90 },
    { id: 'e1', side: 'EAST', pctAlongSide: 50 },
  ];

  it('velger punktet nærmest projeksjonen av andre ende, på riktig side', () => {
    const best = pickBestPointOnSide(points, 'NORTH', box, { x: 170, y: -300 }, () => false);
    expect(best?.id).toBe('n3');
  });

  it('hopper over opptatte punkter', () => {
    const best = pickBestPointOnSide(points, 'NORTH', box, { x: 170, y: -300 }, (id) => id === 'n3');
    expect(best?.id).toBe('n2');
  });

  it('sidePointPosition regner ut absolutt posisjon', () => {
    expect(sidePointPosition(box, { side: 'EAST', pctAlongSide: 50 })).toEqual({ x: 200, y: 40 });
    expect(sidePointPosition(box, { side: 'SOUTH', pctAlongSide: 25 })).toEqual({ x: 50, y: 80 });
  });
});

describe('stabile id-er', () => {
  it('et ledig punkt beholder id-en når en port dukker opp et annet sted på siden', () => {
    const before = computeFreeSlots([], 200, 80).filter((s) => s.side === 'SOUTH');
    const after = computeFreeSlots([{ id: 'p', side: 'SOUTH', pctAlongSide: 10 }], 200, 80).filter((s) => s.side === 'SOUTH');
    const last = before[before.length - 1]!;
    expect(after.find((s) => s.id === last.id)?.pctAlongSide).toBeCloseTo(last.pctAlongSide);
    expect(sideOfFreeSlotId(last.id)).toBe('SOUTH');
  });
});
