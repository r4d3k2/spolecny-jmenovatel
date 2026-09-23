# SPEC: Trenažér zlomků – převod na společného jmenovatele

Tenhle soubor je závazné zadání. Než začneš pracovat, přečti ho celý.
Když si nejsi jistý, zeptej se — nedomýšlej si chybějící rozhodnutí.

---

## 1. Co stavíme a pro koho

Webová aplikace pro procvičování převodu zlomků na společného jmenovatele.

Uživatel je žák 7. třídy české základní školy. Pracuje na notebooku i na
mobilu. Není to test ani hra o body — je to trenažér jedné konkrétní
techniky.

**Nejdůležitější vlastnost celé aplikace:** při chybě umí říct, co žák
nejspíš udělal špatně, ne jen „špatně". Tomuhle se podřizuje architektura —
proto žák odpovídá po krocích a proto je diagnostika chyb samostatný,
otestovaný modul.

---

## 2. Stack a tvrdá pravidla

- Vite + React + TypeScript + Tailwind CSS.
- Správce balíčků `npm`.
- Testy `vitest`.
- **Žádný backend, žádná databáze, žádné přihlašování, žádné volání
  externího API.** Aplikace je čistě klientská a musí fungovat offline.
- Stav se ukládá do `localStorage`.
- Žádné další závislosti bez ptaní. Zejména nepřidávej knihovnu na
  matematickou sazbu (KaTeX, MathJax) — zlomky se vykreslují vlastní
  komponentou, je to jen čitatel, čára a jmenovatel.
- Router přidej jen tehdy, pokud aplikace bude mít víc než dvě obrazovky.
  Zatím vystač s přepínáním stavu.
- Veškeré texty v rozhraní česky, včetně chybových hlášek.

### Práce s repozitářem

Pracuj přímo na větvi `main`. Nezakládej nové větve, nepoužívej
`git worktree`. Commit message česky, jednořádkově.

Necommituj sám od sebe. Commit a push proběhne až na konci fáze, na můj
pokyn — viz část 10.

### Aritmetika

Všechny výpočty se zlomky provádíš **celočíselně**. Největší společný
dělitel Euklidovým algoritmem, nejmenší společný násobek jako
`(a * b) / gcd(a, b)`. Nikdy nepřeváděj zlomek na desetinné číslo kvůli
porovnání nebo kontrole odpovědi — `0.1 + 0.2 !== 0.3` a tady by se to
projevilo jako falešně vyhodnocená chyba.

---

## 3. Struktura souborů

Drž se jí. Neslučuj moduly a nevytvářej soubory navíc bez ptaní.

```
src/
  lib/
    fractions.ts        čistá matematika, žádný React
    fractions.test.ts
    tasks.ts            generátor úloh podle úrovně
    tasks.test.ts
    diagnostics.ts      rozpoznávání typických chyb
    diagnostics.test.ts
    storage.ts          čtení a zápis do localStorage
  components/
    Fraction.tsx        vykreslení jednoho zlomku
    FractionBar.tsx     pruhová vizualizace
    NumberInput.tsx     číselné pole
    StepPanel.tsx       jeden krok cvičení
    HintPanel.tsx       nápověda ve třech stupních
  screens/
    Practice.tsx        hlavní cvičení
    Stats.tsx           přehled a statistiky
  App.tsx
  main.tsx
```

Logika v `lib/` nesmí importovat nic z Reactu. Je to záměr — díky tomu se
dá otestovat bez renderování a chyby v pravidlech se najdou v testech,
ne klikáním.

---

## 4. Datové typy

Použij přesně tyhle. Pokud potřebuješ něco navíc, řekni to a zdůvodni.

```ts
export type Fraction = { n: number; d: number };

export type Level = 1 | 2 | 3 | 4 | 5;

export type Task = {
  id: string;
  level: Level;
  fractions: Fraction[];   // dva zlomky, u úrovně 4 tři
  lcd: number;             // nejmenší společný jmenovatel
  multipliers: number[];   // rozšiřující činitel pro každý zlomek
  expanded: Fraction[];    // zlomky po rozšíření
};

export type StepId = 'denominator' | 'multipliers' | 'numerators';

export type Verdict = {
  accepted: boolean;       // smí žák postoupit dál
  code: ErrorCode;
  message: string;         // dvě až tři věty česky, pro žáka
  detail?: string;         // volitelný výpočet, např. "14 : 4 = 3 zbytek 2"
};
```

---

## 5. Čistá logika – `lib/`

### `fractions.ts`

```ts
gcd(a: number, b: number): number
lcm(a: number, b: number): number
lcmOf(values: number[]): number
expand(f: Fraction, k: number): Fraction
simplify(f: Fraction): Fraction
isSimplified(f: Fraction): boolean
equals(a: Fraction, b: Fraction): boolean   // přes křížové násobení
compare(a: Fraction, b: Fraction): -1 | 0 | 1
```

