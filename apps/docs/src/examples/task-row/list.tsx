import { useState } from "react";
import { Avatar, Card, TaskRow } from "@heigin/ui";

const initial = [
  { id: "t1", title: "Call Asha about the revised quote", context: "Kaveri Textiles · Deal D-311", due: "Today, 4:00 pm", overdue: false, owner: "Meera S", done: false },
  { id: "t2", title: "Share GST invoice copy", context: "BluePeak Logistics", due: "Yesterday", overdue: true, owner: "Arjun K", done: false },
  { id: "t3", title: "Confirm delivery date", context: "Mehta Agro · Order SO-88", due: "Fri", overdue: false, owner: "Ritu P", done: true },
];

export default function TaskList() {
  const [tasks, setTasks] = useState(initial);
  return (
    <Card padding="none" style={{ maxWidth: 560 }}>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }} aria-label="My tasks">
        {tasks.map((t) => (
          <TaskRow
            key={t.id}
            title={t.title}
            context={t.context}
            due={t.due}
            overdue={t.overdue}
            done={t.done}
            onDoneChange={(done) => setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, done } : x)))}
            aside={<Avatar name={t.owner} size="xs" />}
          />
        ))}
      </ul>
    </Card>
  );
}
