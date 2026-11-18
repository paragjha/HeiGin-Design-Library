"use client";

import * as React from "react";
import { HeiGinMark } from "@heigin/ui";
import { Brand } from "@/components/heroes/brand";
import { SERVICE_LOGOS, ServiceLogo } from "@/components/heroes/service-logos";
import { heroesConfig } from "@/lib/heroes-config";
import { cn, seeded } from "@/lib/heroes-utils";

type CaseStudy = (typeof heroesConfig.wall.caseStudies)[number];

/** Gradient covers used when no photos are set: warm streaks, violet glow, green field, open sky. */
const FALLBACKS = [
  "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.07) 0 2px, transparent 2px 22px), linear-gradient(90deg, #0b0d18 0%, #3a1c12 38%, #ff6a1a 62%, #ffc24a 78%, #2a1a14 100%)",
  "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.05) 0 1px, transparent 1px 34px), radial-gradient(80% 60% at 20% 70%, #c06bff 0%, #5b2bd1 35%, #120a2a 75%), #0b0814",
  "linear-gradient(180deg, #1f8f86 0%, #74d6c0 48%, #9ee6c9 52%, #6bbf4a 58%, #3f8a2a 100%)",
  "radial-gradient(60% 40% at 70% 25%, #ffffff 0%, transparent 60%), linear-gradient(180deg, #6fa7d8 0%, #a9cdee 55%, #5f8f3a 56%, #2f5a22 100%)",
];

const KNOCKOUT = new Set<string>(["notion"]);

type Tile =
  | { kind: "case"; study: number; cover: number | null; pos: string; zoom: number }
  | { kind: "type"; text: string; dark: boolean }
  | { kind: "mark" };

