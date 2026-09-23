export type Fraction = { n: number; d: number };

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return (a * b) / gcd(a, b);
}

export function lcmOf(values: number[]): number {
  return values.reduce((acc, value) => lcm(acc, value), 1);
}

export function expand(f: Fraction, k: number): Fraction {
  return { n: f.n * k, d: f.d * k };
}

export function simplify(f: Fraction): Fraction {
  if (f.n === 0) return { n: 0, d: 1 };
  const g = gcd(f.n, f.d);
  let n = f.n / g;
  let d = f.d / g;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  return { n, d };
}

export function isSimplified(f: Fraction): boolean {
  return gcd(f.n, f.d) === 1;
}

export function equals(a: Fraction, b: Fraction): boolean {
  return a.n * b.d === b.n * a.d;
}

export function compare(a: Fraction, b: Fraction): -1 | 0 | 1 {
  const left = a.n * b.d;
  const right = b.n * a.d;
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}
