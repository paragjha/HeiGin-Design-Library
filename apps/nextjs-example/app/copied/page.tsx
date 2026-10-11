import type { Metadata } from "next";
// Option B: components copied into this repo with
//   npm run copy-components   (node ../../scripts/copy-component.mjs button badge card status-badge --dest ./components/heigin)
// No @heigin/ui import on this page — everything below comes from local source files.
import "@/components/heigin/styles/tokens.css";
import { Badge } from "@/components/heigin/components/ui/badge";
import { Card, CardHeader } from "@/components/heigin/components/ui/card";
import { StatusBadge } from "@/components/heigin/components/crm/status-badge";
import { CopiedButtons } from "./copied-buttons";

export const metadata: Metadata = { title: "Copied source · HeiGin UI example" };

export default function CopiedPage() {
  return (
    <div className="content">
      <header>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: "-0.015em" }}>Copied source</h1>
        <p className="muted" style={{ margin: "4px 0 0" }}>
          This page imports from <code>components/heigin/</code>, which the copy script generated, not from the package.
        </p>
      </header>
      <Card>
        <CardHeader title="Kaveri Textiles" description="Rendered with the copied Card, Badge and StatusBadge (Server Components)" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StatusBadge status="qualified" />
          <StatusBadge status="overdue" />
          <Badge tone="outline">B2B</Badge>
        </div>
      </Card>
      <CopiedButtons />
    </div>
  );
}
