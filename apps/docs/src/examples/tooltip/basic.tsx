import { Info, Phone } from "lucide-react";
import { IconButton, Tooltip, TooltipProvider } from "@heigin/ui";

export default function TooltipBasic() {
  return (
    <TooltipProvider>
      <div style={{ display: "flex", gap: 8 }}>
        <Tooltip content="Call Asha Rao (+91 98765 43210)">
          <IconButton label="Call" icon={<Phone strokeWidth={1.6} />} variant="secondary" />
        </Tooltip>
        <Tooltip content="Intent score blends reply speed, budget and fit" side="right">
          <IconButton label="About intent score" icon={<Info strokeWidth={1.6} />} />
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
