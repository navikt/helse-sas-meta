import { describe, it, expect } from 'vitest';
import { avoidBoxes, type AvoidBox } from './boxAvoidance';

/** Samme slab-test som i modulen selv, men holdt uavhengig her for å
 * verifisere resultatet "fra utsiden" — dette er selve akseptansekriteriet
 * brukeren ba om: linjen skal ALDRI overlappe en boks. */
function segmentCrossesBox(a: { x: number; y: number }, b: { x: number; y: number }, box: AvoidBox): boolean {
  const steps = 200;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    if (x > box.x + 0.5 && x < box.x + box.width - 0.5 && y > box.y + 0.5 && y < box.y + box.height - 0.5) {
      return true;
    }
  }
  return false;
}

function routeCrossesAnyBox(points: { x: number; y: number }[], boxes: AvoidBox[]): boolean {
  for (let i = 0; i < points.length - 1; i++) {
    for (const box of boxes) {
      if (segmentCrossesBox(points[i]!, points[i + 1]!, box)) return true;
    }
  }
  return false;
}

describe('avoidBoxes', () => {
  it('lar en rute være uendret når den ikke krysser noen boks', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];
    const boxes: AvoidBox[] = [{ x: 500, y: 500, width: 50, height: 50 }];
    const result = avoidBoxes(points, boxes);
    expect(result).toBe(points);
  });

  it('ruter en horisontal linje rundt en boks midt i veien', () => {
    const points = [
      { x: 0, y: 50 },
      { x: 200, y: 50 },
    ];
    const boxes: AvoidBox[] = [{ x: 80, y: 20, width: 40, height: 60 }];
    const result = avoidBoxes(points, boxes);
    expect(routeCrossesAnyBox(result, boxes)).toBe(false);
    // start og slutt skal være uendret
    expect(result[0]).toEqual(points[0]);
    expect(result[result.length - 1]).toEqual(points[1]);
  });

  it('ruter en vertikal linje rundt en boks midt i veien', () => {
    const points = [
      { x: 50, y: 0 },
      { x: 50, y: 200 },
    ];
    const boxes: AvoidBox[] = [{ x: 20, y: 80, width: 60, height: 40 }];
    const result = avoidBoxes(points, boxes);
    expect(routeCrossesAnyBox(result, boxes)).toBe(false);
    expect(result[0]).toEqual(points[0]);
    expect(result[result.length - 1]).toEqual(points[1]);
  });

  it('ruter en diagonal linje som går rett gjennom en boks', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 200, y: 200 },
    ];
    const boxes: AvoidBox[] = [{ x: 80, y: 80, width: 40, height: 40 }];
    const result = avoidBoxes(points, boxes);
    expect(routeCrossesAnyBox(result, boxes)).toBe(false);
  });

  it('unngår FLERE bokser langs samme rute', () => {
    const points = [
      { x: 0, y: 50 },
      { x: 300, y: 50 },
    ];
    const boxes: AvoidBox[] = [
      { x: 60, y: 20, width: 40, height: 60 },
      { x: 200, y: 20, width: 40, height: 60 },
    ];
    const result = avoidBoxes(points, boxes);
    expect(routeCrossesAnyBox(result, boxes)).toBe(false);
  });

  it('unngår en boks selv med et flersegments (allerede vinklet) utgangspunkt', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 200, y: 100 },
    ];
    const boxes: AvoidBox[] = [{ x: 80, y: 40, width: 40, height: 20 }];
    const result = avoidBoxes(points, boxes);
    expect(routeCrossesAnyBox(result, boxes)).toBe(false);
  });

  it('håndterer at en boks fullstendig omslutter linjestykket (verste-fall) uten å kaste feil eller henge', () => {
    const points = [
      { x: 100, y: 100 },
      { x: 110, y: 100 },
    ];
    const boxes: AvoidBox[] = [{ x: 0, y: 0, width: 500, height: 500 }];
    expect(() => avoidBoxes(points, boxes)).not.toThrow();
  });

  it('ignorerer bokser som ikke er i konflikt med noen andre linjestykker', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const boxes: AvoidBox[] = [{ x: 1000, y: 1000, width: 10, height: 10 }];
    const result = avoidBoxes(points, boxes);
    expect(result).toBe(points);
  });

  it('respekterer margin (linjen holder avstand, ikke bare akkurat utenfor boksen)', () => {
    const points = [
      { x: 0, y: 50 },
      { x: 200, y: 50 },
    ];
    const boxes: AvoidBox[] = [{ x: 80, y: 20, width: 40, height: 60 }];
    const result = avoidBoxes(points, boxes, 20);
    // Ingen punkt i den nye ruten skal ligge nærmere enn margin til boksen
    for (const p of result) {
      const dx = Math.max(boxes[0]!.x - p.x, 0, p.x - (boxes[0]!.x + boxes[0]!.width));
      const dy = Math.max(boxes[0]!.y - p.y, 0, p.y - (boxes[0]!.y + boxes[0]!.height));
      const dist = Math.hypot(dx, dy);
      expect(dist).toBeGreaterThanOrEqual(20 - 0.5);
    }
  });

  it('krysser aldri noen boks, over mange tilfeldige realistiske oppsett (regresjonssikring)', () => {
    // Dekker det generelle akseptansekriteriet: for ikke-overlappende
    // noder (som ELK/brukeren aldri kan legge oppå hverandre i praksis) og
    // linje-endepunkt som alltid ligger UTENFOR alle bokser (siden en kant
    // sin faktiske start/slutt alltid er et håndtak på kantens EGEN node —
    // andre bokser er da ikke plassert oppå det håndtaket), skal
    // resultat-ruten ALDRI krysse noen boks — verken i "pent"-forsøket med
    // margin, eller i det strenge reserve-forsøket.
    function pointInBox(p: { x: number; y: number }, box: AvoidBox): boolean {
      return p.x >= box.x && p.x <= box.x + box.width && p.y >= box.y && p.y <= box.y + box.height;
    }
    let rng = 42;
    function rand() {
      rng = (rng * 1103515245 + 12345) & 0x7fffffff;
      return rng / 0x7fffffff;
    }
    let trials = 0;
    let failures = 0;
    while (trials < 500) {
      // Rutenett av noder (som i et ekte diagram) med litt tilfeldig
      // forskyvning ("jitter") — aldri overlappende siden avstanden mellom
      // rutenett-cellene (250) er godt over boks-bredden/-høyden (180/140).
      const boxes: AvoidBox[] = [];
      for (let col = 0; col < 3; col++) {
        for (let row = 0; row < 2; row++) {
          boxes.push({ x: col * 250 + rand() * 20, y: row * 250 + rand() * 20, width: 180, height: 140 });
        }
      }
      const points = [
        { x: rand() * 800, y: rand() * 600 },
        { x: rand() * 800, y: rand() * 600 },
      ];
      if (points.some((p) => boxes.some((box) => pointInBox(p, box)))) continue; // umulig i praksis
      trials++;
      const result = avoidBoxes(points, boxes, 14);
      if (routeCrossesAnyBox(result, boxes)) failures++;
    }
    expect(failures).toBe(0);
  });
});


