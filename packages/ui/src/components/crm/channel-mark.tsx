import * as React from "react";
import { Globe, Mail, MessageCircle, MessageSquare, Phone, PhoneMissed, Store, Users } from "lucide-react";
import { cn } from "../../lib/cn";
import styles from "./crm.module.css";

export type Channel = "whatsapp" | "email" | "sms" | "call" | "missed_call" | "web_form" | "indiamart" | "in_person";

const CHANNELS: Record<Channel, { label: string; Icon: React.ComponentType<{ strokeWidth?: number; "aria-hidden"?: boolean }> }> = {
  whatsapp: { label: "WhatsApp", Icon: MessageCircle },
  email: { label: "Email", Icon: Mail },
  sms: { label: "SMS", Icon: MessageSquare },
  call: { label: "Call", Icon: Phone },
  missed_call: { label: "Missed call", Icon: PhoneMissed },
  web_form: { label: "Web form", Icon: Globe },
  indiamart: { label: "IndiaMART", Icon: Store },
  in_person: { label: "In person", Icon: Users },
};

export interface ChannelMarkProps {
  channel: Channel;
  /** `icon` shows only the icon, but keeps the channel name for assistive tech and as a tooltip. */
  display?: "icon-label" | "icon";
  className?: string;
}

/** Where a lead or conversation came from. WhatsApp green is a channel mark only, never a success colour. */
export function ChannelMark({ channel, display = "icon-label", className }: ChannelMarkProps) {
  const { label, Icon } = CHANNELS[channel];
  return (
    <span
      className={cn(styles.inlineMark, channel === "whatsapp" && styles.channelWhatsapp, className)}
      title={display === "icon" ? label : undefined}
      role={display === "icon" ? "img" : undefined}
      aria-label={display === "icon" ? label : undefined}
      data-channel={channel}
    >
      <Icon strokeWidth={1.6} aria-hidden />
      {display === "icon-label" && label}
    </span>
  );
}
