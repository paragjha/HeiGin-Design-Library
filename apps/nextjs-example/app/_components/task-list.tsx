"use client";

import { useState } from "react";
import { TaskRow } from "@heigin/ui";

interface Task {
  id: string;
  title: string;
  context: string;
  due: string;
  overdue: boolean;
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  return (
    <ul className="list-reset" aria-label="My tasks">
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          title={t.title}
          context={t.context}
          due={t.due}
          overdue={t.overdue}
          done={done.has(t.id)}
          onDoneChange={(isDone) =>
            setDone((prev) => {
              const next = new Set(prev);
              if (isDone) next.add(t.id);
              else next.delete(t.id);
              return next;
            })
          }
        />
      ))}
    </ul>
  );
}
