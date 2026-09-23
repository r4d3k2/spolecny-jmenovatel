import { describe, it, expect } from 'vitest';
import {
  diagnoseDenominator,
  diagnoseMultiplier,
  diagnoseNumerator,
  diagnoseResult,
  type ErrorCode,
} from './diagnostics';
import type { Task } from './tasks';

const level3Task: Task = {
  id: 'test:3:1/6,1/8',
  level: 3,
  fractions: [
    { n: 1, d: 6 },
    { n: 1, d: 8 },
  ],
  lcd: 24,
  multipliers: [4, 3],
  expanded: [
    { n: 4, d: 24 },
    { n: 3, d: 24 },
  ],
};

const level1Task: Task = {
  id: 'test:1:1/3,1/6',
  level: 1,
  fractions: [
    { n: 1, d: 3 },
    { n: 1, d: 6 },
  ],
  lcd: 6,
  multipliers: [2, 1],
  expanded: [
    { n: 2, d: 6 },
    { n: 1, d: 6 },
  ],
};

const level2Task: Task = {
  id: 'test:2:1/3,1/4',
  level: 2,
  fractions: [
    { n: 1, d: 3 },
    { n: 1, d: 4 },
  ],
  lcd: 12,
  multipliers: [4, 3],
  expanded: [
    { n: 4, d: 12 },
    { n: 3, d: 12 },
  ],
};

const level4Task: Task = {
  id: 'test:4:1/2,1/3,1/4',
  level: 4,
  fractions: [
    { n: 1, d: 2 },
    { n: 1, d: 3 },
    { n: 1, d: 4 },
  ],
  lcd: 12,
  multipliers: [6, 4, 3],
  expanded: [
    { n: 6, d: 12 },
    { n: 4, d: 12 },
    { n: 3, d: 12 },
  ],
};

const level5Task: Task = {
  id: 'test:5:1/2,1/3',
  level: 5,
  fractions: [
    { n: 1, d: 2 },
    { n: 1, d: 3 },
  ],
  lcd: 6,
  multipliers: [3, 2],
  expanded: [
    { n: 3, d: 6 },
    { n: 2, d: 6 },
  ],
};

describe('diagnoseDenominator', () => {
  it('OK pro správný nejmenší společný jmenovatel', () => {
    const v = diagnoseDenominator(24, level3Task);
    expect(v.code).toBe('OK');
    expect(v.accepted).toBe(true);
  });

  it('OK_NOT_LOWEST pro společného násobka většího než nejmenší', () => {
    const v = diagnoseDenominator(48, level3Task);
    expect(v.code).toBe('OK_NOT_LOWEST');
    expect(v.accepted).toBe(true);
  });

  it('NOT_DIVISIBLE, když číslo není dělitelné všemi jmenovateli', () => {
    const v = diagnoseDenominator(5, level2Task);
    expect(v.code).toBe('NOT_DIVISIBLE');
    expect(v.accepted).toBe(false);
    expect(v.detail).toMatch(/5 : 3 = 1 zbytek 2/);
  });

  it('SUM_OF_DENOMINATORS, když žák sečte jmenovatele', () => {
    const v = diagnoseDenominator(7, level2Task);
    expect(v.code).toBe('SUM_OF_DENOMINATORS');
    expect(v.accepted).toBe(false);
  });

  it('DIFFERENCE_OF_DENOMINATORS, když žák odečte jmenovatele', () => {
    const v = diagnoseDenominator(1, level2Task);
    expect(v.code).toBe('DIFFERENCE_OF_DENOMINATORS');
    expect(v.accepted).toBe(false);
  });

  it('ONE_OF_ORIGINALS, když zadá původní jmenovatel, který nevyhovuje', () => {
    const v = diagnoseDenominator(3, level2Task);
    expect(v.code).toBe('ONE_OF_ORIGINALS');
    expect(v.accepted).toBe(false);
  });

  it('nespustí ONE_OF_ORIGINALS na správném jmenovateli', () => {
    const v = diagnoseDenominator(6, level1Task);
    expect(v.code).toBe('OK');
  });

  it('UNKNOWN pro nesmyslný nekladný vstup', () => {
    const v = diagnoseDenominator(0, level3Task);
    expect(v.code).toBe('UNKNOWN');
    expect(v.accepted).toBe(false);
  });

  it('funguje i pro tři zlomky', () => {
    const v = diagnoseDenominator(12, level4Task);
    expect(v.code).toBe('OK');
    expect(v.accepted).toBe(true);
  });
});

