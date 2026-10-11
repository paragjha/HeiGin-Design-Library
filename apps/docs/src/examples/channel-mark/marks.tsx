import { ChannelMark, TrustRungBadge, type Channel } from "@heigin/ui";

const channels: Channel[] = ["whatsapp", "email", "sms", "call", "missed_call", "web_form", "indiamart", "in_person"];

export default function Marks() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {channels.map((c) => (
          <ChannelMark key={c} channel={c} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {channels.slice(0, 4).map((c) => (
          <ChannelMark key={c} channel={c} display="icon" />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <TrustRungBadge rung={0} />
        <TrustRungBadge rung={1} />
        <TrustRungBadge rung={2} />
        <TrustRungBadge rung={3} />
      </div>
    </div>
  );
}
