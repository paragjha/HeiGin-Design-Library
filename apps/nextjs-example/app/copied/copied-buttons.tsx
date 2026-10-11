"use client";

import { useState } from "react";
import { Button } from "@/components/heigin/components/ui/button";

export function CopiedButtons() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button onClick={() => setCount((c) => c + 1)}>Copied Button</Button>
      <Button variant="secondary" loading>
        Loading
      </Button>
      <span role="status" className="muted">
        Clicked {count} times
      </span>
    </div>
  );
}