### `tasks.ts`

```ts
generateTask(level: Level, avoidId?: string): Task
```

Úlohy generuj algoritmicky, ne z pevného seznamu. Parametry podle úrovně:

| Úroveň | Jmenovatelé | Vlastnost |
|--------|-------------|-----------|
| 1 | 3 a 6, 4 a 12, 5 a 10 | jeden je násobkem druhého, jeden zlomek se nemění |
| 2 | 3 a 4, 5 a 6, 4 a 7 | nesoudělní, společný jmenovatel je součin |
| 3 | 6 a 8, 10 a 15, 9 a 12 | nejmenší společný násobek je menší než součin |
| 4 | tři zlomky | kombinace předchozího |
| 5 | libovolné | použití: porovnání a sčítání či odčítání |

Jmenovatelé v rozsahu 2 až 20, čitatelé menší než jmenovatel. Úroveň 5
povoluje i nepravé zlomky. Generátor nesmí vrátit dvakrát po sobě stejnou
úlohu a nesmí vrátit zlomky, které už společného jmenovatele mají.

**Úroveň 3 je jádro celého cvičení.** Tam se láme chleba a tam musí být
generátor nejpečlivější — potřebujeme dvojice, kde součin jmenovatelů
vede k výsledku, ale zbytečně velkému.

### `diagnostics.ts`

```ts
diagnoseDenominator(input: number, task: Task): Verdict
diagnoseMultiplier(input: number, index: number, task: Task): Verdict
diagnoseNumerator(input: number, index: number, task: Task): Verdict
```

Funkce jsou čisté, nic nevypisují a nic neukládají. Vrací verdikt,
o zobrazení rozhoduje UI.

---

## 6. Diagnostika chyb

Tohle je nejdůležitější část zadání. Každé pravidlo implementuj jako
samostatnou větev s vlastním `ErrorCode` a vlastním testem.

### Krok 1 – společný jmenovatel

| Situace | Kód | Co žákovi říct |
|---------|-----|----------------|
| Rovná se nejmenšímu společnému násobku | `OK` | potvrzení, postup dál |
| Dělitelné všemi jmenovateli, ale větší než nejmenší | `OK_NOT_LOWEST` | Uznej jako správné a pusť dál. Poznámka: funguje to, ale šlo by i `{lcd}`, s menšími čísly se počítá snáz. Nabídni tlačítko „Zkusit to s nejmenším". |
| Není dělitelné některým jmenovatelem | `NOT_DIVISIBLE` | Společný jmenovatel musí být beze zbytku dělitelný oběma jmenovateli. Do `detail` dej výpočet se zbytkem. |
| Rovná se součtu jmenovatelů | `SUM_OF_DENOMINATORS` | Jmenovatele se nesčítají. Hledáme číslo, které je násobkem obou. |
| Rovná se rozdílu jmenovatelů | `DIFFERENCE_OF_DENOMINATORS` | totéž pro odčítání |
| Rovná se jednomu ze zadaných jmenovatelů a nevyhovuje | `ONE_OF_ORIGINALS` | Tenhle jmenovatel by stačil, kdyby byl druhý jeho dělitelem. Tady to neplatí. |
| Cokoli jiného | `UNKNOWN` | obecné vysvětlení principu, bez prozrazení výsledku |

### Krok 2 – rozšiřující činitel

| Situace | Kód | Co žákovi říct |
|---------|-----|----------------|
| Správně | `OK` | — |
| Zadán rozdíl `lcd - d` místo podílu | `DIFFERENCE_INSTEAD_OF_QUOTIENT` | Rozšiřující činitel se nepočítá odčítáním, ale dělením. Do `detail` dej `{lcd} : {d} = {k}`. |
| Zadán činitel patřící druhému zlomku | `SWAPPED_MULTIPLIERS` | Máš správné číslo, jen u nesprávného zlomku. |
| Zadán samotný `lcd` | `ENTERED_DENOMINATOR` | Sem patří číslo, kterým násobíš, ne nový jmenovatel. |

### Krok 3 – nový čitatel

| Situace | Kód | Co žákovi říct |
|---------|-----|----------------|
| Správně | `OK` | — |
| Zůstal původní čitatel | `NUMERATOR_UNCHANGED` | Rozšiřuje se celý zlomek. Když jsi jmenovatele vynásobil `{k}`, musí se `{k}` vynásobit i čitatel, jinak má zlomek jinou hodnotu. |
| Zadáno `n + k` místo `n * k` | `ADDED_INSTEAD_OF_MULTIPLIED` | Rozšiřování je násobení, ne sčítání. Do `detail` dej `{n} × {k}`. |
| Liší se od správného nejvýš o 3 | `OFF_BY_SMALL` | Postup máš správně, jen ti utekla násobilka. Spočítej znovu `{n} × {k}`. |
| Zadán nový jmenovatel | `ENTERED_DENOMINATOR` | Sem patří čitatel, tedy číslo nad zlomkovou čarou. |