/** A case-study cover: the photo (or a gradient) with the client's logo in white across it. */
function CaseCover({
  study,
  cover,
  pos = "50% 50%",
  zoom = 1,
  logoHeight,
}: {
  study: CaseStudy;
  cover: number | null;
  pos?: string;
  zoom?: number;
  logoHeight: number;
}) {
  const { covers, caseStudies } = heroesConfig.wall;
  const src = cover !== null ? covers[cover % covers.length] : undefined;
  const index = caseStudies.indexOf(study);
  const mark = SERVICE_LOGOS[study.logo];
  const wide = mark.w / mark.h > 2;
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#111]">
      {src ? (
        <img src={src} alt="" loading="lazy" decoding="async" draggable={false} className="absolute inset-0 size-full object-cover" style={{ objectPosition: pos, transform: `scale(${zoom})` }} />
      ) : (
        <div className="absolute inset-0" style={{ background: FALLBACKS[Math.max(0, index) % FALLBACKS.length] }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-black/10" />
      <div className="absolute inset-0 grid place-items-center">
        <ServiceLogo
          name={study.logo}
          size={wide ? logoHeight * 0.62 : logoHeight}
          className={cn(
            "max-w-[72%]",
            // Marks with knocked-out details (Notion's page) are inverted; the rest become white silhouettes.
            KNOCKOUT.has(study.logo)
              ? "text-black [filter:invert(1)_drop-shadow(0_2px_14px_rgb(0_0_0/0.35))]"
              : "[filter:brightness(0)_invert(1)_drop-shadow(0_2px_14px_rgb(0_0_0/0.35))]",
          )}
        />
      </div>
    </div>
  );
}

function TypeTile({ text, dark }: { text: string; dark: boolean }) {
  return (
    <div className={cn("absolute inset-0 grid place-items-center p-4 text-center text-2xl font-semibold leading-[1.05] tracking-tight", dark ? "bg-[#1f1f1f] text-[#f3f1ea]" : "bg-[#f1efe9] text-[#1f1f1f]")}>
      <span className="whitespace-pre-line">{text}</span>
    </div>
  );
}

function buildTiles(): Tile[] {
  const r = seeded(7);
  const { caseStudies, taglines, covers } = heroesConfig.wall;
  const out: Tile[] = [];
  let round = 0;
  while (out.length < COLS * PER) {
    const deck: Tile[] = [
      ...caseStudies.map((_, i): Tile => ({
        kind: "case",
        study: i,
        cover: covers.length ? (i + round) % covers.length : null,
        pos: `${Math.round(r() * 100)}% ${Math.round(r() * 100)}%`,
        zoom: 1 + r() * 0.7,
      })),
      // One tagline per round and the brand mark every other round keep the wall mostly work.
      ...(taglines.length ? [{ kind: "type", text: taglines[round % taglines.length]!, dark: round % 2 === 0 } as Tile] : []),
      ...(round % 2 === 0 ? [{ kind: "mark" } as Tile] : []),
    ];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [deck[i], deck[j]] = [deck[j]!, deck[i]!];
    }
    out.push(...deck);
    round++;
  }
  return out;
}

const COLS = 10;
const PER = 7;
const HEIGHTS = [168, 210, 246, 280, 186, 232, 300];

/**
 * A studio portfolio hero: a tilted wall of case-study covers that pans against the pointer, with a
 * "Book a call" pill that trails the cursor. Scrolling flattens the wall while "Selected work"
 * slides over it.
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
  const { wall } = heroesConfig;

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
      cursor.textContent = card?.dataset.heroCase ? wall.cardLabel : wall.cursorLabel;
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
          {wall.nav.map((l) => (
            <a key={l.href} href={l.href} className="hidden rounded-md bg-[#f1f1f1] px-2.5 py-1 text-[13px] transition-colors hover:bg-[#e6e6e6] md:inline-block">
              {l.label}
            </a>
          ))}
          <a href={wall.cta.href} className="rounded-md bg-[#1f1f1f] px-2.5 py-1 text-[13px] text-white transition-colors hover:bg-[#3a3a3a]">
            {wall.cta.label}
          </a>
        </nav>
      </header>

      <section aria-label="Case studies" className="relative h-[190vh]">
        <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden [perspective-origin:50%_40%] [perspective:1500px]">
          <div ref={planeRef} className="absolute left-1/2 top-1/2 flex items-start gap-[22px] [transform-style:preserve-3d] will-change-transform">
            {Array.from({ length: COLS }, (_, c) => (
              <div key={c} className="flex flex-col gap-[22px] [transform-style:preserve-3d]" style={{ marginTop: offsets[c] }}>
                {Array.from({ length: PER }, (_, r) => {
                  const tile = tiles[c + r * COLS]!;
                  const study = tile.kind === "case" ? wall.caseStudies[tile.study]! : null;
                  const label = study ? `${study.client} · ${study.project}` : heroesConfig.brand.name;
                  return (
                    <a
                      key={r}
                      href={study ? "#work" : wall.cta.href}
                      data-hero-card={label}
                      data-hero-case={study ? "true" : undefined}
                      aria-label={study ? `${study.client} case study: ${study.project}` : label}
                      className={cn(
                        "relative block w-[196px] overflow-hidden rounded-md bg-[#eee] shadow-[0_1px_2px_rgb(0_0_0/0.05)] transition-[transform,box-shadow] duration-500 [transform-style:preserve-3d] [transition-timing-function:var(--hg-motion-ease-emphasized)] hover:z-10 hover:shadow-[0_30px_50px_-20px_rgb(0_0_0/0.35)] hover:[transform:translateZ(46px)_scale(1.035)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hg-color-focus)]",
                        entered && "hero-card-in",
                      )}
                      style={{ height: HEIGHTS[(c * 3 + r * 2) % HEIGHTS.length], animationDelay: `${Math.min(900, Math.hypot(c - COLS / 2, r - PER / 2) * 110)}ms` }}
                    >
                      {tile.kind === "case" && study ? (
                        <CaseCover study={study} cover={tile.cover} pos={tile.pos} zoom={tile.zoom} logoHeight={34} />
                      ) : tile.kind === "type" ? (
                        <TypeTile text={tile.text} dark={tile.dark} />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center bg-[#1f1f1f]">
                          <HeiGinMark size={64} />
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="work" aria-labelledby="hero-wall-work" className="relative z-10 -mt-[30vh] rounded-t-[20px] bg-white px-3 pb-20 pt-14 shadow-[0_-24px_60px_-30px_rgb(0_0_0/0.35)] md:px-6">
        <div className="mb-8 ml-1 flex flex-wrap items-end justify-between gap-4">
          <h2 id="hero-wall-work" className="m-0 text-[clamp(2rem,1.2rem+3.5vw,4rem)] font-semibold leading-none tracking-tight">
            {wall.sheetTitle}
          </h2>
          <p className="m-0 max-w-[420px] text-[15px] leading-relaxed text-muted">{wall.sheetIntro}</p>
        </div>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {wall.caseStudies.map((study, i) => (
            <li key={study.client}>
              <a href={`#case-${i}`} className="group block" aria-label={`${study.client} case study: ${study.project}`}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]">
                    <CaseCover study={study} cover={wall.covers.length ? i % wall.covers.length : null} pos={["50% 50%", "30% 60%", "70% 40%", "50% 30%"][i % 4]} zoom={1 + (i % 3) * 0.15} logoHeight={64} />
                  </div>
                </div>
                <div className="flex flex-wrap justify-between gap-x-4 px-0.5 pb-4 pt-2 text-[13px]">
                  <span>
                    <b className="font-medium">{study.client}</b> <span className="text-muted">— {study.project}</span>
                  </span>
                  <span className="text-muted">
                    {study.services} · {study.year}
                  </span>
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
        className="pointer-events-none fixed left-0 top-0 z-40 whitespace-nowrap rounded-full bg-[#1f1f1f] px-4 py-2 text-[13.5px] font-medium text-white"
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
