import { describe, it, expect } from 'vitest';
import { generateTask, type Level } from './tasks';
import { equals } from './fractions';

const LEVELS: Level[] = [1, 2, 3, 4, 5];

function isLeastCommonMultiple(denominators: number[], lcd: number): boolean {
  if (!denominators.every((d) => lcd % d === 0)) return false;
  for (let candidate = 1; candidate < lcd; candidate++) {
    if (denominators.every((d) => candidate % d === 0)) return false;
  }
  return true;
}

describe('generateTask – vlastnostní testy', () => {
  it.each(LEVELS)(
    'úroveň %i: 500 úloh splňuje všechny invarianty',
    (level) => {
      let level3ExampleLogged = false;

      for (let i = 0; i < 500; i++) {
        const task = generateTask(level);
        const denominators = task.fractions.map((f) => f.d);

        expect(denominators.length).toBeGreaterThanOrEqual(2);
        expect(task.lcd).toBeGreaterThanOrEqual(Math.max(...denominators));

        // lcd nesmí být větší než 36, aby šel zlomek zobrazit a úloha odpovídala 7. třídě.
        expect(task.lcd).toBeLessThanOrEqual(36);

        // lcd je dělitelné každým jmenovatelem a je to skutečně nejmenší takové číslo.
        expect(isLeastCommonMultiple(denominators, task.lcd)).toBe(true);

        // Multiplikátory souhlasí s lcd.
        task.multipliers.forEach((k, idx) => {
          expect(k * denominators[idx]).toBe(task.lcd);
        });

        // Rozšířené zlomky mají stejnou hodnotu jako původní.
        task.expanded.forEach((expanded, idx) => {
          expect(equals(expanded, task.fractions[idx])).toBe(true);
        });

        // Zlomky nesmí mít už od začátku společného jmenovatele.
        expect(new Set(denominators).size).toBeGreaterThan(1);

        // Specifické očekávání podle úrovně.
        if (level === 1) {
          // Jeden zlomek zůstává beze změny.
          expect(task.multipliers).toContain(1);
        }

        if (level === 2) {
          // Nesoudělné jmenovatele → každý rozšiřující činitel je roven druhému jmenovateli.
          expect(task.multipliers).toContain(denominators[1]);
          expect(task.multipliers).toContain(denominators[0]);
        }

        if (level === 3) {
          // lcd musí být menší než součin jmenovatelů.
          expect(task.lcd).toBeLessThan(denominators[0] * denominators[1]);
          if (!level3ExampleLogged) {
            // eslint-disable-next-line no-console
            console.log(
              `Úroveň 3 příklad: ${task.fractions[0].n}/${task.fractions[0].d} a ${task.fractions[1].n}/${task.fractions[1].d}, lcd=${task.lcd}, součin=${denominators[0] * denominators[1]}`
            );
            level3ExampleLogged = true;
          }
        }

        if (level === 4) {
          expect(task.fractions.length).toBe(3);
        }
      }
    }
  );

  it('nesmí vrátit dvakrát po sobě stejnou úlohu, když je uveden avoidId', () => {
    const first = generateTask(2);
    let differentFound = false;

    for (let i = 0; i < 100; i++) {
      const next = generateTask(2, first.id);
      if (next.id !== first.id) {
        differentFound = true;
        break;
      }
    }

    expect(differentFound).toBe(true);
  });
});
