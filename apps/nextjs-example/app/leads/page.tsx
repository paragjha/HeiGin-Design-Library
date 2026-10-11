import type { Metadata } from "next";
import { PageHeader } from "@heigin/ui";
import { getLeads } from "@/lib/mock-data";
import { LeadsView } from "./leads-view";
import { NewLeadDialog } from "./new-lead-dialog";

export const metadata: Metadata = { title: "Leads · HeiGin UI example" };

// Server Component: "fetches" data, renders the header on the server, and passes plain
// data (no functions) into the client table.
export default async function LeadsPage() {
  const leads = await getLeads();
  const open = leads.filter((l) => !["won", "not_interested"].includes(l.status)).length;
  return (
    <div className="content">
      <PageHeader title="Leads" description={`${open} open · ${leads.filter((l) => !l.owner).length} unassigned`} actions={<NewLeadDialog />} />
      <LeadsView leads={leads} />
    </div>
  );
}
