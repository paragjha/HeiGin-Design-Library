import { Building2, CircleDot, IndianRupee, Layers, User, Workflow } from "lucide-react";
import { Badge, Card, CardHeader, DetailList, MoneyValue } from "@heigin/ui";

const icon = (Icon: typeof Layers) => <Icon strokeWidth={1.6} />;

export default function DealDetails() {
  return (
    <Card padding="none" style={{ maxWidth: 320 }}>
      <CardHeader title="Deal details" />
      <div style={{ padding: 20 }}>
        <DetailList
          items={[
            { label: "Status", icon: icon(CircleDot), value: <Badge dot>open</Badge> },
            { label: "Stage", icon: icon(Layers), value: "New Enquiry" },
            { label: "Value", icon: icon(IndianRupee), value: <MoneyValue amount={849600} /> },
            { label: "Account", icon: icon(Building2), value: <a href="#account">Kaveri Textiles</a> },
            { label: "Owner", icon: icon(User), value: "Meera S" },
            { label: "Pipeline", icon: icon(Workflow), value: "Industrial Sales" },
          ]}
        />
      </div>
    </Card>
  );
}
