/**
 * Geometri for database-noder, som tegnes som en sylinder i stedet for en
 * boks. ELK regner fortsatt med et rektangel. Sylinderen fyller rektangelet,
 * og topp- og bunnkanten er ellipsebuer med halv høyde `CYLINDER_RIM`.
 */
export const CYLINDER_RIM = 9;

/** Ekstra høyde en database-node får, så teksten får plass mellom
 * ellipsene øverst og nederst. */
export const CYLINDER_EXTRA_HEIGHT = CYLINDER_RIM * 2;

/**
 * Hvor langt inn fra rektangelets topp- eller bunnlinje sylinderens kant
 * ligger ved en gitt posisjon langs bredden (0–100 %). Midt på er avstanden
 * 0, og helt ut mot sidene er den `rim`. Brukes for at koblinger skal treffe
 * selve sylinderen og ikke stoppe i lufta over den.
 */
export function cylinderRimOffset(pctAlongWidth: number, rim = CYLINDER_RIM): number {
  const u = Math.min(1, Math.abs(pctAlongWidth / 50 - 1));
  return rim * (1 - Math.sqrt(1 - u * u));
}

/** SVG-stier for sylinderen innenfor `width` × `height`. `body` er hele
 * omrisset, og `rim` er den nedre halvdelen av toppellipsen (den synlige
 * «kanten» på lokket). */
export function cylinderPaths(width: number, height: number, rim = CYLINDER_RIM, inset = 1) {
  const l = inset;
  const r = width - inset;
  const rx = (r - l) / 2;
  const top = inset + rim;
  const bottom = height - inset - rim;
  return {
    body: `M ${l} ${top} A ${rx} ${rim} 0 0 1 ${r} ${top} L ${r} ${bottom} A ${rx} ${rim} 0 0 1 ${l} ${bottom} Z`,
    rim: `M ${l} ${top} A ${rx} ${rim} 0 0 0 ${r} ${top}`,
  };
}
