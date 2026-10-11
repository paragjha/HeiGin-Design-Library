import { ArrowRightLeft, FileText, IndianRupee, MessageCircle, Phone, Timer, Wallet } from "lucide-react";
import { ActivityItem, ActivityTimeline, Card, CardHeader, MetricCard, MetricGroup, MoneyValue, PageHeader } from "@heigin/ui";
import { APPROVALS, TASKS } from "@/lib/mock-data";
import { ApprovalQueue } from "./_components/approval-queue";
import { TaskList } from "./_components/task-list";

// Server Component: renders server-safe HeiGin components directly and hands
// interactive parts (approvals, tasks) to small client islands.
export default function TodayPage() {
  return (
    <div className="content">
      <PageHeader title="Today" description="Saturday, 11 October · 2 approvals and 3 tasks need you" />

      <MetricGroup label="Summary" columns={4}>
        <MetricCard label="Open pipeline" icon={<IndianRupee strokeWidth={1.6} />} value={<MoneyValue amount={23100000} format="compact" />} trend={{ direction: "up", label: "12%" }} hint="vs last month" />
        <MetricCard label="Unreplied chats" icon={<MessageCircle strokeWidth={1.6} />} value="7" tone="warning" hint="2 past SLA" />
        <MetricCard label="Avg first reply" icon={<Timer strokeWidth={1.6} />} value="18m" trend={{ direction: "down", label: "4m", good: true }} hint="faster" />
        <MetricCard label="Overdue receivables" icon={<Wallet strokeWidth={1.6} />} value={<MoneyValue amount={384500} />} tone="danger" />
      </MetricGroup>

      <div className="grid-two">
        <section aria-labelledby="approvals-h" className="stack">
          <h2 id="approvals-h" className="section-title">
            Needs your approval
          </h2>
          <ApprovalQueue approvals={APPROVALS} />
        </section>

        <div className="stack">
          <Card padding="none">
            <CardHeader title="My tasks" description="Due today and overdue" />
            <TaskList tasks={TASKS} />
          </Card>
          <Card>
            <CardHeader title="Recent activity" />
            <ActivityTimeline label="Recent activity">
              <ActivityItem icon={<MessageCircle strokeWidth={1.6} />} dateTime="2026-10-11T10:42" timeLabel="10:42 am" detail="Can you share the GST invoice for last month?">
                <strong>Asha Rao</strong> sent a WhatsApp message
              </ActivityItem>
              <ActivityItem icon={<ArrowRightLeft strokeWidth={1.6} />} dateTime="2026-10-10T16:05" timeLabel="Yesterday">
                <strong>Meera S</strong> moved Kaveri Textiles to Proposal
              </ActivityItem>
              <ActivityItem icon={<FileText strokeWidth={1.6} />} dateTime="2026-10-10T15:58" timeLabel="Yesterday">
                Quote Q-1042 sent for ₹8,49,600
              </ActivityItem>
              <ActivityItem icon={<Phone strokeWidth={1.6} />} dateTime="2026-10-08T12:10" timeLabel="8 Oct">
                <strong>Arjun K</strong> logged a call with BluePeak Logistics
              </ActivityItem>
            </ActivityTimeline>
          </Card>
        </div>
      </div>
    </div>
  );
}