### Úroveň 5 navíc

| Situace | Kód | Co žákovi říct |
|---------|-----|----------------|
| Sečteny čitatelé i jmenovatelé | `ADDED_BOTH_PARTS` | Jmenovatel říká, na kolik dílů je celek rozdělený. Ten se sčítáním nemění, sčítají se jen čitatelé. |
| Výsledek správný, ale nezkrácený | `NOT_SIMPLIFIED` | Uznej jako správné. Poznámka: výsledek jde ještě zkrátit `{gcd}`. |

### Pravidla pro znění hlášek

Dvě až tři věty. Vysvětlují princip a **nikdy neprozradí výsledek**.
Tón klidný a věcný. Žádné „Bohužel", žádné vykřičníky u chyb, žádné
emoji. Při druhém stejném omylu v téže úloze smí hláška být konkrétnější.

---

## 7. Hlavní obrazovka – krokové cvičení

Zadání: dva zlomky a věta „Převeď na společného jmenovatele."

Žák neodpovídá jedním číslem, ale prochází tři kroky:

1. **Jaký bude společný jmenovatel?** — jedno pole
2. **Čím rozšíříš první zlomek? Čím druhý?** — dvě pole
3. **Jaké budou nové čitatele?** — dvě pole

Kontrola proběhne hned po potvrzení kroku. Při chybě se další krok
neodemkne, žák dostane verdikt a zkouší znovu. Hotový krok se zafixuje
nahoře jako mezivýsledek, aby bylo vidět, kde žák je.

Po dokončení se zobrazí oba upravené zlomky vedle sebe a věta, že teď už
je lze porovnávat, sčítat a odčítat.

Ovládání: `Enter` potvrzuje krok, pole se samo zaměří, na mobilu se
vyvolá číselná klávesnice (`inputMode="numeric"`). Žádný časový limit.

### Nápověda ve třech stupních

Odkrývá se postupně, nikdy celá najednou:

1. Vypíše prvních osm násobků každého jmenovatele pod sebe.
2. Zvýrazní ve výpisu první společné číslo.
3. Ukáže rozšiřující činitele i s výpočtem.

Použití nápovědy se počítá do statistik, ale nehodnotí se jako chyba.

Samostatné tlačítko **„Ukaž mi celý postup"** projde vzorové řešení krok
za krokem s komentářem a nabídne podobnou úlohu na zkoušku.

### Vizualizace

`FractionBar` vykreslí zlomek jako vodorovný pruh rozdělený na díly
s obarvenou částí. Po převedení na společného jmenovatele se pruhy
přerozdělí na jemnější díly — obarvená plocha musí zůstat stejně velká.
Tohle je jediný prvek, který ukazuje, proč rozšiřování nemění hodnotu
zlomku. Animaci drž krátkou, do 400 ms, a respektuj
`prefers-reduced-motion`. V nastavení se dá vizualizace vypnout.

---

## 8. Statistiky a režim opakování chyb

Do `localStorage` ukládej: počet vyřešených úloh, úspěšnost podle úrovní,
počet výskytů každého `ErrorCode` a sérii správných odpovědí za sebou.

Na přehledové obrazovce ukaž tři nejčastější chyby, formulované
srozumitelně pro žáka — tedy „nejčastěji zapomínáš rozšířit čitatel",
ne `NUMERATOR_UNCHANGED`. Mapování kódu na větu drž v jedné tabulce.

Tlačítko **„Procvičit moje chyby"** vygeneruje deset úloh toho typu,
kde se chyby objevují nejčastěji.

Tlačítko na vymazání statistik s potvrzovacím dialogem.

---

## 9. Vzhled

Východisko je svět školního sešitu, ale střídmě — žádná dekorace navíc.

Paleta, šest hodnot:

```
papír      #FBFAF7   pozadí
inkoust    #1B2A4A   text, zlomková čára
pero       #2F5FD0   primární akce, zvýraznění
souhlas    #2E7D55   potvrzená odpověď
pozor      #B8651B   poznámka typu „funguje, ale jde to líp"
linka      #D9D6CE   oddělovače, obrys polí
```

Jedno písmo pro celé rozhraní. Čísla v cvičení sázej výrazně větší než
okolní text a s `font-variant-numeric: tabular-nums`, aby při přepisu
neposkakovala.

