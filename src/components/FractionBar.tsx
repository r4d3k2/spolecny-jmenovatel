import type { Fraction } from '../lib/fractions';

type FractionBarProps = {
  fraction: Fraction;
  className?: string;
};

export default function FractionBar({ fraction, className = '' }: FractionBarProps) {
  const { n, d } = fraction;

  if (d <= 0) return null;

  const filled = Math.min(n, d);

  return (
    <div
      className={`relative flex h-6 w-48 shrink-0 overflow-hidden rounded border border-[#1B2A4A] ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: d }, (_, i) => {
        const isFilled = i < filled;
        const hasBorder = i < d - 1;
        const classes = [
          'box-border h-full flex-1',
          isFilled ? 'bg-[#2F5FD0]' : '',
          hasBorder ? 'border-r border-[#D9D6CE]' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return <div key={i} className={classes} />;
      })}
    </div>
  );
}
