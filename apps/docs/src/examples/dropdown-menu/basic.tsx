import { useState } from "react";
import { Archive, ChevronDown, Copy, Pencil, Trash2, UserPlus } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@heigin/ui";

export default function DropdownMenuBasic() {
  const [last, setLast] = useState("nothing yet");
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="secondary" trailingIcon={<ChevronDown strokeWidth={1.6} />} />}>
          Actions
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup label="Lead">
            <DropdownMenuItem icon={<Pencil strokeWidth={1.6} />} shortcut="E" onClick={() => setLast("Edit")}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem icon={<UserPlus strokeWidth={1.6} />} onClick={() => setLast("Assign owner")}>
              Assign owner
            </DropdownMenuItem>
            <DropdownMenuItem icon={<Copy strokeWidth={1.6} />} onClick={() => setLast("Duplicate")}>
              Duplicate
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem icon={<Archive strokeWidth={1.6} />} disabled>
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Trash2 strokeWidth={1.6} />} tone="danger" onClick={() => setLast("Delete")}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span role="status" style={{ fontSize: 12, color: "var(--hg-color-muted)" }}>
        Last action: {last}
      </span>
    </div>
  );
}
