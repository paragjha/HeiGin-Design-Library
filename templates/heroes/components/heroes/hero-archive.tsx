"use client";

import * as React from "react";
import { AgentTaskTrail, HeiGinMark, type AgentStep } from "@heigin/ui";
import { Brand } from "@/components/heroes/brand";
import { ServiceLogo } from "@/components/heroes/service-logos";
import { heroesConfig, serviceLabels } from "@/lib/heroes-config";
import { cn, seeded } from "@/lib/heroes-utils";

/* ---------- archival collage: drawn once on the client, then drifted ---------- */

type Kind = "drawing" | "punch" | "photo" | "schematic" | "print" | "sea";
const KINDS: Kind[] = ["drawing", "punch", "photo", "schematic", "print", "sea"];
const SIZES: [number, number][] = [[83, 110], [110, 83], [143, 143], [160, 210], [200, 150], [120, 160]];

function paint(kind: Kind, w: number, h: number, r: () => number) {
  const c = document.createElement("canvas");
  c.width = w * 2;
  c.height = h * 2;
  const x = c.getContext("2d");
  if (!x) return "";
  x.scale(2, 2);
  if (kind === "drawing") {
    x.fillStyle = "#c5d3da";
    x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(40,60,70,.45)";
    x.lineWidth = 0.6;
    for (let i = 0; i < 18; i++) {
      x.beginPath();
      x.moveTo(0, h * 0.15 + i * h * 0.05);
      x.lineTo(w, h * 0.15 + i * h * 0.05);
      x.stroke();
    }
    for (let i = 0; i < 14; i++) {
      x.beginPath();
      x.moveTo(w * 0.1, h * 0.2);
      x.bezierCurveTo(w * 0.5, h * 0.2, w * (0.4 + i * 0.03), h * (0.4 + i * 0.02), w * (0.55 + i * 0.03), h * 0.95);
      x.stroke();
    }
  } else if (kind === "punch") {
    x.fillStyle = "#b8c6d4";
    x.fillRect(0, 0, w, h);
    x.fillStyle = "rgba(255,255,255,.85)";
    for (let row = 0; row < 12; row++) for (let k = 0; k < Math.floor(w / 4.2); k++) if (r() < 0.42) x.fillRect(4 + k * 4.2, 8 + (row * (h - 12)) / 12, 2, 4);
  } else if (kind === "photo") {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#8f8f8f");
    g.addColorStop(1, "#4a4a4a");
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    x.fillStyle = "#d9d9d9";
    x.fillRect(w * 0.22, h * 0.2, w * 0.56, h * 0.4);
    x.fillStyle = "#2b2b2b";
    x.fillRect(w * 0.26, h * 0.24, w * 0.48, h * 0.3);
    x.fillStyle = "rgba(220,220,220,.65)";
    for (let i = 0; i < 8; i++) x.fillRect(w * 0.29, h * (0.27 + i * 0.03), w * (0.15 + r() * 0.25), 1.2);
    x.fillStyle = "#bdbdbd";
    x.fillRect(w * 0.14, h * 0.62, w * 0.72, h * 0.14);
  } else if (kind === "schematic") {
    x.fillStyle = "#e7e4dc";
    x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(50,50,50,.6)";
    x.lineWidth = 0.7;
    const boxes = Array.from({ length: 9 }, () => [r() * w * 0.8, r() * h * 0.85, 10 + r() * 14, 6 + r() * 8] as const);
    boxes.forEach((b, i) => {
      x.strokeRect(...b);
      const p = boxes[i - 1];
      if (p) {
        x.beginPath();
        x.moveTo(p[0] + p[2], p[1] + p[3] / 2);
        x.lineTo(b[0], b[1] + b[3] / 2);
        x.stroke();
      }
    });
  } else if (kind === "print") {
    x.fillStyle = "#f2f2f0";
    x.fillRect(0, 0, w, h);
    x.fillStyle = "rgba(60,60,60,.55)";
    for (let i = 0; i < h / 5; i++) {
      x.fillRect(6, 6 + i * 5, 8, 1.4);
      let px = 20;
      for (let k = 0; k < 1 + r() * 5; k++) {
        const ww = 6 + r() * 20;
        x.fillRect(px, 6 + i * 5, ww, 1.4);
        px += ww + 3;
      }
    }
  } else {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#b6c5cc");
    g.addColorStop(0.5, "#7f97a3");
    g.addColorStop(1, "#3f5866");
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
  }
  const img = x.getImageData(0, 0, w * 2, h * 2);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * 30;
    img.data[i]! += n;
    img.data[i + 1]! += n;
    img.data[i + 2]! += n;
  }
  x.putImageData(img, 0, 0);
  return c.toDataURL("image/jpeg", 0.82);
}

