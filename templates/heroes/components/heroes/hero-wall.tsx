"use client";

import * as React from "react";
import { HeiGinMark } from "@heigin/ui";
import { Brand } from "@/components/heroes/brand";
import { ServiceLogo, type ServiceName } from "@/components/heroes/service-logos";
import { heroesConfig, serviceLabels } from "@/lib/heroes-config";
import { cn, seeded } from "@/lib/heroes-utils";

const PASTELS = ["#eef4ff", "#f0fdf4", "#fffbeb", "#fef2f2", "#f5f3ff", "#ecfeff", "#fdf4ff", "#f7f7f7"];
const HEIGHTS = [168, 210, 246, 280, 186, 232, 300];

type Tile =
  | { kind: "logo"; name: ServiceName; bg: string }
  | { kind: "work"; title: string; detail: string }
  | { kind: "mark" }
  | { kind: "rings" | "conic" | "dots" | "bars" | "approval" | "deal" | "chat" | "type"; seed: number };

function TileArt({ tile }: { tile: Tile }) {
  switch (tile.kind) {
    case "logo":
      return (
        <div className="absolute inset-0 grid place-items-center" style={{ background: tile.bg }}>
          <ServiceLogo name={tile.name} size={56} className="max-w-[70%] drop-shadow-sm" />
        </div>
      );
    case "mark":
      return (
        <div className="absolute inset-0 grid place-items-center bg-[#1f1f1f]">
          <HeiGinMark size={72} />
        </div>
      );
    case "work":
      return (
        <div className="absolute inset-0 flex flex-col justify-end gap-1 bg-surface p-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Agent</span>
          <span className="text-lg font-semibold leading-tight tracking-tight text-ink">{tile.title}</span>
          <span className="text-sm text-muted">{tile.detail}</span>
        </div>
      );
    case "rings":
      return <div className="absolute inset-0" style={{ background: "repeating-radial-gradient(circle at 50% 55%, #bfd4f6 0 2px, #e6eefc 2px 8px)" }} />;
    case "conic":
      return (
        <div className="absolute inset-0 bg-[#111]">
          <div className="absolute inset-[-20%]" style={{ background: "linear-gradient(160deg, transparent 38%, #3b82f6 44%, #16a34a 50%, #f59e0b 56%, transparent 62%)" }} />
          <div className="absolute left-[34%] top-[22%] h-[56%] w-[30%] -skew-y-12 bg-gradient-to-r from-white to-[#dcdcdc] shadow-[-10px_10px_0_#bdbdbd]" />
        </div>
      );
    case "dots":
      return (
        <div
          className="absolute inset-0"
          style={{ background: "#1f1f1f", backgroundImage: "radial-gradient(circle, #5c5c5c 0 18%, transparent 19%), radial-gradient(circle, #5c5c5c 0 18%, transparent 19%)", backgroundSize: "26px 26px", backgroundPosition: "0 0, 13px 13px" }}
        />
      );
    case "bars": {
      const r = seeded(tile.seed);
      return (
        <div className="absolute inset-0 bg-surface p-3">
          <div className="text-[9px] font-semibold text-muted">Pipeline</div>
          <div className="mb-2 mt-0.5 text-base font-semibold text-ink">₹48.2L</div>
          <div className="flex h-[58%] items-end gap-[3px]">
            {Array.from({ length: 14 }, (_, i) => (
              <i key={i} className="flex-1 rounded-[2px]" style={{ height: `${22 + r() * 78}%`, background: r() > 0.3 ? "#16a34a" : "#bbf7d0" }} />
            ))}
          </div>
        </div>
      );
    }
    case "approval":
      return (
        <div className="absolute inset-0 flex flex-col gap-2 bg-[#f7f7f7] p-3">
          <div className="rounded-lg border border-border bg-surface p-2.5 shadow-sm">
            <div className="text-[11px] font-semibold text-ink">Send reminder to Kaveri Textiles</div>
            <div className="mt-0.5 text-[10px] text-muted">Invoice 30 days overdue</div>
            <div className="mt-2 flex gap-1.5">
              <span className="rounded-md bg-[#1f1f1f] px-2 py-0.5 text-[10px] font-medium text-white">Approve</span>
              <span className="rounded-md border border-border px-2 py-0.5 text-[10px] text-ink">Reject</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted">
            <ServiceLogo name="whatsapp" size={12} /> via WhatsApp
          </div>
        </div>
      );
    case "deal":
      return (
        <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-[#eef4ff] to-[#dbe7fd] p-3">
          <span className="self-start rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[#b91c1c] shadow-sm">At risk</span>
          <div>
            <div className="text-sm font-semibold text-ink">Asha Foods</div>
            <div className="text-[11px] text-muted">Usage down 34% · renewal in 9 days</div>
          </div>
        </div>
      );
    case "chat":
      return (
        <div className="absolute inset-0 flex flex-col justify-center gap-2 bg-[#ecfdf5] p-3">
          <span className="max-w-[85%] self-start rounded-xl rounded-bl-sm bg-white px-2.5 py-1.5 text-[11px] text-ink shadow-sm">Can we move the demo to Friday?</span>
          <span className="max-w-[85%] self-end rounded-xl rounded-br-sm bg-[#1f1f1f] px-2.5 py-1.5 text-[11px] text-white">Done – Friday 3 PM. Invite sent.</span>
        </div>
      );
    case "type":
      return (
        <div className="absolute inset-0 grid place-items-center bg-[#2a2a2a] p-4 text-center text-2xl font-semibold leading-[1.05] tracking-tight text-[#f3f1ea]">
          Follow up.
          <br />
          Approve.
          <br />
          Close.
        </div>
      );
  }
}

function buildTiles(): Tile[] {
  const r = seeded(7);
  const { integrations, work } = heroesConfig.wall;
  const pool: Tile[] = [
    ...integrations.map((name, i): Tile => ({ kind: "logo", name, bg: PASTELS[i % PASTELS.length]! })),
    ...work.map((w): Tile => ({ kind: "work", ...w })),
    { kind: "mark" },
    ...(["rings", "conic", "dots", "bars", "approval", "deal", "chat", "type"] as const).map((kind, i): Tile => ({ kind, seed: i + 3 })),
  ];
  const out: Tile[] = [];
  while (out.length < 70) {
    const deck = [...pool];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [deck[i], deck[j]] = [deck[j]!, deck[i]!];
    }
    out.push(...deck);
  }
  return out;
}

