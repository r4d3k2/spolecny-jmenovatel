import Fraction from './Fraction';
import NumberInput from './NumberInput';
import type { StepId, Verdict } from '../lib/diagnostics';
import type { Task } from '../lib/tasks';

export function stepTitle(step: StepId): string {
  switch (step) {
    case 'denominator':
      return 'Jaký bude společný jmenovatel?';
    case 'multipliers':
      return 'Čím rozšíříš jednotlivé zlomky?';
    case 'numerators':
      return 'Jaké budou nové čitatele?';
  }
}

type StepPanelProps = {
  step: StepId;
  task: Task;
  values: string[];
  onChange: (index: number, value: string) => void;
  onSubmit: () => void;
  verdict: Verdict | null;
};

export default function StepPanel({
  step,
  task,
  values,
  onChange,
  onSubmit,
  verdict,
}: StepPanelProps) {
  const isAccepted = verdict?.accepted ?? false;
  const buttonLabel = verdict === null ? 'Zkontrolovat' : isAccepted ? 'Pokračovat' : 'Zkontrolovat';

  return (
    <div className="mt-6 rounded border border-[#D9D6CE] bg-white p-5">
      <h3 className="mb-4 text-lg font-semibold text-[#1B2A4A]">{stepTitle(step)}</h3>

      <div className="flex flex-col gap-4">
        {step === 'denominator' && (
          <NumberInput
            value={values[0] ?? ''}
            onChange={(v) => onChange(0, v)}
            onSubmit={onSubmit}
            autoFocus
          />
        )}

        {(step === 'multipliers' || step === 'numerators') &&
          task.fractions.map((f, i) => (
            <div key={i} className="flex items-center gap-4">
              <Fraction n={f.n} d={f.d} />
              <span className="text-xl text-[#1B2A4A]">→</span>
              <NumberInput
                value={values[i] ?? ''}
                onChange={(v) => onChange(i, v)}
                onSubmit={onSubmit}
                autoFocus={i === 0}
                label={`${i + 1}. zlomek`}
              />
            </div>
          ))}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="mt-6 rounded bg-[#2F5FD0] px-5 py-2.5 text-white transition-colors hover:bg-[#2F5FD0]/90 focus:outline-none focus:ring-2 focus:ring-[#2F5FD0]/40"
      >
        {buttonLabel}
      </button>

      {verdict && (
        <div
          className={`mt-4 rounded border p-4 ${
            isAccepted
              ? 'border-[#2E7D55]/30 bg-[#2E7D55]/10 text-[#2E7D55]'
              : 'border-[#B8651B]/30 bg-[#B8651B]/10 text-[#B8651B]'
          }`}
          role="status"
          aria-live="polite"
        >
          <p className="text-base leading-relaxed">{verdict.message}</p>
          {verdict.detail && (
            <p className="mt-1 font-mono text-sm opacity-90">{verdict.detail}</p>
          )}
        </div>
      )}
    </div>
  );
}
