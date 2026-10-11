import { ArrowRightLeft, FileText, MessageCircle, Phone, Sparkles } from "lucide-react";
import { ActivityItem, ActivityTimeline, Card } from "@heigin/ui";

export default function RecordTimeline() {
  return (
    <Card style={{ maxWidth: 560 }}>
      <ActivityTimeline label="Activity for Asha Rao">
        <ActivityItem icon={<MessageCircle strokeWidth={1.6} />} dateTime="2026-10-11T10:42" timeLabel="10:42 am" detail="Can you share the GST invoice for last month?">
          <strong>Asha Rao</strong> sent a WhatsApp message
        </ActivityItem>
        <ActivityItem icon={<Sparkles strokeWidth={1.6} />} dateTime="2026-10-11T10:43" timeLabel="10:43 am">
          Agent drafted a reply for review
        </ActivityItem>
        <ActivityItem icon={<ArrowRightLeft strokeWidth={1.6} />} dateTime="2026-10-10T16:05" timeLabel="Yesterday">
          <strong>Meera S</strong> moved the deal from Qualified to Proposal
        </ActivityItem>
        <ActivityItem icon={<FileText strokeWidth={1.6} />} dateTime="2026-10-10T15:58" timeLabel="Yesterday">
          Quote Q-1042 sent for ₹8,49,600
        </ActivityItem>
        <ActivityItem icon={<Phone strokeWidth={1.6} />} dateTime="2026-10-08T12:10" timeLabel="8 Oct" detail="Wants delivery before Diwali; budget approved.">
          <strong>Meera S</strong> logged a call (6 min)
        </ActivityItem>
      </ActivityTimeline>
    </Card>
  );
}
