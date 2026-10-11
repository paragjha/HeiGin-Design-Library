import { MessageCircle, Pencil } from "lucide-react";
import { Button, Card, ChannelMark, DealStage, MoneyValue, RecordHeader, StatusBadge } from "@heigin/ui";

const STAGES = ["New", "Qualified", "Proposal", "Negotiation", "Won"];

export default function DealHeader() {
  return (
    <Card style={{ display: "grid", gap: 20 }}>
      {/* level={2} only because this demo sits inside a docs page; detail pages keep the default h1. */}
      <RecordHeader
        level={2}
        name="Kaveri Textiles — 40 looms"
        status={<StatusBadge status="awaiting_approval" />}
        breadcrumbs={[{ label: "Deals", href: "#/patterns/record-header" }, { label: "D-311" }]}
        meta={[<MoneyValue key="v" amount={849600} />, "Owner: Meera S", "Coimbatore", <ChannelMark key="c" channel="whatsapp" />]}
        actions={
          <>
            <Button variant="secondary" leadingIcon={<Pencil strokeWidth={1.6} />}>
              Edit
            </Button>
            <Button leadingIcon={<MessageCircle strokeWidth={1.6} />}>Message</Button>
          </>
        }
      />
      <DealStage stages={STAGES} current="Proposal" />
      <div style={{ display: "grid", gap: 8, maxWidth: 200 }}>
        <span style={{ fontSize: 12, color: "var(--hg-color-muted)" }}>Compact (table cell) and lost:</span>
        <DealStage stages={STAGES} current="Proposal" compact />
        <DealStage stages={STAGES} current="Negotiation" lost compact />
      </div>
    </Card>
  );
}
