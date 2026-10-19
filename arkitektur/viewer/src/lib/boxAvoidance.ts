import type { XY } from '../layout/elkLayout';

/**
 * Ren, testbar logikk som garanterer at en kant-linje ALDRI visuelt
 * overlapper en boks den ikke skal til/fra — verken i det opprinnelige
 * ELK-beregnede oppsettet eller etter at brukeren har dratt en boks (og
 * ELKs statiske rute er forskjøvet av `translatePoints`). Kjøres på nytt
 * ved HVERT render av en kant, siden boksenes live-posisjon kan ha endret
 * seg siden forrige gang.
 *
 * Tilnærming: for hvert linjestykke i ruten, sjekk om det krysser en
 * (oppblåst, med litt margin) boks som IKKE er kantens egen kilde-/
 * mål-node. Hvis ja, sett inn ett eller to omkjørings-punkter som går
 * rundt boksen via det/de hjørnet(ene) som gir kortest total omvei, og
 * kjør avoidBoxes rekursivt på de nye del-strekningene (i tilfelle
 * omkjøringen selv krysser en ANNEN boks).
 */

export interface AvoidBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const EPSILON = 0.01;
// ELK-ruter kan avvike litt fra helt vannrett/loddrett (f.eks. 325 mot 325,4).
const AXIS_TOLERANCE = 1;
// Hver boks som må omgås legger typisk til 2-3 rekursjonsnivåer (én per
// del-strekning i en enkelt- eller to-hjørne-omkjøring). Sett høyt nok til
// at en rute realistisk kan tvinges rundt mange bokser etter hverandre
// (f.eks. en lang diagonal linje som krysser en hel rekke av noder), men
// fortsatt begrenset — dette er kun en sikkerhetsventil mot at genuint
// umulige/motstridende boks-konfigurasjoner (f.eks. bokser som overlapper
// hverandre) skulle henge uendelig.
const MAX_DEPTH = 48;

function inflate(box: AvoidBox, margin: number): AvoidBox {
  return {
    x: box.x - margin,
    y: box.y - margin,
    width: box.width + margin * 2,
    height: box.height + margin * 2,
  };
}

function boxCorners(box: AvoidBox): [XY, XY, XY, XY] {
  return [
    { x: box.x, y: box.y }, // topp-venstre
    { x: box.x + box.width, y: box.y }, // topp-høyre
    { x: box.x + box.width, y: box.y + box.height }, // bunn-høyre
    { x: box.x, y: box.y + box.height }, // bunn-venstre
  ];
}

/** Slab-metoden for linjestykke-mot-boks-kollisjon, med en liten epsilon
 * slik at et linjestykke som kun akkurat berører boksens ytterkant ikke
 * regnes som en kollisjon (unngår evig-omkjøring på grensetilfeller). */
function segmentIntersectsBox(a: XY, b: XY, box: AvoidBox): boolean {
  let tMin = 0;
  let tMax = 1;
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (Math.abs(dx) < EPSILON) {
    if (a.x < box.x + EPSILON || a.x > box.x + box.width - EPSILON) return false;
  } else {
    let t1 = (box.x - a.x) / dx;
    let t2 = (box.x + box.width - a.x) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }

  if (Math.abs(dy) < EPSILON) {
    if (a.y < box.y + EPSILON || a.y > box.y + box.height - EPSILON) return false;
  } else {
    let t1 = (box.y - a.y) / dy;
    let t2 = (box.y + box.height - a.y) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }

  // Krev et minimum av faktisk overlapp (ikke bare at linjestykket akkurat
  // streifer et hjørne/kant) for å unngå å behandle grensetilfeller som
  // en kollisjon.
  return tMax - tMin > EPSILON;
}

function distance(a: XY, b: XY): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function hitsAnyBox(a: XY, b: XY, boxes: AvoidBox[]): boolean {
  return boxes.some((box) => segmentIntersectsBox(a, b, box));
}

function pointInBox(p: XY, box: AvoidBox): boolean {
  return p.x >= box.x && p.x <= box.x + box.width && p.y >= box.y && p.y <= box.y + box.height;
}

/** Finner nærmeste punkt på `box`s ytterkant fra et punkt SOM ALLEREDE
 * ligger inni boksen (pluss en liten epsilon utenfor, slik at det
 * resulterende punktet ikke selv teller som "inni" ved neste sjekk). Brukes
 * kun for det (sjeldne) tilfellet der selve start- eller sluttpunktet for
 * et linjestykke havner innenfor en annen boks' marg-sone — da kan ingen
 * hjørne-omkjøring fungere (enhver linje derfra vil trivielt "starte inni"
 * boksen), så vi ruter i stedet først rett ut til nærmeste kant. */
