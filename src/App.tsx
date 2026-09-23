import { generateTask } from './lib/tasks';
import type { Level, Task } from './lib/tasks';

const LEVELS: Level[] = [1, 2, 3, 4, 5];

function taskToText(task: Task): string {
  const fractions = task.fractions.map((f) => `${f.n}/${f.d}`).join(' a ');
  const expanded = task.expanded.map((f) => `${f.n}/${f.d}`).join(' a ');
  return `${fractions} → spol. jmenovatel ${task.lcd}, násobky [${task.multipliers.join(', ')}], rozšířeno [${expanded}]`;
}

export default function App() {
  const tasksByLevel = LEVELS.map((level) => ({
    level,
    tasks: Array.from({ length: 5 }, () => generateTask(level)),
  }));

  return (
    <div className="min-h-screen bg-[#FBFAF7] p-6 text-[#1B2A4A]">
      <h1 className="mb-6 text-2xl font-bold">Trenažér zlomků – Fáze 1</h1>
      {tasksByLevel.map(({ level, tasks }) => (
        <section key={level} className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">Úroveň {level}</h2>
          <ul className="list-disc space-y-1 pl-5">
            {tasks.map((task) => (
              <li key={task.id} className="font-mono text-sm">
                {taskToText(task)}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
