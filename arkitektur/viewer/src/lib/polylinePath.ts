import type { XY } from '../layout/elkLayout';

/**
 * Rene, testbare hjelpefunksjoner for å tegne en kant som en polylinje
 * gjennom et sett med punkter (typisk ELKs beregnede, kollisjonsbeviste
 * linjerute), i stedet for å la React Flow gjette en rute ut fra kun
 * start-/sluttpunkt. Brukes av `ElkRoutedEdge.tsx`.
 */

function distance(a: XY, b: XY): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Henter punkt ved indeks — trygt å bruke `!` her siden alle kallsteder
 * allerede har sjekket `points.length` mot indeksen på forhånd. */
function at(points: XY[], index: number): XY {
  const point = points[index];
  if (!point) throw new Error(`polylinePath: mangler punkt ved indeks ${index}`);
  return point;
}

/**
 * Bygger en SVG-path-streng gjennom `points`, med lett avrundede hjørner
 * ved hvert mellompunkt (ikke ved første/siste punkt). Dette gir et roligere
 * visuelt uttrykk enn ELKs skarpe 90°-vinkler, uten å endre selve ruten
 * (og dermed uten å risikere ny kollisjon med bokser/andre kanter).
 *
 * `radius` klemmes automatisk ned for korte segmenter, slik at avrundingen
 * aldri "spiser" mer enn halvparten av et tilstøtende segment.
 */
export function buildRoundedPath(points: XY[], radius = 10): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = at(points, 0);
    return `M ${p.x} ${p.y}`;
  }
  if (points.length === 2) {
    const p0 = at(points, 0);
    const p1 = at(points, 1);
    return `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y}`;
  }

  const parts: string[] = [`M ${at(points, 0).x} ${at(points, 0).y}`];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = at(points, i - 1);
    const curr = at(points, i);
    const next = at(points, i + 1);

    const inLen = distance(prev, curr);
    const outLen = distance(curr, next);
    // Aldri rund av mer enn halve det korteste av de to tilstøtende
    // segmentene, ellers kan avrundingen overlappe et nabo-hjørne.
    const r = Math.max(0, Math.min(radius, inLen / 2, outLen / 2));

    if (r === 0) {
      parts.push(`L ${curr.x} ${curr.y}`);
      continue;
    }

    const inRatio = (inLen - r) / inLen;
    const outRatio = r / outLen;
    const cornerStart = {
      x: prev.x + (curr.x - prev.x) * inRatio,
      y: prev.y + (curr.y - prev.y) * inRatio,
    };
    const cornerEnd = {
      x: curr.x + (next.x - curr.x) * outRatio,
      y: curr.y + (next.y - curr.y) * outRatio,
    };

    parts.push(`L ${cornerStart.x} ${cornerStart.y}`);
    parts.push(`Q ${curr.x} ${curr.y} ${cornerEnd.x} ${cornerEnd.y}`);
  }

  const last = at(points, points.length - 1);
  parts.push(`L ${last.x} ${last.y}`);

  return parts.join(' ');
}

/**
 * Finner punktet som ligger ved gitt andel (0–1) av den totale buelengden
 * til polylinjen `points` — brukes til å plassere kant-labelen midt på
 * HELE ruten (ikke bare midt på første segment, som ville vært feil for en
 * flersegments ELK-rute).
 */
export function pointAtFraction(points: XY[], fraction: number): XY {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return at(points, 0);

  const clamped = Math.max(0, Math.min(1, fraction));

  const segmentLengths = points.slice(1).map((p, i) => distance(at(points, i), p));
  const totalLength = segmentLengths.reduce((a, b) => a + b, 0);

  if (totalLength === 0) return at(points, 0);

  const targetLength = clamped * totalLength;
  let coveredLength = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segLength = segmentLengths[i] ?? 0;
    if (coveredLength + segLength >= targetLength || i === segmentLengths.length - 1) {
      const remaining = targetLength - coveredLength;
      const ratio = segLength === 0 ? 0 : Math.max(0, Math.min(1, remaining / segLength));
      const start = at(points, i);
      const end = at(points, i + 1);
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      };
    }
    coveredLength += segLength;
  }

  return at(points, points.length - 1);
}

/** Korteste avstand fra `p` til polylinjen `points`. */
export function distanceToPolyline(p: XY, points: XY[]): number {
  if (points.length === 0) return Infinity;
  if (points.length === 1) return distance(p, at(points, 0));
  let best = Infinity;
  for (let i = 0; i + 1 < points.length; i++) {
    const a = at(points, i);
    const b = at(points, i + 1);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq));
    best = Math.min(best, distance(p, { x: a.x + dx * t, y: a.y + dy * t }));
  }
  return best;
}

/**
 * Hvor kantens label skal stå. ELK har reservert plass til labelen der den
 * ikke dekker noen boks (`elkLabel`), så den brukes så lenge den fortsatt
 * ligger inntil linjen. Er linjen tegnet om (boks flyttet, kant koblet om),
 * havner labelen midt på den nye linjen i stedet.
 */
