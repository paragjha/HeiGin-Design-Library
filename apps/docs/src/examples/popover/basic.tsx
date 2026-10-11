import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button, Checkbox, Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@heigin/ui";

export default function PopoverBasic() {
  const [hot, setHot] = useState(true);
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" leadingIcon={<SlidersHorizontal strokeWidth={1.6} />} />}>
        Filters
      </PopoverTrigger>
      <PopoverContent title="Filter leads" description="Applies to the list below.">
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <Checkbox label="Hot leads only" checked={hot} onCheckedChange={setHot} />
          <Checkbox label="Unassigned" />
          <PopoverClose render={<Button size="sm" />}>Apply</PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
