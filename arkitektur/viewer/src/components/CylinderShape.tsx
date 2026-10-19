import { CYLINDER_RIM, cylinderPaths, cylinderRimOffset } from '../lib/cylinder';
import type { PortSide } from '../layout/elkLayout';

/** Sylinderformen bak innholdet i en database-node. Ligger absolutt
 * posisjonert og fanger ikke klikk. */
export function CylinderShape({
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
  const { body, rim } = cylinderPaths(width, height, CYLINDER_RIM, strokeWidth / 2);
  const dash = dashed ? '6 4' : undefined;
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
      <path d={body} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
      <path d={rim} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
    </svg>
  );
}

/** Flytter et håndtak på topp/bunn inn til sylinderens buede kant, så
 * koblingen treffer selve formen. */
export function cylinderHandleOffset(side: PortSide, pctAlongSide: number): React.CSSProperties {
  const offset = cylinderRimOffset(pctAlongSide);
  if (side === 'NORTH') return { top: offset };
  if (side === 'SOUTH') return { bottom: offset, top: 'auto' };
  return {};
}
