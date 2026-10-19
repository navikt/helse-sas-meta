import type { PortSide } from '../layout/elkLayout';

/**
 * Geometri for decision-noder, som tegnes som en avlang sekskant: flat topp
 * og bunn, og spisse sider mot venstre og høyre. ELK regner fortsatt med et
 * rektangel, og sekskanten fyller det. `HEXAGON_POINT` er hvor langt
 * spissene stikker ut forbi de flate kantene.
 */
export const HEXAGON_POINT = 18;

export function hexagonPoints(width: number, height: number, point = HEXAGON_POINT, inset = 1): string {
  const l = inset;
  const r = width - inset;
  const t = inset;
  const b = height - inset;
  const mid = height / 2;
  return [
    [l + point, t],
    [r - point, t],
    [r, mid],
    [r - point, b],
    [l + point, b],
    [l, mid],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
}

/**
 * Hvor langt inn fra rektangelets kant sekskantens omriss ligger for et
 * koblingspunkt på gitt side og posisjon (0–100 %), i px. Punktet flyttes dit,
 * så koblingen treffer selve formen.
 */
export function hexagonHandleOffset(
  side: PortSide,
  pctAlongSide: number,
  width: number,
  height: number,
  point = HEXAGON_POINT
): number {
  const f = Math.min(1, Math.max(0, pctAlongSide / 100));
  if (side === 'EAST' || side === 'WEST') return point * Math.abs(2 * f - 1);
  // Topp/bunn: flat mellom spissene, men skrå ut mot hjørnene.
  const x = f * width;
  const fromEdge = Math.min(x, width - x);
  if (fromEdge >= point || point <= 0) return 0;
  return (height / 2) * (1 - fromEdge / point);
}
