import { useEffect, useState } from 'react';
import Fraction from '../components/Fraction';
import FractionBar from '../components/FractionBar';
import HintPanel from '../components/HintPanel';
import NumberInput from '../components/NumberInput';
import SolutionPanel from '../components/SolutionPanel';
import {
  diagnoseDenominator,
  diagnoseMultiplier,
  diagnoseNumerator,
  type StepId,
  type Verdict,
} from '../lib/diagnostics';
import { generateTask } from '../lib/tasks';
import type { Level, Task } from '../lib/tasks';

const LEVELS: Level[] = [1, 2, 3, 4];

type HistoryItem = {
  step: StepId;
  values: number[];
  verdict?: Verdict;
};

function stepTitle(step: StepId): string {
  switch (step) {
    case 'denominator':
      return 'Společný jmenovatel';
    case 'multipliers':
      return 'Rozšiřující činitele';
    case 'numerators':
      return 'Nové čitatele';
  }
}

export default function Practice() {
  const [level, setLevel] = useState<Level>(2);
  const [task, setTask] = useState<Task>(() => generateTask(2));
  const [step, setStep] = useState<StepId>('denominator');
  const [inputs, setInputs] = useState<string[]>(['']);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [done, setDone] = useState(false);

  const [showBars, setShowBars] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    setStep('denominator');
    setInputs(['']);
    setVerdict(null);
    setHistory([]);
    setDone(false);
    setShowHint(false);
    setShowSolution(false);
  }, [task]);

  function changeLevel(newLevel: Level) {
    setLevel(newLevel);
    setTask(generateTask(newLevel));
  }

  function nextTask(avoidId?: string) {
    setTask((prev) => generateTask(level, avoidId ?? prev.id));
  }

  function handleInputChange(index: number, value: string) {
    setInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function advance() {
    const nums = inputs
      .map((v) => parseInt(v, 10))
      .filter((n) => !Number.isNaN(n));
    setHistory((prev) => [...prev, { step, values: nums, verdict: verdict ?? undefined }]);
    setVerdict(null);

    if (step === 'denominator') {
      setStep('multipliers');
      setInputs(Array(task.fractions.length).fill(''));
    } else if (step === 'multipliers') {
      setStep('numerators');
      setInputs(Array(task.fractions.length).fill(''));
    } else {
      setDone(true);
    }
  }

  function handleSubmit() {
    if (verdict?.accepted) {
      advance();
      return;
    }

    const nums = inputs.map((v) => parseInt(v, 10));
    if (nums.some(Number.isNaN)) return;

    let result: Verdict | null = null;
    for (let i = 0; i < nums.length; i++) {
      const v =
        step === 'denominator'
          ? diagnoseDenominator(nums[i], task)
          : step === 'multipliers'
            ? diagnoseMultiplier(nums[i], i, task)
            : diagnoseNumerator(nums[i], i, task);

      if (!v.accepted) {
        result = v;
        break;
      }
      if (i === 0) result = v;
    }

    if (result) {
      setVerdict(result);
    }
  }

  function handleHintUse() {
    // Použití nápovědy se započítá do statistik ve fázi 5.
  }

  return (
    <div className="min-h-screen bg-[#FBFAF7] p-4 text-[#1B2A4A] md:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Převeď na společného jmenovatele</h1>

          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showBars}
                onChange={(e) => setShowBars(e.target.checked)}
                className="h-4 w-4 accent-[#2F5FD0]"
              />
              Vizualizace
            </label>

            <div className="flex items-center gap-1">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => changeLevel(l)}
                  className={`h-9 w-9 rounded border text-base font-medium transition-colors ${
                    l === level
                      ? 'border-[#2F5FD0] bg-[#2F5FD0] text-white'
                      : 'border-[#D9D6CE] bg-white hover:border-[#2F5FD0]'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="grid-bg rounded border border-[#D9D6CE] bg-white p-5">
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-6">
              {task.fractions.map((f, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Fraction n={f.n} d={f.d} className="text-3xl" />
                  {showBars && <FractionBar fraction={f} />}
                </div>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="mb-6 border-t border-[#D9D6CE] pt-4">
              {history.map((h, i) => (
                <div key={i} className="mb-2">
                  <span className="font-medium">{stepTitle(h.step)}:</span>{' '}
                  <span className="font-mono text-lg">{h.values.join(', ')}</span>
                </div>
              ))}
            </div>
          )}

          {done ? (
            <div className="border-t border-[#D9D6CE] pt-4">
              <p className="text-lg leading-relaxed">
                Teď už mají všechny zlomky společného jmenovatele a můžeš je
                porovnávat, sčítat a odčítat.
              </p>

              <div className="my-6 flex flex-wrap items-center gap-6">
                {task.expanded.map((f, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Fraction n={f.n} d={f.d} className="text-3xl" />
                    {showBars && <FractionBar fraction={f} />}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => nextTask()}
                className="rounded bg-[#2F5FD0] px-5 py-2.5 text-white transition-colors hover:bg-[#2F5FD0]/90 focus:outline-none focus:ring-2 focus:ring-[#2F5FD0]/40"
              >
                Další úloha
              </button>
            </div>
          ) : (
            <>
              <ActiveStep
                key={`${task.id}-${step}`}
                step={step}
                task={task}
                values={inputs}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                verdict={verdict}
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowHint((s) => !s)}
                  className="rounded border border-[#B8651B] px-4 py-2 text-[#B8651B] transition-colors hover:bg-[#B8651B]/5"
                >
                  {showHint ? 'Skrýt nápovědu' : 'Nápověda'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSolution((s) => !s)}
                  className="rounded border border-[#1B2A4A] px-4 py-2 text-[#1B2A4A] transition-colors hover:bg-[#1B2A4A]/5"
                >
                  {showSolution ? 'Skrýt postup' : 'Ukaž mi celý postup'}
                </button>
              </div>

              {showHint && (
                <HintPanel
                  task={task}
                  onUse={handleHintUse}
                  onClose={() => setShowHint(false)}
                />
              )}

              {showSolution && (
                <SolutionPanel
                  task={task}
                  onTrySimilar={() => {
                    setShowSolution(false);
                    nextTask();
                  }}
                  onClose={() => setShowSolution(false)}
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

type ActiveStepProps = {
  step: StepId;
  task: Task;
  values: string[];
  onChange: (index: number, value: string) => void;
  onSubmit: () => void;
  verdict: Verdict | null;
};

function ActiveStep({
  step,
  task,
  values,
  onChange,
  onSubmit,
  verdict,
}: ActiveStepProps) {
  const isAccepted = verdict?.accepted ?? false;
  const buttonLabel =
    verdict === null ? 'Zkontrolovat' : isAccepted ? 'Pokračovat' : 'Zkontrolovat';

  return (
    <div className="border-t border-[#D9D6CE] pt-4">
      <h3 className="mb-4 text-lg font-semibold">{stepTitle(step)}</h3>

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
              <span className="text-xl">→</span>
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
