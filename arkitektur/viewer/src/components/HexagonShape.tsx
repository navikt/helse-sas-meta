import { HEXAGON_POINT, hexagonHandleOffset, hexagonPoints } from '../lib/hexagon';
import type { PortSide } from '../layout/elkLayout';

/** Sekskantformen bak innholdet i en decision-node. */
export function HexagonShape({
  width,
  height,
  fill,
  stroke,
  strokeWidth = 2,
  dashed = false,
  glow,
}: {
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth?: number;
  dashed?: boolean;
  glow?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'visible',
        pointerEvents: 'none',
        filter: glow ? `drop-shadow(0 0 4px ${glow})` : 'drop-shadow(0 1px 2px rgba(0,0,0,0.12))',
      }}
    >
      <polygon
        points={hexagonPoints(width, height, HEXAGON_POINT, strokeWidth / 2)}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeDasharray={dashed ? '6 4' : undefined}
      />
    </svg>
  );
}

/** Flytter et koblingspunkt inn til sekskantens omriss. */
export function hexagonHandleStyle(side: PortSide, pctAlongSide: number, width: number, height: number): React.CSSProperties {
  const offset = hexagonHandleOffset(side, pctAlongSide, width, height);
  switch (side) {
    case 'NORTH':
      return { top: offset };
    case 'SOUTH':
      return { bottom: offset, top: 'auto' };
    case 'WEST':
      return { left: offset };
    case 'EAST':
      return { right: offset, left: 'auto' };
  }
}

/** Innvendig luft, så teksten holder seg innenfor de skrå sidene. */
export const HEXAGON_PADDING = `10px ${HEXAGON_POINT + 8}px`;
