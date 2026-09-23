import { useEffect, useState } from 'react';
import type { Task } from '../lib/tasks';

type HintPanelProps = {
  task: Task;
  onUse?: () => void;
  onClose?: () => void;
};

function multiples(d: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i + 1) * d);
}

export default function HintPanel({ task, onUse, onClose }: HintPanelProps) {
  const [stage, setStage] = useState(1);

  useEffect(() => {
    onUse?.();
  }, [onUse]);

  const denominators = task.fractions.map((f) => f.d);

  return (
    <div className="mt-4 rounded border border-[#D9D6CE] bg-[#FBFAF7] p-4">
      <h4 className="mb-3 font-semibold text-[#1B2A4A]">Nápověda {stage}/3</h4>

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {denominators.map((d, idx) => (
          <div key={idx}>
            <div className="mb-1 text-sm font-medium text-[#1B2A4A]">Násobky {d}:</div>
            <ul className="space-y-0.5 text-[#1B2A4A]">
              {multiples(d, 8).map((m) => {
                const isCommon = stage >= 2 && m === task.lcd;
                return (
                  <li
                    key={m}
                    className={`${
                      isCommon
                        ? 'font-bold text-[#2F5FD0]'
                        : ''
                    }`}
                  >
                    {m}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {stage >= 3 && (
        <div className="mb-4 space-y-1 text-[#1B2A4A]">
          {task.fractions.map((f, i) => (
            <p key={i}>
              {task.lcd} : {f.d} = <strong>{task.multipliers[i]}</strong>
            </p>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {stage < 3 && (
          <button
            type="button"
            onClick={() => setStage((s) => (s < 3 ? (s + 1) : s))}
            className="rounded border border-[#2F5FD0] px-4 py-2 text-[#2F5FD0] transition-colors hover:bg-[#2F5FD0]/5"
          >
            Další nápověda
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-[#D9D6CE] bg-white px-4 py-2 text-[#1B2A4A] transition-colors hover:border-[#1B2A4A]"
        >
          Skrýt nápovědu
        </button>
      </div>
    </div>
  );
}