describe('avoidBoxes med rette linjer', () => {
  const isOrthogonal = (pts: { x: number; y: number }[]) =>
    pts.every((p, i) => i === 0 || Math.abs(p.x - pts[i - 1]!.x) < 1.5 || Math.abs(p.y - pts[i - 1]!.y) < 1.5);

  it('går rundt en boks med rette vinkler, på den siden som er nærmest', () => {
    // Avvik ≤ 25%-tilfellet: vannrett linje som streifer under en boks.
    const route = [{ x: 0, y: 325.4 }, { x: 600, y: 325 }];
    const box: AvoidBox = { x: 200, y: 150, width: 240, height: 180 };
    const out = avoidBoxes(route, [box]);
    expect(isOrthogonal(out)).toBe(true);
    expect(Math.max(...out.map((p) => p.y))).toBeGreaterThan(box.y + box.height);
    expect(Math.min(...out.map((p) => p.y))).toBeGreaterThan(box.y);
  });

  it('går rundt med rette vinkler for loddrette linjer også', () => {
    const out = avoidBoxes([{ x: 100, y: 0 }, { x: 100, y: 500 }], [{ x: 60, y: 200, width: 240, height: 100 }]);
    expect(isOrthogonal(out)).toBe(true);
    expect(Math.min(...out.map((p) => p.x))).toBeLessThan(60);
  });
});
