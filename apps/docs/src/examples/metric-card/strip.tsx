import { IndianRupee, MessageCircle, Timer, Wallet } from "lucide-react";
import { MetricCard, MoneyValue } from "@heigin/ui";

export default function MetricStrip() {
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
      <MetricCard
        label="Open pipeline"
        icon={<IndianRupee strokeWidth={1.6} />}
        value={<MoneyValue amount={23100000} format="compact" />}
        trend={{ direction: "up", label: "12%" }}
        hint="vs last month"
      />
      <MetricCard label="Unreplied chats" icon={<MessageCircle strokeWidth={1.6} />} value="7" tone="warning" hint="2 past SLA" />
      <MetricCard label="Avg first reply" icon={<Timer strokeWidth={1.6} />} value="18m" trend={{ direction: "down", label: "4m", good: true }} hint="faster" />
      <MetricCard label="Overdue receivables" icon={<Wallet strokeWidth={1.6} />} value={<MoneyValue amount={384500} />} tone="danger" />
    </div>
  );
}