function Collage() {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = seeded(11);
    const span = 2400;
    const tiles = Array.from({ length: 24 }, (_, i) => {
      const kind = KINDS[i % KINDS.length]!;
      const [w, h] = SIZES[(i * 5 + 3) % SIZES.length]!;
      const el = document.createElement("div");
      el.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;will-change:transform,filter`;
      const img = new Image();
      img.alt = "";
      img.src = paint(kind, w, h, r);
      img.style.cssText = "display:block;width:100%;height:100%;object-fit:cover";
      el.appendChild(img);
      const far = r() < 0.3;
      host.appendChild(el);
      return { el, x: (i / 24) * span + r() * 60, y: 20 + r() * 560, w, far, grey: kind === "photo" || kind === "print" || kind === "schematic" };
    });
    let off = 0;
    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!reduce) off += dt * 0.018;
      const vw = host.clientWidth;
      for (const t of tiles) {
        const x = ((t.x + off * (t.far ? 0.7 : 1)) % span) - 220;
        const k = Math.max(0, Math.min(1, 1 - (Math.min(x + t.w, vw - x) - 20) / 220));
        t.el.style.transform = `translate3d(${x.toFixed(1)}px, ${t.y}px, 0) scaleX(${(1 + k * 0.12).toFixed(3)})`;
        t.el.style.filter = `blur(${(k * 7 + (t.far ? 3 : 0)).toFixed(1)}px) grayscale(${t.grey ? 0.9 : 0.15})`;
        t.el.style.opacity = String((t.far ? 0.7 : 1) * (1 - k * 0.55));
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      tiles.forEach((t) => t.el.remove());
    };
  }, []);
  return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute -top-6 left-1/2 z-0 h-[700px] w-screen -translate-x-1/2 overflow-hidden" />;
}

/* ---------- the agent panel: a real AgentTaskTrail on a short loop ---------- */

const icon = (n: Parameters<typeof ServiceLogo>[0]["name"]) => <ServiceLogo name={n} size={12} />;
const START: AgentStep[] = [
  { id: "inbox", label: "Read the inbox", icon: icon("gmail"), status: "done", seconds: 6, substeps: [{ label: "3 replies from Kaveri Textiles", meta: "Gmail" }] },
  { id: "crm", label: "Update the deal", icon: <HeiGinMark size={12} />, status: "active", activity: "Updating", seconds: 12, substeps: [{ label: "Moved to Negotiation", meta: "₹18.4L" }] },
  { id: "draft", label: "Draft the reminder", icon: icon("whatsapp"), status: "pending" },
  { id: "send", label: "Send on WhatsApp", icon: icon("whatsapp"), status: "approval", approval: { description: "Send the payment reminder to Asha at Kaveri Textiles on WhatsApp." } },
];

function AgentPanel() {
  const [steps, setSteps] = React.useState(START);
  React.useEffect(() => {
    const set = (id: string, change: Partial<AgentStep>) => setSteps((all) => all.map((s) => (s.id === id ? { ...s, ...change } : s)));
    const timers = [
      window.setTimeout(() => set("crm", { status: "done", seconds: 14, activity: undefined }), 2500),
      window.setTimeout(() => set("draft", { status: "active", activity: "Writing", seconds: 1, substeps: [{ label: "Polite first reminder", meta: "68 words" }] }), 2600),
      window.setTimeout(() => {
        set("draft", { status: "done", seconds: 4, activity: undefined });
        set("send", { status: "waiting" });
      }, 6000),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);
  return (
    <AgentTaskTrail
      title="Chase the Kaveri invoice"
      steps={steps}
      onApprove={() => setSteps((all) => all.map((s) => (s.id === "send" ? { ...s, status: "done", seconds: 1 } : s)))}
      onDecline={() => setSteps((all) => all.map((s) => (s.id === "send" ? { ...s, status: "declined" } : s)))}
      className="max-w-none"
    />
  );
}

/* ---------- the hero ---------- */

const SIDEBAR = [
  { label: "Today", count: 3 },
  { label: "Inbox", count: 12 },
  { label: "Deals" },
  { label: "Agents", on: true },
  { label: "Approvals", count: 2 },
];

/**
 * A light hero: headline and pill buttons, a riveted promo plate, and a product window with a live
 * agent panel, over an archive collage that drifts behind and blurs out at the edges.
 */
export function HeroArchive({ className }: { className?: string }) {
  const { archive, cta, nav } = heroesConfig;
  return (
    <div className={cn("relative overflow-x-clip bg-[#f8f8f8] text-[#191919]", className)}>
      <header className="sticky top-0 z-20 bg-[#f8f8f8]/85 backdrop-blur">
        <div className="mx-auto flex h-[52px] w-[min(1280px,calc(100%-48px))] items-center gap-9 text-sm">
          <Brand className="text-[19px] tracking-[-0.03em]" size={20} />
          <nav aria-label="Main" className="hidden flex-1 gap-5 lg:flex">
            {nav.map((l) => (
              <a key={l.href} href={l.href} className="hover:opacity-65">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            <a href={cta.secondary.href} className="hidden hover:opacity-65 sm:inline">
              {cta.secondary.label}
            </a>
            <a href={cta.signIn.href} className="inline-flex h-7 items-center rounded-full border border-[#e4e4e4] px-3">
              {cta.signIn.label}
            </a>
            <a href={cta.primary.href} className="inline-flex h-7 items-center rounded-full bg-black px-3 text-white hover:bg-[#262626]">
              {cta.primary.label}
            </a>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-[min(1280px,calc(100%-48px))] pt-[88px]">
        <div className="relative z-[3]">
          <h1 className="hero-rise m-0 max-w-[600px] text-[36px] font-normal leading-[43.2px] tracking-[-1.08px] max-sm:text-[30px] max-sm:leading-9">{archive.title}</h1>
          <p className="hero-rise mb-[26px] mt-4 max-w-[440px] text-base leading-[22.4px] tracking-[-0.16px] text-[rgb(25_25_25/0.56)] [animation-delay:80ms]">{archive.subtitle}</p>
          <div className="hero-rise flex gap-2 [animation-delay:160ms]">
            <a href={cta.primary.href} className="hero-pill h-[42px] bg-black text-white">
              {cta.primary.label}
            </a>
            <a href={cta.secondary.href} className="hero-pill h-[42px] border border-[#e4e4e4]">
              {cta.secondary.label}
            </a>
          </div>
        </div>

        <a
          href={archive.plate.href}
          className="hero-bob absolute right-0 top-[136px] z-[3] hidden h-[68px] w-[272px] items-center gap-2.5 rounded-md p-[5px] shadow-[inset_0_1px_0_rgb(255_255_255/0.75),inset_0_-1px_0_rgb(0_0_0/0.18),0_1px_1px_rgb(0_0_0/0.12),0_8px_18px_-10px_rgb(0_0_0/0.45)] xl:flex"
          style={{ background: "linear-gradient(180deg, #d7d7d5 0%, #bdbdbb 48%, #b3b3b1 52%, #c9c9c7 100%)" }}
        >
          <span className="grid h-[58px] w-[84px] flex-none place-items-center rounded-[3px] bg-[#161616]">
            <HeiGinMark size={30} />
          </span>
          <span>
            <b className="block text-sm font-medium">{archive.plate.title}</b>
            <span className="text-[13px] text-[rgb(25_25_25/0.55)]">{archive.plate.detail}</span>
          </span>
          <i className="absolute right-[7px] top-[7px] size-[5px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff,#9a9a98_70%)]" />
          <i className="absolute bottom-[7px] right-[7px] size-[5px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff,#9a9a98_70%)]" />
        </a>

        <div className="relative mt-14 h-[640px]" id="product">
          <Collage />
          <div className="hero-rise absolute left-0 top-0 z-[2] grid h-[620px] w-full max-w-[834px] grid-rows-[30px_1fr] overflow-hidden rounded-xl border border-[#ececec] bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04),0_30px_60px_-30px_rgb(0_0_0/0.18)] [animation-delay:250ms]">
            <div className="flex items-center gap-1.5 border-b border-[#f0f0f0] px-3">
              <i className="size-2.5 rounded-full bg-[#ff5f57]" />
              <i className="size-2.5 rounded-full bg-[#febc2e]" />
              <i className="size-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div className="grid min-h-0 grid-cols-[196px_1fr] text-xs max-sm:grid-cols-1">
              <aside className="border-r border-[#f2f2f2] p-2.5 max-sm:hidden">
                <div className="mb-3 flex items-center gap-2 px-1 font-semibold">
                  <HeiGinMark size={16} /> Northwind
                </div>
                {SIDEBAR.map((s) => (
                  <div key={s.label} className={cn("flex items-center justify-between rounded-md px-2 py-1.5", s.on && "bg-[#f3f3f3] font-medium")}>
                    {s.label}
                    {s.count && <span className="text-[#999]">{s.count}</span>}
                  </div>
                ))}
                <p className="mx-1 mb-1.5 mt-4 text-[10.5px] text-[#999]">Connected</p>
                {(["gmail", "whatsapp", "googleCalendar", "slack"] as const).map((n) => (
                  <div key={n} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                    <ServiceLogo name={n} size={12} /> {serviceLabels[n]}
                  </div>
                ))}
              </aside>
              <div className="overflow-hidden px-4 py-3">
                <div className="mb-4 flex items-center gap-1.5 text-[11.5px] text-[#555]">
                  Agents <span className="text-[#aaa]">›</span> Collections
                </div>
                <div className="mb-2 ml-auto w-max max-w-[70%] rounded-[10px] bg-[#f2f2f2] px-2.5 py-1.5 text-[11.5px] leading-snug">Chase anything over 30 days, but ask me before you message anyone.</div>
                <div className="mt-3.5 grid grid-cols-[22px_1fr] gap-2">
                  <HeiGinMark size={22} />
                  <div>
                    <b className="text-[11.5px] font-medium">HeiGin Agent</b>
                    <span className="ml-1 text-[10.5px] text-[#aaa]">9:12 AM</span>
                    <p className="my-1 text-[11.5px] leading-relaxed text-[#2a2a2a]">Three invoices are past 30 days. I updated the deals and drafted reminders. Kaveri Textiles is ready to send once you approve it.</p>
                    <div className="mt-2.5 w-[300px] max-w-full rounded-lg border border-[#ededed] px-2.5 py-2">
                      <b className="block text-[11.5px] font-medium">INV-2219 · ₹1,84,500</b>
                      <small className="my-1 block text-[10.5px] text-[#888]">Kaveri Textiles · 30 days overdue</small>
                      <span className="inline-flex h-[22px] items-center rounded-[5px] bg-[#222] px-2.5 text-[11px] text-white">Review draft</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <aside aria-label="Agent run" className="hero-rise absolute left-[calc(min(834px,100%)-160px)] top-10 z-[3] hidden w-[360px] [animation-delay:420ms] lg:block">
            <AgentPanel />
          </aside>
        </div>
      </main>
    </div>
  );
}