function nearestBoundaryEscape(p: XY, box: AvoidBox): XY {
  const distLeft = p.x - box.x;
  const distRight = box.x + box.width - p.x;
  const distTop = p.y - box.y;
  const distBottom = box.y + box.height - p.y;
  const min = Math.min(distLeft, distRight, distTop, distBottom);
  if (min === distLeft) return { x: box.x - EPSILON, y: p.y };
  if (min === distRight) return { x: box.x + box.width + EPSILON, y: p.y };
  if (min === distTop) return { x: p.x, y: box.y - EPSILON };
  return { x: p.x, y: box.y + box.height + EPSILON };
}

/** Fire punkter som tar et vannrett (eller loddrett) linjestykke rundt
 * `box` med rette vinkler, via den siden av boksen som er nærmest. */
function orthogonalDetour(a: XY, b: XY, box: AvoidBox, horizontal: boolean): XY[] {
  const out = EPSILON * 10;
  if (horizontal) {
    const forward = b.x >= a.x;
    const enterX = forward ? box.x - out : box.x + box.width + out;
    const exitX = forward ? box.x + box.width + out : box.x - out;
    const above = box.y - out;
    const below = box.y + box.height + out;
    const y = Math.abs(a.y - above) <= Math.abs(below - a.y) ? above : below;
    return [
      { x: enterX, y: a.y },
      { x: enterX, y },
      { x: exitX, y },
      { x: exitX, y: b.y },
    ];
  }
  const forward = b.y >= a.y;
  const enterY = forward ? box.y - out : box.y + box.height + out;
  const exitY = forward ? box.y + box.height + out : box.y - out;
  const left = box.x - out;
  const right = box.x + box.width + out;
  const x = Math.abs(a.x - left) <= Math.abs(right - a.x) ? left : right;
  return [
    { x: a.x, y: enterY },
    { x, y: enterY },
    { x, y: exitY },
    { x: b.x, y: exitY },
  ];
}

/**
 * Ruter linjestykket a→b rundt `boxes` (allerede oppblåst med margin).
 * Returnerer punktene som skal legges til ETTER `a` for å nå `b` (altså
 * uten `a` selv, men med `b` som siste element) — samme konvensjon som
 * gjør det enkelt å slå sammen resultatet fra flere kall etter hverandre.
 */
function routeSegment(a: XY, b: XY, boxes: AvoidBox[], depth: number): XY[] {
  if (depth >= MAX_DEPTH) return [b];

  const hitBox = boxes.find(
    (box) => segmentIntersectsBox(a, b, box) || pointInBox(a, box) || pointInBox(b, box)
  );
  if (!hitBox) return [b];

  // Sjeldent grensetilfelle: selve start- eller sluttpunktet for dette
  // linjestykket ligger allerede innenfor boksens marg-sone (typisk fordi
  // to noder ligger tett inntil hverandre). Da vil ALLE hjørne-kandidater
  // under trivielt "kollidere" (siden ethvert linjestykke fra et punkt
  // inni boksen per definisjon starter/slutter inni den) — rut derfor
  // først rett ut til nærmeste kant, og fortsett omkjøringen derfra.
  if (pointInBox(a, hitBox)) {
    const escape = nearestBoundaryEscape(a, hitBox);
    return [escape, ...routeSegment(escape, b, boxes, depth + 1)];
  }
  if (pointInBox(b, hitBox)) {
    const escape = nearestBoundaryEscape(b, hitBox);
    return [...routeSegment(a, escape, boxes, depth + 1), escape, b];
  }

  // Vannrett eller loddrett linjestykke: gå rundt boksen med rette
  // vinkler (opp/ned eller til siden og tilbake) i stedet for på skrå via
  // et hjørne. Velger den siden av boksen som ligger nærmest linjen.
  const horizontal = Math.abs(a.y - b.y) <= AXIS_TOLERANCE;
  const vertical = Math.abs(a.x - b.x) <= AXIS_TOLERANCE;
  if (horizontal || vertical) {
    const detour = orthogonalDetour(a, b, hitBox, horizontal);
    const result: XY[] = [];
    let from = a;
    for (const point of [...detour, b]) {
      result.push(...routeSegment(from, point, boxes, depth + 1));
      from = point;
    }
    return result;
  }

  const corners = boxCorners(hitBox);

  // Forsøk først en enkelt-hjørne-omkjøring (a → hjørne → b) — velg det
  // hjørnet som faktisk unngår boksen for BEGGE del-strekningene, med
  // minst mulig ekstra lengde lagt til ruten.
  const singleCornerCandidates = corners
    .filter((corner) => !segmentIntersectsBox(a, corner, hitBox) && !segmentIntersectsBox(corner, b, hitBox))
    .map((corner) => ({ corner, extra: distance(a, corner) + distance(corner, b) - distance(a, b) }));

  if (singleCornerCandidates.length > 0) {
    const best = singleCornerCandidates.reduce((min, c) => (c.extra < min.extra ? c : min));
    return [
      ...routeSegment(a, best.corner, boxes, depth + 1),
      ...routeSegment(best.corner, b, boxes, depth + 1),
    ];
  }

  // Ingen enkelt-hjørne-omkjøring holder (typisk når linjestykket går
  // nær rett gjennom boksens senter) — prøv en to-hjørne-omkjøring langs
  // hver av boksens fire sider (via de to hjørnene på den siden), og velg
  // den korteste gyldige.
  const sides: [XY, XY][] = [
    [corners[0]!, corners[1]!], // topp
    [corners[1]!, corners[2]!], // høyre
    [corners[2]!, corners[3]!], // bunn
    [corners[3]!, corners[0]!], // venstre
  ];
  const twoCornerCandidates = sides
    .filter(([c1, c2]) => !segmentIntersectsBox(a, c1, hitBox) && !segmentIntersectsBox(c2, b, hitBox))
    .map(([c1, c2]) => ({
      c1,
      c2,
      extra: distance(a, c1) + distance(c1, c2) + distance(c2, b) - distance(a, b),
    }));

  if (twoCornerCandidates.length > 0) {
    const best = twoCornerCandidates.reduce((min, c) => (c.extra < min.extra ? c : min));
    return [
      ...routeSegment(a, best.c1, boxes, depth + 1),
      ...routeSegment(best.c1, best.c2, boxes, depth + 1),
      ...routeSegment(best.c2, b, boxes, depth + 1),
    ];
  }

  // Siste utvei (bør i praksis aldri inntreffe for et enkelt AABB-hinder):
  // behold linjestykket som det er, fremfor å risikere en uendelig/
  // ustabil omkjøring.
  return [b];
}

