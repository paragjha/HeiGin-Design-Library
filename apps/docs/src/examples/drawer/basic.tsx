import { Button, Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@heigin/ui";

export default function DrawerBasic() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Drawer>
        <DrawerTrigger render={<Button variant="secondary" />}>Open lead details</DrawerTrigger>
        <DrawerContent
          title="Asha Rao"
          description="Kaveri Textiles · Coimbatore"
          footer={<DrawerClose render={<Button variant="secondary" />}>Close</DrawerClose>}
        >
          <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", margin: 0, fontSize: 13 }}>
            <dt style={{ color: "var(--hg-color-muted)" }}>Stage</dt>
            <dd style={{ margin: 0 }}>Qualified</dd>
            <dt style={{ color: "var(--hg-color-muted)" }}>Value</dt>
            <dd style={{ margin: 0 }}>₹8,49,600</dd>
            <dt style={{ color: "var(--hg-color-muted)" }}>Owner</dt>
            <dd style={{ margin: 0 }}>Meera S</dd>
          </dl>
        </DrawerContent>
      </Drawer>
      <Drawer>
        <DrawerTrigger render={<Button variant="secondary" />}>Bottom sheet</DrawerTrigger>
        <DrawerContent side="bottom" title="Quick actions">
          <p style={{ margin: 0 }}>Bottom sheets suit mobile layouts.</p>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
