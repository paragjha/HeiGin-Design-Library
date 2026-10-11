import { Tab, Tabs, TabsList, TabsPanel } from "@heigin/ui";

export default function TabsBasic() {
  return (
    <div style={{ display: "grid", gap: 32 }}>
      <Tabs defaultValue="activity">
        <TabsList aria-label="Deal sections">
          <Tab value="activity">Activity</Tab>
          <Tab value="quotes" count={2}>
            Quotes
          </Tab>
          <Tab value="files">Files</Tab>
          <Tab value="audit" disabled>
            Audit log
          </Tab>
        </TabsList>
        <TabsPanel value="activity">3 calls and 5 WhatsApp messages this week.</TabsPanel>
        <TabsPanel value="quotes">Q-1042 (₹8,49,600) and Q-1043 (₹2,10,000).</TabsPanel>
        <TabsPanel value="files">No files yet.</TabsPanel>
      </Tabs>

      {/* Proposed extension: underline tabs for page-level sections. */}
      <Tabs defaultValue="mine">
        <TabsList variant="underline" aria-label="Lead filter">
          <Tab value="mine">Mine</Tab>
          <Tab value="team">Team</Tab>
          <Tab value="unassigned" count={7}>
            Unassigned
          </Tab>
        </TabsList>
      </Tabs>
    </div>
  );
}
