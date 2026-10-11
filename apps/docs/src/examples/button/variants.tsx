import { Button } from "@heigin/ui";

export default function ButtonVariants() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <Button variant="primary">Create lead</Button>
      <Button variant="secondary">Export</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">Delete quote</Button>
      <Button variant="link">View all</Button>
    </div>
  );
}
