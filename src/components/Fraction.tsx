import type { CSSProperties } from 'react';

const DENOMINATOR_FORMS: Record<number, [string, string, string] | undefined> = {
  2: ['polovina', 'poloviny', 'polovin'],
  3: ['třetina', 'třetiny', 'třetin'],
  4: ['čtvrtina', 'čtvrtiny', 'čtvrtin'],
  5: ['pětina', 'pětiny', 'pětin'],
  6: ['šestina', 'šestiny', 'šestin'],
  7: ['sedmina', 'sedminy', 'sedmin'],
  8: ['osmina', 'osminy', 'osmin'],
  9: ['devítina', 'devítiny', 'devítin'],
  10: ['desetina', 'desetiny', 'desetin'],
  11: ['jedenáctina', 'jedenáctiny', 'jedenáctin'],
  12: ['dvanáctina', 'dvanáctiny', 'dvanáctin'],
  13: ['třináctina', 'třináctiny', 'třináctin'],
  14: ['čtrnáctina', 'čtrnáctiny', 'čtrnáctin'],
  15: ['patnáctina', 'patnáctiny', 'patnáctin'],
  16: ['šestnáctina', 'šestnáctiny', 'šestnáctin'],
  17: ['sedmnáctina', 'sedmnáctiny', 'sedmnáctin'],
  18: ['osmnáctina', 'osmnáctiny', 'osmnáctin'],
  19: ['devatenáctina', 'devatenáctiny', 'devatenáctin'],
  20: ['dvacetina', 'dvacetiny', 'dvacetin'],
};

const NUMBER_WORDS: Record<number, string> = {
  1: 'jedna',
  2: 'dvě',
  3: 'tři',
  4: 'čtyři',
  5: 'pět',
  6: 'šest',
  7: 'sedm',
  8: 'osm',
  9: 'devět',
  10: 'deset',
  11: 'jedenáct',
  12: 'dvanáct',
  13: 'třináct',
  14: 'čtrnáct',
  15: 'patnáct',
  16: 'šestnáct',
  17: 'sedmnáct',
  18: 'osmnáct',
  19: 'devatenáct',
  20: 'dvacet',
};

function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? n.toString();
}

function fractionAriaLabel(n: number, d: number): string {
  const forms = DENOMINATOR_FORMS[d];
  if (!forms) return `zlomek ${n} lomeno ${d}`;
  const [singular, pluralNom, pluralGen] = forms;
  let denomWord: string;
  if (n === 1) denomWord = singular;
  else if (n <= 4) denomWord = pluralNom;
  else denomWord = pluralGen;
  return `${numberWord(n)} ${denomWord}`;
}

type FractionProps = {
  n: number;
  d: number;
  className?: string;
  style?: CSSProperties;
};

export default function Fraction({ n, d, className = '', style }: FractionProps) {
  return (
    <span
      className={`inline-flex flex-col items-center ${className}`}
      style={style}
      aria-label={fractionAriaLabel(n, d)}
      role="img"
    >
      <span className="text-2xl leading-none tabular-nums text-[#1B2A4A]">{n}</span>
      <span className="my-1 h-0 w-full border-t-2 border-[#1B2A4A]"></span>
      <span className="text-2xl leading-none tabular-nums text-[#1B2A4A]">{d}</span>
    </span>
  );
}
