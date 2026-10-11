import { Plus, Upload } from "lucide-react";
import { Button, PageHeader } from "@heigin/ui";

export default function PageHeaderBasic() {
  return (
    // level={2} only because this demo sits inside a docs page; in your app keep the default h1.
    <PageHeader
      level={2}
      title="Leads"
      description="61 open · 7 need a first reply"
      actions={
        <>
          <Button variant="secondary" leadingIcon={<Upload strokeWidth={1.6} />}>
            Import
          </Button>
          <Button leadingIcon={<Plus strokeWidth={1.6} />}>New lead</Button>
        </>
      }
    />
  );
}
