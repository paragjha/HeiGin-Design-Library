import * as React from "react";
import { Info, TriangleAlert } from "lucide-react";

export function Callout({ tone = "info", title, children }: { tone?: "info" | "warning"; title: string; children: React.ReactNode }) {
  const Icon = tone === "warning" ? TriangleAlert : Info;
  return (
    <aside className={`callout callout--${tone}`} aria-label={title}>
      <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
      <div>
        <p className="callout__title">{title}</p>
        <div className="callout__body">{children}</div>
      </div>
    </aside>
  );
}
