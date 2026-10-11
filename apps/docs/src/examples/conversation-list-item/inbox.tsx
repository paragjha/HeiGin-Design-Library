import { useState } from "react";
import { Card, ConversationListItem, SLAClock, Tab, Tabs, TabsList } from "@heigin/ui";

const threads = [
  { id: "c1", name: "Asha Rao", preview: "Can you share the GST invoice for last month?", channel: "whatsapp", time: "10:42 am", unread: 2, sla: <SLAClock state="due_soon" time="12m" /> },
  { id: "c2", name: "Vikram Iyer", preview: "Please call me after 3 pm regarding the pump order.", channel: "missed_call", time: "9:15 am", unread: 1, sla: <SLAClock state="breached" time="20m over" /> },
  { id: "c3", name: "Neha Kapoor", preview: "Thanks, the revised quote looks good.", channel: "email", time: "Yesterday", unread: 0, sla: null },
] as const;

export default function Inbox() {
  const [lane, setLane] = useState("unassigned");
  const [selected, setSelected] = useState("c1");
  return (
    <div style={{ maxWidth: 520, display: "grid", gap: 12 }}>
      <Tabs value={lane} onValueChange={setLane}>
        <TabsList aria-label="Inbox lanes">
          <Tab value="unassigned" count={3}>
            Unassigned
          </Tab>
          <Tab value="mine">Mine</Tab>
          <Tab value="waiting">Waiting</Tab>
        </TabsList>
      </Tabs>
      <Card padding="none">
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }} aria-label="Conversations">
          {threads.map((t) => (
            <ConversationListItem
              key={t.id}
              name={t.name}
              preview={t.preview}
              channel={t.channel}
              timeLabel={t.time}
              dateTime="2026-10-11"
              unreadCount={t.unread}
              selected={selected === t.id}
              href={`#thread-${t.id}`}
              aside={t.sla}
              linkProps={{
                onClick: (e) => {
                  e.preventDefault();
                  setSelected(t.id);
                },
              }}
            />
          ))}
        </ul>
      </Card>
    </div>
  );
}
