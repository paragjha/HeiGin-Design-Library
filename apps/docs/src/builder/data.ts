// Fictional mock data shared by the canvas and the generated code (so both always match).
import {
  AlarmClock,
  ArrowRightLeft,
  Building2,
  CalendarCheck,
  Download,
  FileText,
  Filter,
  IndianRupee,
  Inbox,
  Layers,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  Target,
  Trash2,
  Trophy,
  Upload,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { StatusKey } from "@heigin/ui";

export const ICONS: Record<string, LucideIcon> = {
  Plus,
  Upload,
  Download,
  Pencil,
  Trash2,
  Filter,
  Search,
  Settings,
  Phone,
  Mail,
  MessageCircle,
  Users,
  User,
  Building2,
  IndianRupee,
  Wallet,
  Target,
  Trophy,
  Inbox,
  AlarmClock,
  CalendarCheck,
  FileText,
  Layers,
  ArrowRightLeft,
};
export const ICON_NAMES = ["none", ...Object.keys(ICONS)] as const;

export interface LeadRow {
  id: string;
  name: string;
  company: string;
  status: StatusKey;
  owner: string;
  value: number;
}
export const LEAD_ROWS: LeadRow[] = [
  { id: "L-1001", name: "Asha Rao", company: "Kaveri Textiles", status: "qualified", owner: "Meera S", value: 849600 },
  { id: "L-1002", name: "Vikram Iyer", company: "Iyer & Sons Pumps", status: "new", owner: "Unassigned", value: 120000 },
  { id: "L-1003", name: "Neha Kapoor", company: "BluePeak Logistics", status: "awaiting_approval", owner: "Arjun K", value: 2310000 },
  { id: "L-1004", name: "Rohan Mehta", company: "Mehta Agro", status: "contacted", owner: "Meera S", value: 64000 },
  { id: "L-1005", name: "Priya Nair", company: "Coastline Foods", status: "qualified", owner: "Ritu P", value: 410000 },
  { id: "L-1006", name: "Imran Shaikh", company: "Shaikh Fabrication", status: "sent", owner: "Ritu P", value: 1575000 },
  { id: "L-1007", name: "Kavya Reddy", company: "Deccan Ceramics", status: "new", owner: "Unassigned", value: 285000 },
  { id: "L-1008", name: "Ananya Bose", company: "Hooghly Jute Works", status: "contacted", owner: "Meera S", value: 730000 },
];

export interface DealRow {
  id: string;
  name: string;
  account: string;
  stage: string;
  status: StatusKey;
  value: number;
}
export const DEAL_ROWS: DealRow[] = [
  { id: "D-311", name: "40 looms", account: "Kaveri Textiles", stage: "Proposal", status: "awaiting_approval", value: 849600 },
  { id: "D-312", name: "Fleet tracking", account: "BluePeak Logistics", stage: "Negotiation", status: "sent", value: 2310000 },
  { id: "D-313", name: "Pump spares", account: "Iyer & Sons Pumps", stage: "Qualified", status: "qualified", value: 120000 },
  { id: "D-314", name: "Cold room", account: "Coastline Foods", stage: "Won", status: "won", value: 410000 },
  { id: "D-315", name: "Fabrication line", account: "Shaikh Fabrication", stage: "Proposal", status: "draft", value: 1575000 },
  { id: "D-316", name: "Jute bags", account: "Hooghly Jute Works", stage: "Lost", status: "lost", value: 730000 },
];

export interface ColumnSpec {
  id: string;
  header: string;
  kind: "person" | "text" | "status" | "money";
  /** For person: secondary line field. */
  sub?: string;
  hideOnMobile?: boolean;
}

export const DATASETS = {
  leads: {
    label: "Leads",
    rowType: "LeadRow",
    rows: LEAD_ROWS as unknown as Record<string, string | number>[],
    typeDecl: `type LeadRow = { id: string; name: string; company: string; status: StatusKey; owner: string; value: number };`,
    columns: [
      { id: "name", header: "Lead", kind: "person", sub: "company" },
      { id: "status", header: "Status", kind: "status" },
      { id: "owner", header: "Owner", kind: "text", hideOnMobile: true },
      { id: "value", header: "Value", kind: "money" },
    ] as ColumnSpec[],
  },
  deals: {
    label: "Deals",
    rowType: "DealRow",
    rows: DEAL_ROWS as unknown as Record<string, string | number>[],
    typeDecl: `type DealRow = { id: string; name: string; account: string; stage: string; status: StatusKey; value: number };`,
    columns: [
      { id: "name", header: "Deal", kind: "person", sub: "account" },
      { id: "stage", header: "Stage", kind: "text", hideOnMobile: true },
      { id: "status", header: "Status", kind: "status" },
      { id: "value", header: "Value", kind: "money" },
    ] as ColumnSpec[],
  },
} as const;
export type DatasetKey = keyof typeof DATASETS;

/** Timeline icons cycle through these by entry position. */
export const TIMELINE_ICONS = ["MessageCircle", "Phone", "ArrowRightLeft", "FileText"] as const;
