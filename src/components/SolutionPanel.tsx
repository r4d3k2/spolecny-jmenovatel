import { useState } from 'react';
import Fraction from './Fraction';
import type { Task } from '../lib/tasks';

type SolutionPanelProps = {
  task: Task;
  onTrySimilar: () => void;
  onClose?: () => void;
};

export default function SolutionPanel({ task, onTrySimilar, onClose }: SolutionPanelProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Společný jmenovatel',
      body: (
        <>
          <p>
            Hledáme nejmenší společný násobek jmenovatelů. Je to{' '}
            <strong>{task.lcd}</strong>.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-2xl">
            {task.fractions.map((f, i) => (
              <Fraction key={i} n={f.n} d={f.d} />
            ))}
          </div>
        </>
      ),
    },
    {
      title: 'Rozšiřující činitele',
      body: (
        <>
          <p>Nového jmenovatele vydělíme původním jmenovatelem.</p>
          <div className="mt-2 space-y-1">
            {task.fractions.map((f, i) => (
              <p key={i} className="font-mono">
                {task.lcd} : {f.d} = {task.multipliers[i]}
              </p>
            ))}
          </div>
        </>
      ),
    },
    {
      title: 'Nové čitatele',
      body: (
        <>
          <p>Každý čitatel vynásobíme rozšiřujícím činitelem.</p>
          <div className="mt-2 space-y-1">
            {task.fractions.map((f, i) => (
              <p key={i} className="font-mono">
                {f.n} × {task.multipliers[i]} = {task.expanded[i].n}
              </p>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-2xl">
            {task.expanded.map((f, i) => (
              <Fraction key={i} n={f.n} d={f.d} />
            ))}
          </div>
        </>
      ),
    },
  ];

  const isLast = step === steps.length - 1;

  return (
    <div className="mt-4 rounded border border-[#D9D6CE] bg-[#FBFAF7] p-4">
      <h4 className="mb-2 font-semibold text-[#1B2A4A]">Celý postup – {steps[step].title}</h4>
      <div className="mb-4 text-[#1B2A4A]">{steps[step].body}</div>

      <div className="flex flex-wrap gap-3">
        {!isLast ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="rounded bg-[#2F5FD0] px-4 py-2 text-white transition-colors hover:bg-[#2F5FD0]/90"
          >
            Další krok
          </button>
        ) : (
          <button
            type="button"
            onClick={onTrySimilar}
            className="rounded bg-[#2E7D55] px-4 py-2 text-white transition-colors hover:bg-[#2E7D55]/90"
          >
            Zkus podobnou úlohu
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-[#D9D6CE] bg-white px-4 py-2 text-[#1B2A4A] transition-colors hover:border-[#1B2A4A]"
        >
          Zavřít
        </button>
      </div>
    </div>
  );
}
