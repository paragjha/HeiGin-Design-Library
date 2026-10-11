import { CheckCheck } from "lucide-react";
import { Button, Card, EmptyState } from "@heigin/ui";

export default function EmptyStateBasic() {
  return (
    <Card padding="none">
      <EmptyState
        icon={<CheckCheck strokeWidth={1.6} />}
        title="You're all caught up"
        description="No approvals are waiting for you. New discount and quote approvals will show up here."
        action={
          <Button variant="secondary" size="sm">
            View approval history
          </Button>
        }
      />
    </Card>
  );
}
