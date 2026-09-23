import { useEffect, useState } from 'react';
import Fraction from '../components/Fraction';
import StepPanel, { stepTitle } from '../components/StepPanel';
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

export default function Practice() {
  const [level, setLevel] = useState<Level>(2);
  const [task, setTask] = useState<Task>(() => generateTask(2));
  const [step, setStep] = useState<StepId>('denominator');
  const [inputs, setInputs] = useState<string[]>(['']);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setStep('denominator');
    setInputs(['']);
    setVerdict(null);
    setHistory([]);
    setDone(false);
  }, [task]);

  function changeLevel(newLevel: Level) {
    setLevel(newLevel);
    setTask(generateTask(newLevel));
  }

  function nextTask() {
    setTask((prev) => generateTask(level, prev.id));
  }

  function handleInputChange(index: number, value: string) {
    setInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function advance() {
    const nums = inputs.map((v) => parseInt(v, 10)).filter((n) => !Number.isNaN(n));
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

  return (
    <div className="min-h-screen bg-[#FBFAF7] p-4 text-[#1B2A4A] md:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Převeď na společného jmenovatele</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm">Úroveň:</span>
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
        </header>

        <section className="mb-6 rounded border border-[#D9D6CE] bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-3xl">
            {task.fractions.map((f, i) => (
              <Fraction key={i} n={f.n} d={f.d} />
            ))}
          </div>

          {history.length > 0 && (
            <div className="mb-4 border-t border-[#D9D6CE] pt-4">
              {history.map((h, i) => (
                <div key={i} className="mb-2 text-[#1B2A4A]">
                  <span className="font-medium">{stepTitle(h.step)}:</span>{' '}
                  <span className="font-mono text-lg">{h.values.join(', ')}</span>
                </div>
              ))}
            </div>
          )}

          {done ? (
            <div className="mt-4">
              <p className="text-lg leading-relaxed">
                Teď už mají všechny zlomky společného jmenovatele a můžeš je porovnávat,
                sčítat a odčítat.
              </p>
              <div className="my-6 flex flex-wrap items-center gap-6 text-3xl">
                {task.expanded.map((f, i) => (
                  <Fraction key={i} n={f.n} d={f.d} />
                ))}
              </div>
              <button
                type="button"
                onClick={nextTask}
                className="rounded bg-[#2F5FD0] px-5 py-2.5 text-white transition-colors hover:bg-[#2F5FD0]/90 focus:outline-none focus:ring-2 focus:ring-[#2F5FD0]/40"
              >
                Další úloha
              </button>
            </div>
          ) : (
            <StepPanel
              key={`${task.id}-${step}`}
              step={step}
              task={task}
              values={inputs}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              verdict={verdict}
            />
          )}
        </section>
      </div>
    </div>
  );
}
