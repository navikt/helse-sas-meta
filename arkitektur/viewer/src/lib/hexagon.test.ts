import { describe, expect, it } from 'vitest';
import { HEXAGON_POINT, hexagonHandleOffset, hexagonPoints } from './hexagon';

describe('hexagonHandleOffset', () => {
  it('treffer spissen midt på sidene og skråkanten lenger ut', () => {
    expect(hexagonHandleOffset('EAST', 50, 240, 80)).toBe(0);
    expect(hexagonHandleOffset('WEST', 0, 240, 80)).toBeCloseTo(HEXAGON_POINT);
    expect(hexagonHandleOffset('EAST', 25, 240, 80)).toBeCloseTo(HEXAGON_POINT / 2);
  });

  it('er 0 på den flate toppen og bunnen, og skrår mot hjørnene', () => {
    expect(hexagonHandleOffset('NORTH', 50, 240, 80)).toBe(0);
    expect(hexagonHandleOffset('SOUTH', 20, 240, 80)).toBe(0);
    expect(hexagonHandleOffset('NORTH', 0, 240, 80)).toBeCloseTo(40);
  });
});

describe('hexagonPoints', () => {
  it('har seks hjørner', () => {
    expect(hexagonPoints(240, 80).split(' ')).toHaveLength(6);
  });
});
