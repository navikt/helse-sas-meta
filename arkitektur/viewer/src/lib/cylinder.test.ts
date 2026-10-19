import { describe, expect, it } from 'vitest';
import { CYLINDER_RIM, cylinderPaths, cylinderRimOffset } from './cylinder';

describe('cylinderRimOffset', () => {
  it('er 0 midt på og rim ute ved kantene', () => {
    expect(cylinderRimOffset(50)).toBe(0);
    expect(cylinderRimOffset(0)).toBeCloseTo(CYLINDER_RIM);
    expect(cylinderRimOffset(100)).toBeCloseTo(CYLINDER_RIM);
  });

  it('er symmetrisk og øker utover', () => {
    expect(cylinderRimOffset(25)).toBeCloseTo(cylinderRimOffset(75));
    expect(cylinderRimOffset(10)).toBeGreaterThan(cylinderRimOffset(30));
  });
});

describe('cylinderPaths', () => {
  it('lager lukket omriss og en lokk-kant', () => {
    const { body, rim } = cylinderPaths(160, 80);
    expect(body.startsWith('M')).toBe(true);
    expect(body.endsWith('Z')).toBe(true);
    expect(rim).toContain('A');
  });
});