export function labelAnchor(points: XY[], elkLabel?: { x: number; y: number; width: number; height: number }): XY {
  if (elkLabel) {
    const center = { x: elkLabel.x + elkLabel.width / 2, y: elkLabel.y + elkLabel.height / 2 };
    const reach = Math.max(elkLabel.width, elkLabel.height) / 2 + 8;
    if (distanceToPolyline(center, points) <= reach) return center;
  }
  return pointAtFraction(points, 0.5);
}

/** Hvilken side av boksen en kant går ut fra / inn i (samme verdier som
 * React Flows `Position`-enum). */
export type HandleSide = 'top' | 'bottom' | 'left' | 'right';

const SIDE_DIRECTION: Record<HandleSide, XY> = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function isHorizontal(side: HandleSide): boolean {
  return side === 'left' || side === 'right';
}

/** Fjerner duplikater og mellompunkter som ligger på en rett linje mellom
 * naboene sine. `tolerance` gjør at en nesten-rett linje (boksene står
 * "nesten" i linje etter en drag) tegnes helt rett i stedet for med en
 * knapt synlig knekk. */
export function simplifyOrthogonal(points: XY[], tolerance = 1): XY[] {
  const deduped: XY[] = [];
  for (const p of points) {
    const prev = deduped[deduped.length - 1];
    if (prev && Math.abs(prev.x - p.x) <= tolerance && Math.abs(prev.y - p.y) <= tolerance) continue;
    deduped.push(p);
  }
  if (deduped.length <= 2) return deduped;

  const result: XY[] = [at(deduped, 0)];
  for (let i = 1; i < deduped.length - 1; i++) {
    const prev = at(result, result.length - 1);
    const curr = at(deduped, i);
    const next = at(deduped, i + 1);
    const sameX = Math.abs(prev.x - curr.x) <= tolerance && Math.abs(curr.x - next.x) <= tolerance;
    const sameY = Math.abs(prev.y - curr.y) <= tolerance && Math.abs(curr.y - next.y) <= tolerance;
    if (sameX || sameY) continue;
    result.push(curr);
  }
  result.push(at(deduped, deduped.length - 1));
  return result;
}

/**
 * Bygger en ortogonal (kun vannrette/loddrette linjestykker) rute fra
 * `source` til `target`, ut fra hvilken side av boksen kanten går ut av og
 * inn i. Brukes når brukeren har dratt en boks, slik at linjen bøyer seg
 * med naturlige 90°-knekk og følger boksen — og blir helt rett igjen
 * når boksene står i linje.
 */
export function orthogonalRoute(
  source: XY,
  sourceSide: HandleSide,
  target: XY,
  targetSide: HandleSide,
  stub = 20,
  ownBoxes?: OwnBoxes
): XY[] {
  const sDir = SIDE_DIRECTION[sourceSide];
  const tDir = SIDE_DIRECTION[targetSide];
  const dx = target.x - source.x;
  const dy = target.y - source.y;

  // Kanten går "fremover" ut av kilden og inn i målet fra riktig side.
  const forwardFromSource = sDir.x * dx + sDir.y * dy > 0;
  const forwardIntoTarget = -(tDir.x * dx + tDir.y * dy) > 0;
  const forward = forwardFromSource && forwardIntoTarget;

  let route: XY[];
  if (forward && isHorizontal(sourceSide) && isHorizontal(targetSide)) {
    const midX = (source.x + target.x) / 2;
    route = [source, { x: midX, y: source.y }, { x: midX, y: target.y }, target];
  } else if (forward && !isHorizontal(sourceSide) && !isHorizontal(targetSide)) {
    const midY = (source.y + target.y) / 2;
    route = [source, { x: source.x, y: midY }, { x: target.x, y: midY }, target];
  } else if (forward) {
    const corner = isHorizontal(sourceSide) ? { x: target.x, y: source.y } : { x: source.x, y: target.y };
    route = [source, corner, target];
  } else {
    // Bakover-tilfeller: gå litt ut fra begge bokser før vi svinger.
    const s1 = { x: source.x + sDir.x * stub, y: source.y + sDir.y * stub };
    const t1 = { x: target.x + tDir.x * stub, y: target.y + tDir.y * stub };
    const elbow = isHorizontal(sourceSide) ? { x: s1.x, y: t1.y } : { x: t1.x, y: s1.y };
    route = [source, s1, elbow, t1, target];
  }

  const simple = simplifyOrthogonal(route);
  const boxes = [ownBoxes?.source, ownBoxes?.target].filter((b): b is RouteBox => !!b);
  if (boxes.length === 0 || !routeCrossesBoxes(simple, boxes)) return simple;
  return detourAroundOwnBoxes(source, sDir, target, tDir, stub, boxes) ?? simple;
}

export interface RouteBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Kantens egne kilde- og mål-bokser. Ruten skal aldri gå GJENNOM disse
 * (bare inn/ut via handlen på kanten av boksen). */
export interface OwnBoxes {
  source?: RouteBox;
  target?: RouteBox;
}

/** Sjekker om et akseparallelt linjestykke går gjennom det indre av boksen
 * (å følge en kant av boksen eller treffe den i ett punkt regnes ikke). */
