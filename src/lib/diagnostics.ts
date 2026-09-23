import { equals, gcd, type Fraction } from './fractions';
import type { Task } from './tasks';

export type StepId = 'denominator' | 'multipliers' | 'numerators';

export type ErrorCode =
  | 'OK'
  | 'OK_NOT_LOWEST'
  | 'NOT_DIVISIBLE'
  | 'SUM_OF_DENOMINATORS'
  | 'DIFFERENCE_OF_DENOMINATORS'
  | 'ONE_OF_ORIGINALS'
  | 'UNKNOWN'
  | 'DIFFERENCE_INSTEAD_OF_QUOTIENT'
  | 'SWAPPED_MULTIPLIERS'
  | 'ENTERED_DENOMINATOR'
  | 'NUMERATOR_UNCHANGED'
  | 'ADDED_INSTEAD_OF_MULTIPLIED'
  | 'OFF_BY_SMALL'
  | 'ADDED_BOTH_PARTS'
  | 'NOT_SIMPLIFIED';

export type Verdict = {
  accepted: boolean;
  code: ErrorCode;
  message: string;
  detail?: string;
};

function everyWord(count: number): string {
  return count === 2 ? 'obou' : 'všech';
}

function allWord(count: number): string {
  return count === 2 ? 'oběma' : 'všemi';
}

export function diagnoseDenominator(input: number, task: Task): Verdict {
  const denominators = task.fractions.map((f) => f.d);
  const count = denominators.length;

  if (input <= 0) {
    return {
      accepted: false,
      code: 'UNKNOWN',
      message: `Společný jmenovatel musí být kladné číslo dělitelné ${allWord(count)} zadanými jmenovateli. Hledej nejmenší takové číslo.`,
    };
  }

  if (input === task.lcd) {
    return {
      accepted: true,
      code: 'OK',
      message: `Správně. Společný jmenovatel je ${task.lcd}, můžeš pokračovat dalším krokem.`,
    };
  }

  if (denominators.every((d) => input % d === 0)) {
    return {
      accepted: true,
      code: 'OK_NOT_LOWEST',
      message: `Funguje to, ale šlo by i s ${task.lcd}, s menšími čísly se počítá snáz. Zkus to znovu s nejmenším společným jmenovatelem.`,
    };
  }

  const sum = denominators.reduce((a, b) => a + b, 0);
  if (input === sum) {
    return {
      accepted: false,
      code: 'SUM_OF_DENOMINATORS',
      message: `Jmenovatele se nesčítají. Hledáme číslo, které je násobkem ${everyWord(count)} jmenovatelů.`,
    };
  }

  const diff = Math.abs(denominators[0] - denominators[1]);
  if (count === 2 && input === diff) {
    return {
      accepted: false,
      code: 'DIFFERENCE_OF_DENOMINATORS',
      message: `Jmenovatele se neodčítají. Hledáme číslo, které je násobkem obou jmenovatelů.`,
    };
  }

  if (denominators.includes(input)) {
    const reason =
      count === 2
        ? 'druhý jmenovatel tímto číslem dělit nejde'
        : 'ostatní jmenovatelé tímto číslem dělit nejdou';
    return {
      accepted: false,
      code: 'ONE_OF_ORIGINALS',
      message: `Tenhle jmenovatel by stačil, kdyby byl druhý jeho dělitelem. Tady to neplatí, protože ${reason}.`,
    };
  }

  const nonDivisible = denominators.find((d) => input % d !== 0);
  if (nonDivisible !== undefined) {
    const quotient = Math.floor(input / nonDivisible);
    const remainder = input % nonDivisible;
    return {
      accepted: false,
      code: 'NOT_DIVISIBLE',
      message: `Společný jmenovatel musí být beze zbytku dělitelný ${allWord(count)} zadanými jmenovateli. Zkus najít číslo, které je dělitelné ${everyWord(count)} jmenovateli beze zbytku.`,
      detail: `${input} : ${nonDivisible} = ${quotient} zbytek ${remainder}`,
    };
  }

  return {
    accepted: false,
    code: 'UNKNOWN',
    message: `Společný jmenovatel musí být číslo dělitelné ${allWord(count)} zadanými jmenovateli. Hledej nejmenší takové číslo, které je násobkem každého z nich.`,
  };
}

