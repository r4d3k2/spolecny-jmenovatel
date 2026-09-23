import { type Fraction, expand, gcd, lcmOf } from './fractions';

export type Level = 1 | 2 | 3 | 4 | 5;

export type Task = {
  id: string;
  level: Level;
  fractions: Fraction[];
  lcd: number;
  multipliers: number[];
  expanded: Fraction[];
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDenominators(level: Level): number[] {
  let attempts = 0;
  while (attempts < 1000) {
    attempts++;

    if (level === 1) {
      const d1 = randInt(2, 20);
      const d2 = randInt(2, 20);
      if (d1 === d2) continue;
      if (d1 % d2 !== 0 && d2 % d1 !== 0) continue;
      return [d1, d2];
    }

    if (level === 2) {
      const d1 = randInt(2, 20);
      const d2 = randInt(2, 20);
      if (d1 === d2) continue;
      if (gcd(d1, d2) !== 1) continue;
      return [d1, d2];
    }

    if (level === 3) {
      const d1 = randInt(2, 20);
      const d2 = randInt(2, 20);
      if (d1 === d2) continue;
      const g = gcd(d1, d2);
      if (g === 1) continue;
      if (d1 % d2 === 0 || d2 % d1 === 0) continue;
      return [d1, d2];
    }

    if (level === 4) {
      const ds = [randInt(2, 20), randInt(2, 20), randInt(2, 20)];
      if (ds.every((d) => d === ds[0])) continue;
      return ds;
    }

    // Level 5 – libovolné dvojice, jen nesmí být shodné.
    const d1 = randInt(2, 20);
    const d2 = randInt(2, 20);
    if (d1 === d2) continue;
    return [d1, d2];
  }

  throw new Error(`Nepodařilo se vygenerovat jmenovatele pro úroveň ${level}`);
}

function generateNumerators(level: Level, denominators: number[]): Fraction[] {
  return denominators.map((d) => {
    if (level === 5) {
      // Úroveň 5 povoluje i nepravé zlomky.
      return { n: randInt(1, d * 2), d };
    }
    return { n: randInt(1, d - 1), d };
  });
}

export function generateTask(level: Level, avoidId?: string): Task {
  let attempts = 0;
  while (attempts < 1000) {
    attempts++;

    const denominators = generateDenominators(level);
    const fractions = generateNumerators(level, denominators);
    const lcd = lcmOf(denominators);
    const multipliers = denominators.map((d) => lcd / d);
    const expanded = fractions.map((f, i) => expand(f, multipliers[i]));
    const id = `${level}:${fractions.map((f) => `${f.n}/${f.d}`).join(',')}`;

    if (avoidId && id === avoidId) continue;

    return { id, level, fractions, lcd, multipliers, expanded };
  }

  throw new Error(`Nepodařilo se vygenerovat úlohu pro úroveň ${level}`);
}