Zlomek vykresluj jako skutečný zlomek: čitatel, vodorovná čára jako
`border-top`, jmenovatel. **Nikdy ne jako text `3/4`.** Komponenta
`Fraction` dostane `aria-label` ve tvaru „tři čtvrtiny", aby dávala smysl
i při čtení nahlas.

Čtverečkovaný podklad smí být jen za oblastí cvičení a jen velmi světlý.
Nepoužívej kartu jako obal na každý prvek, žádné stíny pod vším, žádné
přechody jako dekorace, žádné popisky velkými písmeny.

Aplikace musí být plně použitelná na mobilu na výšku, s viditelným
zaměřením pro klávesnici.

---

## 10. Fáze implementace

Pracuj po fázích. Na konci každé fáze:

1. Spusť `npm run build` a `npx vitest run`.
2. Projdi akceptační kritéria fáze a nahlas je jako seznam splněno /
   nesplněno. Nic nehlas jako splněné, dokud to opravdu neproběhlo.
3. **Zastav se a počkej na mou zprávu** typu „Fáze N je v pořádku,
   pokračuj fází N+1." Commit a push udělej až na můj pokyn.
4. Pokud najdu chybu, popíšu ji konkrétně. Drobnou opravu vyřeš v rámci
   současné fáze, nepokračuj do další.

Žádné spekulativní změny mimo tuhle specifikaci. Co v ní není, si
nech schválit předem.

**Fáze 1 — základ, matematika a pojistka.**
Založ projekt, nastav Tailwind, napiš `lib/fractions.ts` a `lib/tasks.ts`
včetně testů. UI zatím jen holá stránka, která vypíše pět vygenerovaných
úloh pro každou úroveň jako text.

Úlohy vznikají za běhu, takže je nejde zkontrolovat okem. Napiš proto
**vlastnostní test**, který pro každou úroveň vygeneruje 500 úloh a ověří,
že u všech platí: `lcd` je dělitelné každým jmenovatelem, `lcd` je opravdu
nejmenší takové číslo, `multipliers[i] * fractions[i].d === lcd`, rozšířený
zlomek se rovná původnímu a jmenovatelé nejsou shodné. Tenhle test je
pojistka proti tichým chybám v generátoru a patří do první fáze, ne na
konec.

Do `package.json` přidej `"prebuild": "vitest run"`, aby build spadl,
když testy neprojdou.

Na konci fáze založ v kořeni `CLAUDE.md` s trvalým kontextem: o čem
projekt je, tech stack, klíčové soubory, odkaz na tuhle specifikaci,
pravidlo o `main` a seznam toho, co s projektem nedělat.

*Akceptační kritéria:*
- [ ] `npx vitest run` projde, vlastnostní test pokrývá všech pět úrovní
- [ ] `npm run build` projde
- [ ] Ve výpisu je vidět, že úroveň 3 generuje dvojice, kde je nejmenší
      společný násobek menší než součin jmenovatelů
- [ ] `CLAUDE.md` existuje a odkazuje na `zlomky-spec.md`

**Fáze 2 — diagnostika.**
`lib/diagnostics.ts` se všemi pravidly z části 6. Ke každému pravidlu
alespoň dva testy: jeden, který ho spustí, a jeden, který ověří, že se
nespustí na správné odpovědi.
*Hotovo, když:* testy procházejí a každý `ErrorCode` má pokrytí.

**Fáze 3 — krokové cvičení.**
`Fraction`, `NumberInput`, `StepPanel`, obrazovka `Practice`. Tři kroky,
kontrola, zobrazení verdiktu, generování další úlohy.
*Hotovo, když:* se dá projít deset úloh za sebou bez chyby v konzoli
a špatná odpověď vypíše konkrétní vysvětlení, ne obecnou hlášku.

**Fáze 4 — nápovědy a vizualizace.**
`HintPanel`, `FractionBar`, přepínání úrovní 1 až 4, tlačítko na celý
postup.

**Fáze 5 — úroveň 5, statistiky, opakování chyb.**
Porovnávání a sčítání, `lib/storage.ts`, obrazovka `Stats`, režim
procvičení vlastních chyb.

---

## 11. Co nedělat

- Nepřidávej přihlašování, sdílení výsledků, žebříčky, odznaky ani export.
- Nepřidávej zvuky, odpočet času ani ubírání životů.
- Nerefaktoruj části, které jsou hotové a otestované, pokud tě o to
  nepožádám.
- Nepiš komentáře, které jen opakují název funkce. Komentuj jen to, co
  není z kódu zřejmé — typicky proč je nějaké pravidlo diagnostiky
  formulované zrovna takhle.
- Nezkracuj chybové hlášky na jedno slovo. Je to celý smysl aplikace.