describe('diagnoseMultiplier', () => {
  it('OK pro správný rozšiřující činitel', () => {
    const v = diagnoseMultiplier(4, 0, level3Task);
    expect(v.code).toBe('OK');
    expect(v.accepted).toBe(true);
  });

  it('DIFFERENCE_INSTEAD_OF_QUOTIENT pro lcd - d', () => {
    const v = diagnoseMultiplier(18, 0, level3Task);
    expect(v.code).toBe('DIFFERENCE_INSTEAD_OF_QUOTIENT');
    expect(v.accepted).toBe(false);
    expect(v.detail).toBe('24 : 6 = 4');
  });

  it('SWAPPED_MULTIPLIERS, když zadá činitel druhého zlomku', () => {
    const v = diagnoseMultiplier(3, 0, level3Task);
    expect(v.code).toBe('SWAPPED_MULTIPLIERS');
    expect(v.accepted).toBe(false);
  });

  it('nespustí SWAPPED_MULTIPLIERS na správné odpovědi', () => {
    const v = diagnoseMultiplier(4, 0, level3Task);
    expect(v.code).not.toBe('SWAPPED_MULTIPLIERS');
  });

  it('ENTERED_DENOMINATOR pro zadání samotného lcd', () => {
    const v = diagnoseMultiplier(24, 0, level3Task);
    expect(v.code).toBe('ENTERED_DENOMINATOR');
    expect(v.accepted).toBe(false);
  });

  it('UNKNOWN pro nespecifickou chybu', () => {
    const v = diagnoseMultiplier(7, 0, level3Task);
    expect(v.code).toBe('UNKNOWN');
    expect(v.accepted).toBe(false);
  });
});

describe('diagnoseNumerator', () => {
  it('OK pro správný nový čitatel', () => {
    const v = diagnoseNumerator(4, 0, level3Task);
    expect(v.code).toBe('OK');
    expect(v.accepted).toBe(true);
  });

  it('NUMERATOR_UNCHANGED, když zůstane původní čitatel', () => {
    const v = diagnoseNumerator(1, 0, level3Task);
    expect(v.code).toBe('NUMERATOR_UNCHANGED');
    expect(v.accepted).toBe(false);
  });

  it('ADDED_INSTEAD_OF_MULTIPLIED pro n + k', () => {
    const v = diagnoseNumerator(5, 0, level3Task);
    expect(v.code).toBe('ADDED_INSTEAD_OF_MULTIPLIED');
    expect(v.accepted).toBe(false);
    expect(v.detail).toBe('1 × 4');
  });

  it('nespustí ADDED_INSTEAD_OF_MULTIPLIED na správné odpovědi', () => {
    const v = diagnoseNumerator(4, 0, level3Task);
    expect(v.code).not.toBe('ADDED_INSTEAD_OF_MULTIPLIED');
  });

  it('OFF_BY_SMALL pro číslo blízko správnému', () => {
    const v = diagnoseNumerator(6, 0, level3Task);
    expect(v.code).toBe('OFF_BY_SMALL');
    expect(v.accepted).toBe(false);
  });

  it('nespustí OFF_BY_SMALL, když je odpověď přesná', () => {
    const v = diagnoseNumerator(4, 0, level3Task);
    expect(v.code).not.toBe('OFF_BY_SMALL');
  });

  it('ENTERED_DENOMINATOR pro zadání nového jmenovatele', () => {
    const v = diagnoseNumerator(24, 0, level3Task);
    expect(v.code).toBe('ENTERED_DENOMINATOR');
    expect(v.accepted).toBe(false);
  });

  it('UNKNOWN pro nespecifickou chybu', () => {
    const v = diagnoseNumerator(99, 0, level3Task);
    expect(v.code).toBe('UNKNOWN');
    expect(v.accepted).toBe(false);
  });
});

