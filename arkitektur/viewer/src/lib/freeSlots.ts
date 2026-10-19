import type { PortSide, XY } from '../layout/elkLayout';

/**
 * Ledige tilkoblingspunkter («magneter») på alle fire sider av en boks, i
 * tillegg til ELK-portene. Uten disse finnes det kun punkter der kanter
 * allerede er festet, og siden ingen to kanter får dele punkt, ville det
 * vært umulig å koble en kant om til en annen side av boksen.
 */
export interface SidePoint {
  id: string;
  side: PortSide;
  /** Posisjon langs siden i prosent (0–100). */
  pctAlongSide: number;
}

export const SIDES: PortSide[] = ['NORTH', 'EAST', 'SOUTH', 'WEST'];

/** Ønsket avstand mellom ledige punkter langs en side (px). */
export const SLOT_SPACING = 20;
/** Minste avstand fra et ledig punkt til en ELK-port eller et hjørne (px). */
export const SLOT_CLEARANCE = 14;

export function isFreeSlotId(id: string | null | undefined): boolean {
  return !!id && id.startsWith('free-');
}

/** Siden et ledig punkt ligger på, lest ut av id-en (`free-<SIDE>-<n>`). */
export function sideOfFreeSlotId(id: string | null | undefined): PortSide | undefined {
  const side = id?.split('-')[1];
  return SIDES.find((s) => s === side);
}

function sideLength(side: PortSide, width: number, height: number): number {
  return side === 'NORTH' || side === 'SOUTH' ? width : height;
}

export function computeFreeSlots(ports: SidePoint[], width: number, height: number): SidePoint[] {
  const slots: SidePoint[] = [];
  for (const side of SIDES) {
    const length = sideLength(side, width, height);
    if (length <= 0) continue;
    const taken = ports.filter((p) => p.side === side).map((p) => (p.pctAlongSide / 100) * length);
    const usable = length - 2 * SLOT_CLEARANCE;
    const count = Math.max(1, Math.floor(usable / SLOT_SPACING) + 1);
    const step = count > 1 ? usable / (count - 1) : 0;
    const candidates = count > 1 ? Array.from({ length: count }, (_, i) => SLOT_CLEARANCE + i * step) : [length / 2];

    // Id-en bruker kandidatens plass i rutenettet (ikke rekkefølgen blant de
    // ledige), så et punkt beholder id-en sin selv om porter kommer og går
    // ved ny layout. Lagrede forslag-koblinger peker på disse id-ene.
    const indexed = candidates.map((pos, index) => ({ pos, index }));
    let free = indexed.filter((c) => taken.every((t) => Math.abs(t - c.pos) >= SLOT_CLEARANCE));
    if (free.length === 0) {
      // Alltid minst ett ledig punkt per side: velg kandidaten lengst unna
      // de eksisterende portene.
      const distanceToPorts = (c: { pos: number }) => Math.min(...taken.map((t) => Math.abs(t - c.pos)));
      const best = [...indexed].sort((a, b) => distanceToPorts(b) - distanceToPorts(a))[0];
      free = best == null ? [] : [best];
    }
    free.forEach(({ pos, index }) => slots.push({ id: `free-${side}-${index}`, side, pctAlongSide: (pos / length) * 100 }));
  }
  return slots;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function sidePointPosition(box: Box, point: Pick<SidePoint, 'side' | 'pctAlongSide'>): XY {
  const f = point.pctAlongSide / 100;
  switch (point.side) {
    case 'NORTH':
      return { x: box.x + box.width * f, y: box.y };
    case 'SOUTH':
      return { x: box.x + box.width * f, y: box.y + box.height };
    case 'WEST':
      return { x: box.x, y: box.y + box.height * f };
    case 'EAST':
      return { x: box.x + box.width, y: box.y + box.height * f };
  }
}

/**
 * Velger det beste ledige punktet på `side` for en kant hvis andre ende
 * ligger i `otherEnd`: punktet nærmest projeksjonen av den andre enden ned
 * på siden. Det gir rettest mulig linje (færrest knekk) og at kanter som går
 * ut av samme side fordeles i samme rekkefølge som målene sine, slik at de
 * ikke krysser hverandre unødvendig.
 */
export function pickBestPointOnSide(
  points: SidePoint[],
  side: PortSide,
  box: Box,
  otherEnd: XY,
  isOccupied: (id: string) => boolean
): SidePoint | undefined {
  const horizontal = side === 'NORTH' || side === 'SOUTH';
  const target = horizontal ? otherEnd.x : otherEnd.y;
  let best: SidePoint | undefined;
  let bestDist = Infinity;
  for (const p of points) {
    if (p.side !== side || isOccupied(p.id)) continue;
    const pos = sidePointPosition(box, p);
    const dist = Math.abs((horizontal ? pos.x : pos.y) - target);
    if (dist < bestDist) {
      bestDist = dist;
      best = p;
    }
  }
  return best;
}
