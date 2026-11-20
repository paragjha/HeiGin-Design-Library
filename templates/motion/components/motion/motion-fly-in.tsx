"use client";

import * as React from "react";
import { motionConfig } from "@/lib/motion-config";
import { chaser, clamp01, cn, power3Out, prefersReducedMotion, smoothstep } from "@/lib/motion-utils";

const CYCLE_S = 10; // one full flight from the back to past the viewer, at base speed
const DEPTH = 2000; // spawn depth, px
const EXIT_Z = 400;
const PLATEAU_START = -200; // fully visible between these depths
const PLATEAU_END = -80;
const HOLE_X_MAX = 0.42; // the clear zone never grows past these shares of the frame
const HOLE_Y_MAX = 0.35;
const HOLE_BUFFER = 120; // extra clearance around the headline, px
const HOLE_SOFT_EDGE = 80;
const SCROLL_BOOST = 3.5; // scrolling speeds the flight up to this many times
const VELOCITY_LERP = 0.06;
const VELOCITY_DIVISOR = 60;
const PAN = 40; // cursor pan of the whole field, px
const PAN_S = 1.2;
const PAN_Y_RATIO = 0.8;
const PERSPECTIVE = 1200;

/** How visible a card is at depth z: fades in from the back, holds, fades out as it passes the viewer. */
function opacityForZ(z: number) {
  if (z <= -DEPTH) return 0;
  if (z < PLATEAU_START) return smoothstep(clamp01((z + DEPTH) / (PLATEAU_START + DEPTH)));
  if (z <= PLATEAU_END) return 1;
  if (z < EXIT_Z) return 1 - smoothstep(clamp01((z - PLATEAU_END) / (EXIT_Z - PLATEAU_END)));
  return 0;
}

