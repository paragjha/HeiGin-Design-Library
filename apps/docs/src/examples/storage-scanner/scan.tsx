import { useEffect, useRef, useState } from "react";
import { AudioLines, Check, FileDown, FileText, Image, Mail, Mic, Paperclip, ScrollText, Trash2 } from "lucide-react";
import { StorageScanner, type StorageCategory, type StorageScannerStatus, type StorageSuggestion } from "@heigin/ui";

const GB = 1e9;
const CAPACITY = 512 * GB;

// Final sizes, in bar order. Colours are the segment palette this example uses; pass your own.
const CATEGORIES: StorageCategory[] = [
  { id: "attachments", label: "Attachments", size: 52.6 * GB, color: "#4593f0", icon: <Paperclip />, detail: "Quotes and contracts on 1,284 deals. The largest is Northwind's 2026 rate card." },
  { id: "email", label: "Email", size: 36.3 * GB, color: "#3fd864", icon: <Mail />, detail: "Mail synced from 6 shared inboxes since March." },
  { id: "images", label: "Images", size: 58.6 * GB, color: "#e2489b", icon: <Image />, detail: "Photos customers sent on WhatsApp take 31.2 GB of this." },
  { id: "recordings", label: "Calls", size: 44.1 * GB, color: "#9b5ef0", icon: <AudioLines />, detail: "Recorded sales calls from the last 12 months, kept for coaching." },
  { id: "documents", label: "Documents", size: 41.7 * GB, color: "#2ec4d0", icon: <FileText />, detail: "Proposals, invoices and signed agreements." },
  { id: "voice", label: "Voice notes", size: 12.1 * GB, color: "#f2c230", icon: <Mic />, detail: "Voice notes from WhatsApp and the mobile app." },
  { id: "audit", label: "Audit log", size: 34.2 * GB, color: "#b4b4bc", icon: <ScrollText />, detail: "Every change to every record, kept for a year." },
  { id: "exports", label: "Exports", size: 46.8 * GB, color: "#f5822a", icon: <FileDown />, detail: "CSV and PDF exports. Most are older than 30 days." },
  { id: "trash", label: "Trash", size: 31.4 * GB, color: "#ec4a5e", icon: <Trash2 />, detail: "Deleted records stay here for 30 days." },
];
const FINAL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.size]));

const SCAN_PATHS = [
  "/attachments/deals/northwind-2026/rate-card.pdf",
  "/email/sales@/2026-10/inbox",
  "/whatsapp/media/IMG_20261104_1932.jpg",
  "/recordings/2026/11/call-kaveri-textiles.m4a",
  "/documents/invoices/INV-2026-0412.pdf",
  "/whatsapp/voice/PTT-20261118-0917.opus",
  "/audit/2026/11/records.ndjson",
  "/exports/pipeline-q3.csv",
  "/trash/contacts/2026-11-21",
];
const EXPORT_PATHS = ["/exports/pipeline-q1.csv", "/exports/contacts-full-2026-05.csv", "/exports/deals-won-h1.pdf", "/exports/activity-2026-07.csv"];
const TRASH_PATHS = ["/trash/contacts/2026-11-02", "/trash/deals/lost-2026-10", "/trash/attachments/old-quotes"];

const fmt = (bytes: number) => `${(bytes / GB).toFixed(1)} GB`;
const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

type Phase = "scan" | "exports" | "done";

const stop = (timer: { current: number }) => window.clearInterval(timer.current);

/** Calls step(progress 0–1) every 80ms for `seconds`, then done(). One run at a time per timer. */
function animate(timer: { current: number }, seconds: number, step: (p: number, tick: number) => void, done: () => void) {
  window.clearInterval(timer.current);
  const start = performance.now();
  let tick = 0;
  timer.current = window.setInterval(() => {
    const p = Math.min(1, (performance.now() - start) / (seconds * 1000));
    step(p, tick++);
    if (p >= 1) {
      window.clearInterval(timer.current);
      done();
    }
  }, 80);
}

/** Demo only: a scripted scan and clean-up of a sample workspace. */
export default function StorageScannerScan() {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>("scan");
  const [status, setStatus] = useState<StorageScannerStatus>("scanning");
  const [sizes, setSizes] = useState<Record<string, number>>(() => Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])));
  const [path, setPath] = useState<string>();
  const [freed, setFreed] = useState(0);
  const timer = useRef(0);

  useEffect(() => {
    setPhase("scan");
    setStatus("scanning");
    setFreed(0);
    // Categories finish at different times, like a real scan.
    animate(
      timer,
      4.8,
      (p, tick) => {
        setSizes(Object.fromEntries(CATEGORIES.map((c, i) => [c.id, c.size * easeOut((p * 4.8 - i * 0.22) / (2.2 + (i % 3) * 0.45))])));
        setPath(SCAN_PATHS[Math.floor(tick / 2) % SCAN_PATHS.length]);
      },
      () => {
        setSizes(FINAL);
        setPath(undefined);
        setStatus("ready");
      },
    );
    // The interval id changes with every run, so clear whichever one is current at unmount.
    return () => stop(timer);
  }, [run]);

  const clear = (id: string, keep: number, paths: string[], next: Phase) => {
    const from = sizes[id] ?? 0;
    setStatus("clearing");
    animate(
      timer,
      2.6,
      (p, tick) => {
        setSizes((s) => ({ ...s, [id]: from - (from - keep) * easeOut(p) }));
        setPath(paths[Math.floor(tick / 3) % paths.length]);
      },
      () => {
        setSizes((s) => ({ ...s, [id]: keep }));
        setPath(undefined);
        setFreed(from - keep);
        setPhase(next);
        setStatus("ready");
      },
    );
  };

  const categories = CATEGORIES.map((c) => ({ ...c, size: sizes[c.id] ?? 0 }));
  const used = categories.reduce((n, c) => n + c.size, 0);
  const exports = CATEGORIES[7]!;
  const trash = CATEGORIES[8]!;

  let suggestion: StorageSuggestion | undefined;
  if (phase === "scan" && status !== "scanning") {
    suggestion = {
      icon: <FileDown style={{ color: exports.color }} />,
      message: "Old exports are using 45.6 GB. You can run them again.",
      actionLabel: "Delete old exports",
      onAction: () => clear("exports", 1.2 * GB, EXPORT_PATHS, "exports"),
    };
  } else if (phase === "exports") {
    suggestion = {
      icon: <Trash2 style={{ color: trash.color }} />,
      message: `The trash is holding ${fmt(sizes.trash ?? 0)} of records you've already deleted.`,
      actionLabel: "Empty trash",
      onAction: () => clear("trash", 0, TRASH_PATHS, "done"),
    };
  }

  return (
    <div style={{ width: "100%", maxWidth: 640 }}>
      <StorageScanner
        label="Workspace storage"
        categories={categories}
        capacity={CAPACITY}
        status={status}
        activity={status === "clearing" ? (phase === "scan" ? "Deleting old exports" : "Emptying the trash") : undefined}
        path={path}
        note={
          freed > 0 ? (
            <>
              <Check aria-hidden="true" style={{ width: 16, height: 16, color: "var(--hg-color-success)" }} />
              <strong>Freed {fmt(freed)}</strong>
              <span style={{ color: "var(--hg-color-faint)" }}>{fmt(CAPACITY - used)} available</span>
            </>
          ) : undefined
        }
        suggestion={suggestion}
        onRescan={() => setRun((r) => r + 1)}
      />
    </div>
  );
}
