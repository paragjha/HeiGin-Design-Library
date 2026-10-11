import { MoreHorizontal, Pencil, Phone, Trash2 } from "lucide-react";
import { IconButton } from "@heigin/ui";

export default function IconButtonBasic() {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <IconButton label="Call contact" icon={<Phone strokeWidth={1.6} />} />
      <IconButton label="Edit lead" icon={<Pencil strokeWidth={1.6} />} variant="secondary" />
      <IconButton label="Delete" icon={<Trash2 strokeWidth={1.6} />} variant="danger" />
      <IconButton label="More actions" icon={<MoreHorizontal strokeWidth={1.6} />} size="sm" />
    </div>
  );
}