/** A hero where cards keep flying in from deep inside the page, around a clear centre that holds the headline. */
export function MotionFlyIn({ className }: { className?: string }) {
  const cfg = motionConfig.flyIn;
  const items = cfg.items.length ? cfg.items : cfg.placeholders.map((size) => ({ src: "", size, hideMobile: false }));
  const root = React.useRef<HTMLElement>(null);
  const stage = React.useRef<HTMLDivElement>(null);
  const content = React.useRef<HTMLDivElement>(null);
  const cardEls = React.useRef<(HTMLDivElement | null)[]>([]);
  const [revealed, setRevealed] = React.useState(false);
  const lines = cfg.headline.split("\n");
  const supportLines = cfg.support.split("\n");
  const headlineEnd = 1.1 + (lines.length - 1) * 0.08;

  React.useEffect(() => {
    const el = root.current;
    const st = stage.current;
    if (!el || !st) return;
    const cards = cardEls.current.filter((c): c is HTMLDivElement => !!c);
    const reduced = prefersReducedMotion();
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let holeX = 0;
    let holeY = 0;
    let velocity = 1;
    let lastScroll = window.scrollY;
    let raf = 0;
    let lastT = 0;
    const halfW: number[] = [];
    const halfH: number[] = [];
    const panX = chaser(PAN_S, power3Out);
    const panY = chaser(PAN_S, power3Out);

    // The clear zone comes from the headline's real rectangle plus the buffer.
    const measure = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      const r = content.current?.getBoundingClientRect();
      holeX = r?.width ? Math.min(r.width / 2 + HOLE_BUFFER, vw * HOLE_X_MAX) : 0;
      holeY = r?.height ? Math.min(r.height / 2 + HOLE_BUFFER, vh * HOLE_Y_MAX) : 0;
      cards.forEach((c, i) => {
        halfW[i] = c.offsetWidth / 2;
        halfH[i] = c.offsetHeight / 2;
      });
    };

    const state = cards.map(() => ({ x: 0, y: 0, progress: 0 }));
    // A card spawns anywhere except over the clear zone.
    const spawn = (i: number, progress: number) => {
      let x = 0;
      let y = 0;
      for (let tries = 0; tries < 12; tries++) {
        x = Math.random() - 0.5;
        y = Math.random() - 0.5;
        if (!(Math.abs(x) * vw < holeX + (halfW[i] ?? 0) && Math.abs(y) * vh < holeY + (halfH[i] ?? 0))) break;
      }
      state[i] = { x, y, progress };
    };

    // Per-frame dim in projected screen space, so no card ever reads on top of the headline:
    // perspective pulls far cards toward the centre and the pan shifts the whole field.
    const holeFade = (i: number, z: number, px: number, py: number) => {
      if (!holeX && !holeY) return 1;
      const s = PERSPECTIVE / (PERSPECTIVE - z);
      const sepX = Math.abs((state[i]!.x * vw + px) * s) - (holeX + (halfW[i] ?? 0) * s);
      const sepY = Math.abs((state[i]!.y * vh + py) * s) - (holeY + (halfH[i] ?? 0) * s);
      return smoothstep(clamp01(Math.max(sepX, sepY) / HOLE_SOFT_EDGE));
    };

    const place = (i: number, z: number, opacity: number) => {
      const c = cards[i]!;
      c.style.transform = `translate(-50%, -50%) translate3d(${state[i]!.x * vw}px, ${state[i]!.y * vh}px, ${z}px)`;
      c.style.opacity = opacity.toFixed(3);
    };

    const tick = (now: number) => {
      const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0;
      lastT = now;
      const rate = velocity / CYCLE_S;
      velocity += (1 - velocity) * VELOCITY_LERP;
      const px = panX.get(now);
      const py = panY.get(now);
      st.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      for (let i = 0; i < cards.length; i++) {
        const s = state[i]!;
        s.progress += rate * dt;
        if (s.progress >= 1) spawn(i, s.progress - 1);
        const z = -DEPTH + state[i]!.progress * (EXIT_Z + DEPTH);
        place(i, z, opacityForZ(z) * holeFade(i, z, px, py));
      }
      raf = requestAnimationFrame(tick);
    };

    measure();
    cards.forEach((_, i) => spawn(i, i / cards.length));
    if (reduced) {
      cards.forEach((_, i) => place(i, -200, 0.9 * holeFade(i, -200, 0, 0)));
      return;
    }

    const start = () => {
      cancelAnimationFrame(raf);
      lastT = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => cancelAnimationFrame(raf);
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    });
    io.observe(el);
    const onVisibility = () => (document.hidden || !visible ? stop() : start());

    // The field slides with the pointer; perspective makes near cards shift more than far ones.
    const fine = !window.matchMedia("(pointer: coarse)").matches;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const now = performance.now();
      panX.set((((e.clientX - r.left) / r.width) * 2 - 1) * PAN, now);
      panY.set((((e.clientY - r.top) / r.height) * 2 - 1) * PAN * PAN_Y_RATIO, now);
    };
    const onLeave = () => {
      const now = performance.now();
      panX.set(0, now);
      panY.set(0, now);
    };
    // Scrolling kicks the flight faster for a moment.
    const onScroll = () => {
      const y = window.scrollY;
      const boost = 1 + Math.min(Math.abs(y - lastScroll) / VELOCITY_DIVISOR, 1) * (SCROLL_BOOST - 1);
      lastScroll = y;
      velocity = Math.max(velocity, boost);
    };
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 150);
    };
    if (fine) {
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    // cards change size once their images arrive
    cards.forEach((c) => c.querySelector("img")?.addEventListener("load", measure, { once: true }));
    return () => {
      stop();
      io.disconnect();
      window.clearTimeout(resizeTimer);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [items.length]);

  // The headline rises in once the section is 20% into view (at once if it starts there).
  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setRevealed(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={root}
      className={cn("mo-fly mo-dark relative h-[100svh] min-h-[560px] overflow-hidden bg-bg text-ink", className)}
      style={{ perspective: PERSPECTIVE }}
    >
      <div ref={stage} className="mo-fly-stage" aria-hidden="true">
        {items.map((item, i) => (
          <div
            key={i}
            ref={(node) => {
              cardEls.current[i] = node;
            }}
            className={cn("mo-fly-card", `mo-fly-${item.size}`, item.hideMobile && "mo-fly-hide-mobile")}
          >
            {item.src ? (
              <img src={item.src} alt="" draggable={false} className="block w-full rounded-lg border border-border bg-surface shadow-popover" />
            ) : (
              <div
                className={cn("w-full rounded-lg border border-border shadow-popover", i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]")}
                style={{ background: "linear-gradient(135deg, var(--hg-color-surface) 0%, var(--hg-color-surface-hover) 55%, var(--hg-color-border-strong) 100%)" }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="absolute inset-0 z-10 grid place-items-center px-6">
        <div ref={content} className={cn("max-w-[720px] text-center", revealed && "mo-revealed")}>
          <h1 className="text-[clamp(36px,6vw,72px)] font-semibold leading-[1.02] tracking-[-0.035em]">
            {lines.map((line, i) => (
              <span key={i} className="mo-rise" style={{ "--mo-rise-delay": `${i * 0.08}s` } as React.CSSProperties}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
          <p className="mx-auto mt-5 max-w-[420px] text-[15px] leading-relaxed text-muted">
            {supportLines.map((line, i) => (
              <span
                key={i}
                className="mo-rise"
                style={{ "--mo-rise-dur": "0.9s", "--mo-rise-delay": `${Math.max(0, headlineEnd - 0.6) + i * 0.05}s` } as React.CSSProperties}
              >
                <span>{line}</span>
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