export function segmentCrossesBox(a: XY, b: XY, box: RouteBox, inset = 1): boolean {
  const left = box.x + inset;
  const right = box.x + box.width - inset;
  const top = box.y + inset;
  const bottom = box.y + box.height - inset;
  if (Math.abs(a.y - b.y) < 0.5) {
    if (a.y <= top || a.y >= bottom) return false;
    return Math.max(a.x, b.x) > left && Math.min(a.x, b.x) < right;
  }
  if (Math.abs(a.x - b.x) < 0.5) {
    if (a.x <= left || a.x >= right) return false;
    return Math.max(a.y, b.y) > top && Math.min(a.y, b.y) < bottom;
  }
  // Skrå linjestykker forekommer ikke i ortogonale ruter; vurder bbox.
  return Math.max(a.x, b.x) > left && Math.min(a.x, b.x) < right && Math.max(a.y, b.y) > top && Math.min(a.y, b.y) < bottom;
}

function routeCrossesBoxes(route: XY[], boxes: RouteBox[]): boolean {
  for (let i = 0; i < route.length - 1; i++) {
    const a = at(route, i);
    const b = at(route, i + 1);
    if (boxes.some((box) => segmentCrossesBox(a, b, box))) return true;
  }
  return false;
}

function routeLength(route: XY[]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) total += distance(at(route, i), at(route, i + 1));
  return total;
}

/**
 * Finner en ortogonal rute som går rundt kantens egne bokser, f.eks. når en
 * kant er koblet om til «baksiden» av en boks. Prøver ruter med én
 * mellomlinje (vannrett eller loddrett) i en rekke kandidatposisjoner –
 * midt mellom endene og like utenfor boksene – og velger den korteste
 * gyldige, med straff per knekk.
 */
function detourAroundOwnBoxes(
  source: XY,
  sDir: XY,
  target: XY,
  tDir: XY,
  stub: number,
  boxes: RouteBox[]
): XY[] | undefined {
  const s1 = { x: source.x + sDir.x * stub, y: source.y + sDir.y * stub };
  const t1 = { x: target.x + tDir.x * stub, y: target.y + tDir.y * stub };
  const minX = Math.min(...boxes.map((b) => b.x)) - stub;
  const maxX = Math.max(...boxes.map((b) => b.x + b.width)) + stub;
  const minY = Math.min(...boxes.map((b) => b.y)) - stub;
  const maxY = Math.max(...boxes.map((b) => b.y + b.height)) + stub;
  const xs = [s1.x, t1.x, (s1.x + t1.x) / 2, minX, maxX];
  const ys = [s1.y, t1.y, (s1.y + t1.y) / 2, minY, maxY];

  const candidates: XY[][] = [];
  for (const y of ys) candidates.push([source, s1, { x: s1.x, y }, { x: t1.x, y }, t1, target]);
  for (const x of xs) candidates.push([source, s1, { x, y: s1.y }, { x, y: t1.y }, t1, target]);

  let best: XY[] | undefined;
  let bestScore = Infinity;
  for (const raw of candidates) {
    const route = simplifyOrthogonal(raw);
    if (routeCrossesBoxes(route, boxes)) continue;
    const score = routeLength(route) + (route.length - 2) * 30;
    if (score < bestScore) {
      bestScore = score;
      best = route;
    }
  }
  return best;
}

/**
 * Flytter en ELK-beregnet rute (`points`) slik at den følger noder som er
 * flyttet manuelt i vieweren (dra-og-slipp), UTEN å kjøre en ny, full
 * ELK-layout (som ville forkastet brukerens manuelle plassering av andre
 * noder).
 *
 * `sourceDelta`/`targetDelta` er hvor mye kildenoden/målnoden faktisk har
 * flyttet seg siden ELK sist beregnet ruten (`{x:0, y:0}` hvis noden ikke er
 * flyttet). Hvert punkt langs ruten forskyves med en vektet blanding av de
 * to — punktet nærmest kilden følger nesten helt kildens forskyvning, punktet
 * nærmest målet følger nesten helt målets forskyvning, og punkter midt på
 * ruten interpoleres jevnt imellom. Dette holder linjen synlig koblet til
 * begge boksene under og etter en drag, i stedet for å stå igjen på sin
 * opprinnelige, nå utdaterte posisjon.
 */
export function translatePoints(points: XY[], sourceDelta: XY, targetDelta: XY): XY[] {
  if (points.length === 0) return points;
  if (sourceDelta.x === 0 && sourceDelta.y === 0 && targetDelta.x === 0 && targetDelta.y === 0) {
    return points;
  }
  if (points.length === 1) {
    const p = at(points, 0);
    return [{ x: p.x + sourceDelta.x, y: p.y + sourceDelta.y }];
  }
  const last = points.length - 1;
  return points.map((p, i) => {
    const blend = i / last;
    return {
      x: p.x + sourceDelta.x * (1 - blend) + targetDelta.x * blend,
      y: p.y + sourceDelta.y * (1 - blend) + targetDelta.y * blend,
    };
  });
}