describe('diagnoseResult', () => {
  it('OK pro správný zkrácený součet', () => {
    const v = diagnoseResult({ n: 5, d: 6 }, 'add', level5Task);
    expect(v.code).toBe('OK');
    expect(v.accepted).toBe(true);
  });

  it('ADDED_BOTH_PARTS pro sečtení čitatelů i jmenovatelů', () => {
    const v = diagnoseResult({ n: 2, d: 5 }, 'add', level5Task);
    expect(v.code).toBe('ADDED_BOTH_PARTS');
    expect(v.accepted).toBe(false);
  });

  it('nespustí ADDED_BOTH_PARTS na správném výsledku', () => {
    const v = diagnoseResult({ n: 5, d: 6 }, 'add', level5Task);
    expect(v.code).not.toBe('ADDED_BOTH_PARTS');
  });

  it('NOT_SIMPLIFIED pro správnou, ale nezkrácenou odpověď', () => {
    const v = diagnoseResult({ n: 10, d: 12 }, 'add', level5Task);
    expect(v.code).toBe('NOT_SIMPLIFIED');
    expect(v.accepted).toBe(true);
    expect(v.detail).toBe('2');
  });

  it('nespustí NOT_SIMPLIFIED na již zkráceném výsledku', () => {
    const v = diagnoseResult({ n: 5, d: 6 }, 'add', level5Task);
    expect(v.code).not.toBe('NOT_SIMPLIFIED');
  });

  it('OK pro správný rozdíl', () => {
    const v = diagnoseResult({ n: 1, d: 6 }, 'subtract', level5Task);
    expect(v.code).toBe('OK');
    expect(v.accepted).toBe(true);
  });

  it('UNKNOWN pro nespecifickou chybu', () => {
    const v = diagnoseResult({ n: 1, d: 6 }, 'add', level5Task);
    expect(v.code).toBe('UNKNOWN');
    expect(v.accepted).toBe(false);
  });
});

describe('ErrorCode pokrytí', () => {
  it('každý ErrorCode je alespoň jednou vyprodukován', () => {
    const codes: ErrorCode[] = [
      diagnoseDenominator(24, level3Task).code,
      diagnoseDenominator(48, level3Task).code,
      diagnoseDenominator(5, level2Task).code,
      diagnoseDenominator(7, level2Task).code,
      diagnoseDenominator(1, level2Task).code,
      diagnoseDenominator(3, level2Task).code,
      diagnoseDenominator(7, level3Task).code,
      diagnoseMultiplier(18, 0, level3Task).code,
      diagnoseMultiplier(3, 0, level3Task).code,
      diagnoseMultiplier(24, 0, level3Task).code,
      diagnoseMultiplier(7, 0, level3Task).code,
      diagnoseNumerator(1, 0, level3Task).code,
      diagnoseNumerator(5, 0, level3Task).code,
      diagnoseNumerator(6, 0, level3Task).code,
      diagnoseNumerator(24, 0, level3Task).code,
      diagnoseNumerator(99, 0, level3Task).code,
      diagnoseResult({ n: 2, d: 5 }, 'add', level5Task).code,
      diagnoseResult({ n: 10, d: 12 }, 'add', level5Task).code,
    ];

    const unique = new Set(codes);
    const expected: ErrorCode[] = [
      'OK',
      'OK_NOT_LOWEST',
      'NOT_DIVISIBLE',
      'SUM_OF_DENOMINATORS',
      'DIFFERENCE_OF_DENOMINATORS',
      'ONE_OF_ORIGINALS',
      'UNKNOWN',
      'DIFFERENCE_INSTEAD_OF_QUOTIENT',
      'SWAPPED_MULTIPLIERS',
      'ENTERED_DENOMINATOR',
      'NUMERATOR_UNCHANGED',
      'ADDED_INSTEAD_OF_MULTIPLIED',
      'OFF_BY_SMALL',
      'ADDED_BOTH_PARTS',
      'NOT_SIMPLIFIED',
    ];

    expected.forEach((code) => {
      expect(unique.has(code), `chybí pokrytí pro ${code}`).toBe(true);
    });
  });
});
