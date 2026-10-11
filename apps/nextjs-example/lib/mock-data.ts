// Mock CRM data for the example. Fictional people and companies — never production records.
import type { Channel, StatusKey, TrustRung } from "@heigin/ui";

export interface Lead {
  id: string;
  name: string;
  company: string;
  city: string;
  status: StatusKey;
  channel: Channel;
  value: number;
  owner: string | null;
  hot: boolean;
  createdAt: string;
}

export const LEADS: Lead[] = [
  { id: "L-1001", name: "Asha Rao", company: "Kaveri Textiles", city: "Coimbatore", status: "qualified", channel: "whatsapp", value: 849600, owner: "Meera S", hot: true, createdAt: "2026-10-09" },
  { id: "L-1002", name: "Vikram Iyer", company: "Iyer & Sons Pumps", city: "Chennai", status: "new", channel: "missed_call", value: 120000, owner: null, hot: false, createdAt: "2026-10-11" },
  { id: "L-1003", name: "Neha Kapoor", company: "BluePeak Logistics", city: "Gurugram", status: "awaiting_approval", channel: "email", value: 2310000, owner: "Arjun K", hot: true, createdAt: "2026-10-02" },
  { id: "L-1004", name: "Rohan Mehta", company: "Mehta Agro", city: "Nashik", status: "contacted", channel: "indiamart", value: 64000, owner: "Meera S", hot: false, createdAt: "2026-10-08" },
  { id: "L-1005", name: "Priya Nair", company: "Coastline Foods", city: "Kochi", status: "qualified", channel: "web_form", value: 410000, owner: "Ritu P", hot: false, createdAt: "2026-10-05" },
  { id: "L-1006", name: "Imran Shaikh", company: "Shaikh Fabrication", city: "Pune", status: "sent", channel: "whatsapp", value: 1575000, owner: "Ritu P", hot: true, createdAt: "2026-09-28" },
  { id: "L-1007", name: "Kavya Reddy", company: "Deccan Ceramics", city: "Hyderabad", status: "new", channel: "whatsapp", value: 285000, owner: null, hot: false, createdAt: "2026-10-11" },
  { id: "L-1008", name: "Sandeep Gill", company: "Gill Auto Parts", city: "Ludhiana", status: "not_interested", channel: "call", value: 98000, owner: "Arjun K", hot: false, createdAt: "2026-09-21" },
  { id: "L-1009", name: "Ananya Bose", company: "Hooghly Jute Works", city: "Kolkata", status: "contacted", channel: "email", value: 730000, owner: "Meera S", hot: true, createdAt: "2026-10-06" },
  { id: "L-1010", name: "Farhan Qureshi", company: "Qureshi Leathers", city: "Kanpur", status: "won", channel: "in_person", value: 1240000, owner: "Ritu P", hot: false, createdAt: "2026-09-15" },
];

export interface Approval {
  id: string;
  title: string;
  reason: string;
  requestedBy: string;
  rung?: TrustRung;
  undoable: boolean;
  changes?: { field: string; from?: string; to: string }[];
}

export const APPROVALS: Approval[] = [
  {
    id: "A-1",
    title: "Apply 12% discount to Q-1042",
    reason: "Kaveri Textiles is a repeat buyer above ₹10 L annual spend.",
    requestedBy: "Meera S",
    undoable: true,
    changes: [
      { field: "Discount", from: "5%", to: "12%" },
      { field: "Total", from: "₹8,94,316", to: "₹8,49,600" },
    ],
  },
  {
    id: "A-2",
    title: "Send payment reminder on WhatsApp",
    reason: "Invoice INV-2219 (₹1,84,500) is 30 days overdue.",
    requestedBy: "Agent · Receivable reminders",
    rung: 1,
    undoable: false,
  },
];

export const TASKS = [
  { id: "T-1", title: "Call Asha about the revised quote", context: "Kaveri Textiles · D-311", due: "Today, 4:00 pm", overdue: false },
  { id: "T-2", title: "Share GST invoice copy", context: "BluePeak Logistics", due: "Yesterday", overdue: true },
  { id: "T-3", title: "Confirm delivery date", context: "Mehta Agro · SO-88", due: "Fri", overdue: false },
];

/** Simulates a server fetch (used from Server Components). */
export async function getLeads(): Promise<Lead[]> {
  return LEADS;
}