export function diagnoseMultiplier(input: number, index: number, task: Task): Verdict {
  const expected = task.multipliers[index];
  const d = task.fractions[index].d;

  if (input === expected) {
    return {
      accepted: true,
      code: 'OK',
      message: 'Správně, pokračuj dalším krokem.',
    };
  }

  if (input === task.lcd - d) {
    return {
      accepted: false,
      code: 'DIFFERENCE_INSTEAD_OF_QUOTIENT',
      message: 'Rozšiřující činitel se nepočítá odčítáním, ale dělením. Nového jmenovatele vyděl původním.',
      detail: `${task.lcd} : ${d} = ${expected}`,
    };
  }

  if (task.multipliers.some((k, i) => i !== index && k === input)) {
    return {
      accepted: false,
      code: 'SWAPPED_MULTIPLIERS',
      message: 'Máš správné číslo, jen u nesprávného zlomku. Zkontroluj, který zlomek kterým číslem rozšiřuješ.',
    };
  }

  if (input === task.lcd) {
    return {
      accepted: false,
      code: 'ENTERED_DENOMINATOR',
      message: 'Sem patří číslo, kterým násobíš, ne nový jmenovatel. Vypočítej ho vydělením nového jmenovatele původním.',
    };
  }

  return {
    accepted: false,
    code: 'UNKNOWN',
    message: 'Rozšiřující činitel vypočítáš vydělením nového jmenovatele původním jmenovatelem. Zkus výpočet provést znovu.',
  };
}

export function diagnoseNumerator(input: number, index: number, task: Task): Verdict {
  const f = task.fractions[index];
  const k = task.multipliers[index];
  const expected = f.n * k;

  if (input === expected) {
    return {
      accepted: true,
      code: 'OK',
      message: 'Správně, pokračuj dalším krokem.',
    };
  }

  if (input === f.n) {
    return {
      accepted: false,
      code: 'NUMERATOR_UNCHANGED',
      message: `Rozšiřuje se celý zlomek. Když jsi jmenovatele vynásobil ${k}, musí se ${k} vynásobit i čitatel, jinak má zlomek jinou hodnotu.`,
    };
  }

  if (input === f.n + k) {
    return {
      accepted: false,
      code: 'ADDED_INSTEAD_OF_MULTIPLIED',
      message: 'Rozšiřování je násobení, ne sčítání. Čitatele vynásob rozšiřujícím činitelem.',
      detail: `${f.n} × ${k}`,
    };
  }

  if (input === task.lcd) {
    return {
      accepted: false,
      code: 'ENTERED_DENOMINATOR',
      message: 'Sem patří čitatel, tedy číslo nad zlomkovou čarou. Nový čitatel vypočítáš vynásobením původního čitatele rozšiřujícím činitelem.',
    };
  }

  if (Math.abs(input - expected) <= 3) {
    return {
      accepted: false,
      code: 'OFF_BY_SMALL',
      message: `Postup máš správně, jen ti utekla násobilka. Spočítej znovu ${f.n} × ${k}.`,
      detail: `${f.n} × ${k}`,
    };
  }

  return {
    accepted: false,
    code: 'UNKNOWN',
    message: 'Nový čitatel získáš vynásobením původního čitatele rozšiřujícím činitelem. Zkus výpočet provést znovu.',
  };
}

export function diagnoseResult(
  input: Fraction,
  operation: 'add' | 'subtract',
  task: Task,
): Verdict {
  const d = task.lcd;
  let expectedN: number;

  if (operation === 'add') {
    expectedN = task.expanded.reduce((sum, f) => sum + f.n, 0);
  } else {
    expectedN = task.expanded[0].n - task.expanded[1].n;
  }

  const expected: Fraction = { n: expectedN, d };

  const addedBoth: Fraction = {
    n: task.fractions[0].n + task.fractions[1].n,
    d: task.fractions[0].d + task.fractions[1].d,
  };

  if (equals(input, addedBoth)) {
    return {
      accepted: false,
      code: 'ADDED_BOTH_PARTS',
      message: 'Jmenovatel říká, na kolik dílů je celek rozdělený. Ten se sčítáním nemění, sčítají se jen čitatelé.',
    };
  }

  if (equals(input, expected)) {
    if (!isSimplified(input)) {
      const g = gcd(input.n, input.d);
      return {
        accepted: true,
        code: 'NOT_SIMPLIFIED',
        message: `Výsledek máš správně, ale jde ještě zkrátit ${g}. Zkracuj obě čísla jejich největším společným dělitelem.`,
        detail: `${g}`,
      };
    }

    return {
      accepted: true,
      code: 'OK',
      message: 'Správně, výsledek je v pořádku.',
    };
  }

  return {
    accepted: false,
    code: 'UNKNOWN',
    message: 'Nejprve zlomky převeď na společného jmenovatele a pak sečti nebo odečti čitatele. Jmenovatel zůstává stejný.',
  };
}

// Re-export isSimplified from fractions so diagnostics.ts stays self-contained.
function isSimplified(f: Fraction): boolean {
  return gcd(f.n, f.d) === 1;
}
