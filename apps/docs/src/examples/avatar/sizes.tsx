import { Avatar } from "@heigin/ui";

export default function AvatarSizes() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar name="Asha Rao" size="xs" />
      <Avatar name="Vikram Iyer" size="sm" />
      <Avatar name="Neha Kapoor" size="md" />
      <Avatar name="Northwind Industrial" size="lg" />
      {/* A broken image URL falls back to initials. */}
      <Avatar name="Rohan Mehta" src="/missing-avatar.png" />
    </div>
  );
}