/**
 * Kjører selve rute-om-bokser-algoritmen med gitt `margin`. Brukes både
 * for det foretrukne (pene) forsøket og for det strenge reserveforsøket
 * (se `avoidBoxes`).
 */
function routeWithMargin(points: XY[], boxes: AvoidBox[], margin: number): XY[] {
  const inflated = boxes.map((box) => inflate(box, margin));

  // Rask sjekk: hvis ingen linjestykke i det hele tatt krysser noen boks,
  // returner de opprinnelige punktene uendret (unngår unødvendig ny array
  // og bevarer referanselikhet for enkle tilfeller).
  let anyHit = false;
  for (let i = 0; i < points.length - 1; i++) {
    if (hitsAnyBox(points[i]!, points[i + 1]!, inflated)) {
      anyHit = true;
      break;
    }
  }
  if (!anyHit) return points;

  const result: XY[] = [points[0]!];
  for (let i = 0; i < points.length - 1; i++) {
    const a = result[result.length - 1]!;
    const b = points[i + 1]!;
    const routed = routeSegment(a, b, inflated, 0);
    result.push(...routed);
  }
  return result;
}

/** Sjekker om en ferdig rute fortsatt krysser noen av de FAKTISKE (ikke
 * oppblåste) boksene — selve akseptansekriteriet: linjen skal ALDRI
 * overlappe en boks, uansett om den ønskede margen kunne oppnås eller
 * ikke. */
export function crossesAnyRealBox(routePoints: XY[], boxes: AvoidBox[]): boolean {
  for (let i = 0; i < routePoints.length - 1; i++) {
    if (hitsAnyBox(routePoints[i]!, routePoints[i + 1]!, boxes)) return true;
  }
  return false;
}

/**
 * Justerer en polylinje-rute (`points`) slik at ingen av linjestykkene
 * krysser noen av boksene i `boxes` (bortsett fra kantens egne kilde- og
 * mål-node, som allerede er ekskludert av kalleren via `boxes`-listen).
 *
 * `margin` er hvor mye ekstra klaring linjen skal holde til boksens
 * kant (utover selve boks-grensen), slik at linjen ikke bare unngår å gå
 * gjennom boksen, men også holder litt synlig avstand til den.
 *
 * Når to bokser ligger så tett at gapet mellom dem er mindre enn ønsket
 * margin, kan margen på begge sider "smelte sammen" til én sammenhengende
 * sperret sone — et fullverdig, marg-respekterende omkjøringspunkt finnes
 * da rett og slett ikke. I stedet for å risikere en ustabil frem-og-
 * tilbake-omkjøring (eller å gi opp med en linje som fortsatt overlapper en
 * boks), prøver vi derfor på nytt med minimal klaring (kun selve
 * boks-grensen + en knapt synlig epsilon) hvis det pene forsøket ikke
 * fullt ut løser opp alle kollisjoner. Dette garanterer at selve
 * KORREKTHETEN (aldri overlappe en faktisk boks) alltid holder, selv om
 * den kosmetiske margen noen ganger må vike i trange mellomrom.
 */
export function avoidBoxes(points: XY[], boxes: AvoidBox[], margin = 14): XY[] {
  if (points.length < 2 || boxes.length === 0) return points;

  const withMargin = routeWithMargin(points, boxes, margin);
  if (!crossesAnyRealBox(withMargin, boxes)) return withMargin;

  return routeWithMargin(points, boxes, 0.5);
}
