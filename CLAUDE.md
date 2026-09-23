:# Trenažér zlomků

Klient-side webová aplikace pro žáky 7. třídy základní školy na procvičování převodu zlomků na společného jmenovatele.

## Základní informace

- **Zadání:** `zlomky-spec.md` (závazná specifikace)
- **Hlavní cíl:** při chybě říct žákovi, co pravděpodobně udělal špatně, místo obecného „špatně“.
- **Architektonické pravidlo:** logika v `src/lib/` neimportuje React; jde tedy plně otestovat bez renderování komponent.

## Tech stack

- Vite + React + TypeScript + Tailwind CSS
- npm
- vitest
- Bez backendu, databáze, přihlašování a externího API.
- Stav se ukládá do `localStorage`.

## Klíčové soubory

- `src/lib/fractions.ts` – čistá aritmetika zlomků (gcd, lcm, rozšiřování, zkracování, porovnání)
- `src/lib/fractions.test.ts`
- `src/lib/tasks.ts` – generátor úloh podle úrovně
- `src/lib/tasks.test.ts`
- `src/lib/diagnostics.ts` – diagnostika typických chyb (Fáze 2)
- `src/lib/diagnostics.test.ts`
- `src/lib/storage.ts` – čtení/zápis `localStorage` (Fáze 5)
- `src/components/Fraction.tsx` – vykreslení zlomku (Fáze 3+)
- `src/components/NumberInput.tsx`, `StepPanel.tsx`, `HintPanel.tsx`, `FractionBar.tsx`
- `src/screens/Practice.tsx` – hlavní cvičení
- `src/screens/Stats.tsx` – statistiky a opakování chyb

## Pravidla práce

- Pracuj přímo na větvi `main`. Nezakládej nové větve, nepoužívej `git worktree`.
- Commit a push probíhají jen na pokyn.
- Logika v `src/lib/` nesmí importovat nic z Reactu.
- Všechny texty v rozhraní jsou česky, včetně chybových hlášek.
- Nepřidávej nové závislosti bez schválení.
- Matematiku prováděj celočíselně; nikdy nepřeváděj zlomky na desetinná čísla pro kontrolu.

## Co s projektem nedělat

- Nepřidávej přihlašování, sdílení výsledků, žebříčky, odznaky ani export.
- Nepřidávej zvuky, odpočet času ani ubírání životů.
- Nerefaktoruj části, které jsou hotové a otestované, pokud tě o to nepožádají.
- Nepiš komentáře, které jen opakují název funkce.
- Nezkracuj chybové hlášky na jedno slovo – diagnostika je hlavní hodnota aplikace.