const COLS = 10;
const PER = 7;

/**
 * A tilted wall of everything the agents touch: integrations, approvals, pipeline cards. It pans
 * against the pointer, a "Book a demo" pill trails the cursor, and scrolling flattens the wall
 * while the next section slides over it.
 */
export function HeroWall({ className }: { className?: string }) {
  const tiles = React.useMemo(() => buildTiles(), []);
  const offsets = React.useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: COLS }, (_, c) => (c % 2 ? -120 : 0) + (r() * 140 - 70));
  }, []);
  const stickyRef = React.useRef<HTMLDivElement>(null);
  const planeRef = React.useRef<HTMLDivElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const tagRef = React.useRef<HTMLDivElement>(null);
  const hintRef = React.useRef<HTMLDivElement>(null);
  const [paused, setPaused] = React.useState(false);
  const pausedRef = React.useRef(paused);
  const [entered, setEntered] = React.useState(false);
  const { wall, cta, nav } = heroesConfig;

  React.useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) setPaused(true);
    setEntered(true);
    const sticky = stickyRef.current!;
    const plane = planeRef.current!;
    const cursor = cursorRef.current!;
    const tag = tagRef.current!;
    let mx = 0.5;
    let my = 0.5;
    let has = false;
    const cur = { tx: 0, ty: 0, rx: 0, ry: 0 };
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const target = { ...pos };
    const t0 = performance.now();
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX / innerWidth;
      my = e.clientY / innerHeight;
      has = true;
      target.x = e.clientX;
      target.y = e.clientY;
      const el = e.target as HTMLElement;
      const overUi = !!el.closest("[data-hero-ui]");
      const inHero = sticky.getBoundingClientRect().bottom > e.clientY && window.scrollY < innerHeight * 0.9;
      const card = el.closest<HTMLElement>("[data-hero-card]");
      const on = inHero && !overUi && e.pointerType === "mouse";
      cursor.dataset.on = String(on);
      sticky.style.cursor = on ? "none" : "";
      cursor.textContent = card ? wall.cardLabel : wall.cursorLabel;
      if (card && on) {
        tag.textContent = card.dataset.heroCard ?? "";
        tag.dataset.on = "true";
      } else tag.dataset.on = "false";
    };
    const onLeave = () => {
      cursor.dataset.on = "false";
      tag.dataset.on = "false";
    };
    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      const p = Math.min(1, Math.max(0, window.scrollY / (innerHeight * 1.1)));
      const e = 1 - Math.pow(1 - p, 3);
      const go = pausedRef.current ? 0 : 1;
      const ax = has ? mx - 0.5 : Math.sin(t * 0.22) * 0.35;
      const ay = has ? my - 0.5 : Math.cos(t * 0.17) * 0.3;
      const want = { tx: (-ax * 260 + Math.sin(t * 0.13) * 30) * go, ty: (-ay * 200 + Math.cos(t * 0.11) * 24) * go, rx: -ay * 6 * go, ry: ax * 8 * go };
      (Object.keys(cur) as (keyof typeof cur)[]).forEach((k) => (cur[k] = lerp(cur[k], want[k], 0.055)));
      const RX = lerp(24, 0, e) + cur.rx * (1 - e);
      const RY = lerp(-26, 0, e) + cur.ry * (1 - e);
      const RZ = lerp(-7, 0, e);
      plane.style.transform = `translate(-50%, -50%) translate3d(${cur.tx * (1 - e)}px, ${cur.ty * (1 - e) - e * 120}px, 0) rotateX(${RX}deg) rotateY(${RY}deg) rotateZ(${RZ}deg) scale(${lerp(0.8, 0.6, e)})`;
      if (hintRef.current) hintRef.current.style.opacity = String(1 - Math.min(1, p * 4));
      pos.x = lerp(pos.x, target.x, 0.2);
      pos.y = lerp(pos.y, target.y, 0.2);
      cursor.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) scale(${cursor.dataset.on === "true" ? 1 : 0})`;
      tag.style.transform = `translate(${target.x + 18}px, ${target.y + 22}px)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [wall.cardLabel, wall.cursorLabel]);

  return (
    <div className={cn("relative bg-white text-ink", className)}>
      <header data-hero-ui className="pointer-events-none fixed inset-x-3 top-3 z-30 flex items-center justify-between">
        <Brand className="pointer-events-auto rounded-md bg-[#f1f1f1] px-2.5 py-1 text-[13.5px]" size={18} />
        <nav aria-label="Main" className="pointer-events-auto flex gap-1">
          {nav.map((l) => (
            <a key={l.href} href={l.href} className="hidden rounded-md bg-[#f1f1f1] px-2.5 py-1 text-[13px] transition-colors hover:bg-[#e6e6e6] md:inline-block">
              {l.label}
            </a>
          ))}
          <a href={cta.secondary.href} className="rounded-md bg-[#1f1f1f] px-2.5 py-1 text-[13px] text-white transition-colors hover:bg-[#3a3a3a]">
            {cta.secondary.label}
          </a>
        </nav>
      </header>

      <section aria-label="Work" className="relative h-[190vh]">
        <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden [perspective-origin:50%_40%] [perspective:1500px]">
          <div ref={planeRef} className="absolute left-1/2 top-1/2 flex items-start gap-[22px] [transform-style:preserve-3d] will-change-transform">
            {Array.from({ length: COLS }, (_, c) => (
              <div key={c} className="flex flex-col gap-[22px] [transform-style:preserve-3d]" style={{ marginTop: offsets[c] }}>
                {Array.from({ length: PER }, (_, r) => {
                  const tile = tiles[c + r * COLS]!;
                  const label = tile.kind === "work" ? tile.title : tile.kind === "logo" ? `Works with ${serviceLabels[tile.name]}` : "HeiGin";
                  return (
                    <a
                      key={r}
                      href={cta.secondary.href}
                      data-hero-card={label}
                      aria-label={label}
                      className={cn(
                        "relative block w-[196px] overflow-hidden rounded-md bg-[#eee] shadow-[0_1px_2px_rgb(0_0_0/0.05)] transition-[transform,box-shadow] duration-500 [transform-style:preserve-3d] [transition-timing-function:var(--hg-motion-ease-emphasized)] hover:z-10 hover:shadow-[0_30px_50px_-20px_rgb(0_0_0/0.35)] hover:[transform:translateZ(46px)_scale(1.035)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hg-color-focus)]",
                        entered && "hero-card-in",
                      )}
                      style={{ height: HEIGHTS[(c * 3 + r * 2) % HEIGHTS.length], animationDelay: `${Math.min(900, Math.hypot(c - COLS / 2, r - PER / 2) * 110)}ms` }}
                    >
                      <TileArt tile={tile} />
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="agents" className="relative z-10 -mt-[30vh] rounded-t-[20px] bg-white px-3 pb-20 pt-14 shadow-[0_-24px_60px_-30px_rgb(0_0_0/0.35)] md:px-6">
        <h2 className="mb-8 ml-1 text-[clamp(2rem,1.2rem+3.5vw,4rem)] font-semibold leading-none tracking-tight">{wall.sheetTitle}</h2>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {wall.work.map((w, i) => (
            <li key={w.title}>
              <a href={cta.primary.href} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[#eee]">
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]">
                    <TileArt tile={i % 2 ? { kind: "logo", name: wall.integrations[i % wall.integrations.length]!, bg: PASTELS[i % PASTELS.length]! } : { kind: (["approval", "deal", "chat"] as const)[(i / 2) % 3 | 0]!, seed: i }} />
                  </div>
                </div>
                <div className="flex justify-between px-0.5 pb-4 pt-2 text-[13px]">
                  <b className="font-medium">{w.title}</b>
                  <span className="text-muted">{w.detail}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div
        ref={cursorRef}
        data-on="false"
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-40 whitespace-nowrap rounded-full bg-[#1f1f1f] px-4 py-2 text-[13.5px] font-medium text-white transition-[scale] duration-200"
      />
      <div
        ref={tagRef}
        data-on="false"
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[35] rounded-md bg-white px-2 py-1 text-xs font-medium text-ink opacity-0 shadow-[0_6px_20px_-8px_rgb(0_0_0/0.3)] transition-opacity data-[on=true]:opacity-100"
      />
      <button
        type="button"
        data-hero-ui
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
        className="fixed bottom-3.5 left-3.5 z-30 inline-flex items-center gap-1.5 rounded-md bg-[#f1f1f1]/90 px-2.5 py-1.5 text-[12.5px] font-medium backdrop-blur focus-visible:outline-2 focus-visible:outline-[var(--hg-color-focus)]"
      >
        <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor" aria-hidden="true">
          {paused ? <path d="M3 2v8l7-4Z" /> : <><rect x="2" y="2" width="3" height="8" rx=".8" /><rect x="7" y="2" width="3" height="8" rx=".8" /></>}
        </svg>
        {paused ? wall.resumeLabel : wall.pauseLabel}
      </button>
      <div ref={hintRef} aria-hidden="true" className="pointer-events-none fixed bottom-3.5 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#f1f1f1]/90 px-3 py-1.5 text-[12.5px] text-muted backdrop-blur">
        {wall.hint}
      </div>
    </div>
  );
}
