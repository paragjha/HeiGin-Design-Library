import { AlarmClock, IndianRupee, Inbox, Target, Trophy } from "lucide-react";
import { MetricCard, MetricGroup, MoneyValue } from "@heigin/ui";

const icon = (Icon: typeof Target) => <Icon size={15} strokeWidth={1.6} />;

// The production Dashboard KPI strip: one bordered surface, five cells from 1024px.
export default function MetricStrip() {
  return (
    <MetricGroup label="Pipeline summary" columns={5}>
      <MetricCard label="Open pipeline" icon={icon(IndianRupee)} value={<MoneyValue amount={2310000} format="compact" />} hint="18 open deals" />
      <MetricCard label="Win rate" icon={icon(Target)} value="64.0%" hint="16 won · 9 lost" />
      <MetricCard label="Won value" icon={icon(Trophy)} value={<MoneyValue amount={48500000} format="compact" />} hint="Closed won, all time" />
      <MetricCard label="New leads" icon={icon(Inbox)} value="342" hint="4.1% converted overall" />
      <MetricCard label="Overdue tasks" icon={icon(AlarmClock)} value="5" tone="danger" hint="Needs follow-up" />
    </MetricGroup>
  );
}
