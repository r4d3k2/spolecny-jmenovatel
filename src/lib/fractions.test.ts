import { describe, it, expect } from 'vitest';
import {
  gcd,
  lcm,
  lcmOf,
  expand,
  simplify,
  isSimplified,
  equals,
  compare,
  type Fraction,
} from './fractions';

describe('gcd', () => {
  it.each([
    [12, 8, 4],
    [8, 12, 4],
    [7, 5, 1],
    [18, 24, 6],
    [0, 5, 5],
    [5, 0, 5],
    [-12, 8, 4],
  ])('gcd(%i, %i) === %i', (a, b, expected) => {
    expect(gcd(a, b)).toBe(expected);
  });
});

describe('lcm', () => {
  it.each([
    [3, 4, 12],
    [6, 8, 24],
    [5, 10, 10],
    [7, 5, 35],
    [4, 12, 12],
  ])('lcm(%i, %i) === %i', (a, b, expected) => {
    expect(lcm(a, b)).toBe(expected);
  });
});

describe('lcmOf', () => {
  it('vrátí nejmenší společný násobek více čísel', () => {
    expect(lcmOf([2, 3, 4])).toBe(12);
    expect(lcmOf([6, 8, 12])).toBe(24);
    expect(lcmOf([5])).toBe(5);
  });
});

describe('expand', () => {
  it('rozšíří zlomek celým číslem', () => {
    expect(expand({ n: 1, d: 3 }, 2)).toEqual({ n: 2, d: 6 });
    expect(expand({ n: 2, d: 5 }, 3)).toEqual({ n: 6, d: 15 });
  });
});

describe('simplify', () => {
  it.each([
    [{ n: 2, d: 6 }, { n: 1, d: 3 }],
    [{ n: 12, d: 18 }, { n: 2, d: 3 }],
    [{ n: 0, d: 5 }, { n: 0, d: 1 }],
    [{ n: 3, d: -6 }, { n: -1, d: 2 }],
  ])('simplify(%o) === %o', (input, expected) => {
    expect(simplify(input)).toEqual(expected);
  });
});

describe('isSimplified', () => {
  it('pozná zkrácený zlomek', () => {
    expect(isSimplified({ n: 1, d: 3 })).toBe(true);
    expect(isSimplified({ n: 2, d: 6 })).toBe(false);
  });
});

describe('equals', () => {
  it('porovná zlomky pomocí křížového násobení', () => {
    expect(equals({ n: 1, d: 2 }, { n: 2, d: 4 })).toBe(true);
    expect(equals({ n: 1, d: 3 }, { n: 1, d: 2 })).toBe(false);
    expect(equals({ n: 2, d: 3 }, { n: 4, d: 6 })).toBe(true);
  });
});

describe('compare', () => {
  it.each([
    [{ n: 1, d: 2 }, { n: 1, d: 3 }, 1],
    [{ n: 1, d: 3 }, { n: 1, d: 2 }, -1],
    [{ n: 2, d: 4 }, { n: 1, d: 2 }, 0],
  ])('compare(%o, %o) === %i', (a, b, expected) => {
    expect(compare(a as Fraction, b as Fraction)).toBe(expected);
  });
});
