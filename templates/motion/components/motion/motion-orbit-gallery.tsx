"use client";

import * as React from "react";
import { motionConfig } from "@/lib/motion-config";
import { chaser, clamp01, cn, coverFor, expoOut, lerp, power3Out, prefersReducedMotion, seeded } from "@/lib/motion-utils";

const RUNWAY = 2; // screens of scroll the ring turns across
const SCRUB_S = 0.5;
const KEY_TURN_S = 0.6;
const THROW_DECAY_S = 0.35; // a thrown ring's spin falls to a third in this time
const SPRING_K = 170; // the stretch eases back with one small give
const SPRING_C = 14;
const IMG_OVERSCAN = 1.7; // the photo is larger than its shape, so it can turn and counter-stretch without showing an edge
const SEED = 4211;

/** Corner radii for one hand-cut shape: rounder or squarer by `roundness`, each corner a little different, the same on every load. */
function shapeFor(i: number, roundness: number) {
  const rand = seeded(SEED + i * 97);
  const base = lerp(50, 14, roundness);
  const r = () => `${Math.round(Math.max(6, Math.min(50, base + (rand() - 0.5) * 16)))}%`;
  return `${r()} ${r()} ${r()} ${r()} / ${r()} ${r()} ${r()} ${r()}`;
}

/** A ring of photos in soft, hand-cut shapes turns around the headline as you scroll; grab it and throw it round. */
export function MotionOrbitGallery({ className }: { className?: string }) {
  const cfg = motionConfig.orbit;
  const n = cfg.photos.length;
  const root = React.useRef<HTMLElement>(null);
  const ring = React.useRef<HTMLDivElement>(null);
  const copy = React.useRef<HTMLDivElement>(null);
  const items = React.useRef<(HTMLLIElement | null)[]>([]);
  const masks = React.useRef<(HTMLDivElement | null)[]>([]);
  const flats = React.useRef<(HTMLDivElement | null)[]>([]);
  const keyTurn = React.useRef<{ nudge: (dir: number) => void }>({ nudge: () => {} });
  const shapes = React.useMemo(() => cfg.photos.map((_, i) => shapeFor(i, cfg.roundness)), [cfg.photos, cfg.roundness]);

  React.useEffect(() => {
    const el = root.current;
    const rg = ring.current;
    if (!el || !rg || n < 1) return;
    const reduced = prefersReducedMotion();
    const scroll = chaser(reduced ? 0 : SCRUB_S, power3Out);
    const keys = chaser(reduced ? 0 : KEY_TURN_S, expoOut);
    const step = (Math.PI * 2) / n;
    let keyTarget = 0;
    let drag = 0;
    let spin = 0; // rad/s left over from a throw
    let held: { id: number; angle: number; t: number } | null = null;
    let radius = 0;
    let lastAngle: number | null = null;
    let lastT = 0;
    let stretch = 0;
    let stretchV = 0;
    let raf = 0;
    let onScreen = false;

    const measure = () => {
      const W = el.clientWidth;
      const H = window.innerHeight;
      const c = copy.current?.getBoundingClientRect();
      const clear = c ? Math.hypot(c.width / 2, c.height / 2) + 12 : 0;
      // the ring keeps clear of the copy; on a narrow phone that pushes it off the sides instead of shrinking into the text
      radius = cfg.radius * Math.min(W, H);
      let d = ((2 * Math.PI * radius) / n) * 0.62;
      radius = Math.max(radius, clear + d / 2);
      d = Math.min(((2 * Math.PI * radius) / n) * 0.62, 0.34 * Math.max(W, H));
      rg.style.setProperty("--mo-og-d", `${d}px`);
      rg.style.setProperty("--mo-og-img", `${d * IMG_OVERSCAN}px`);
    };

    const pointerAngle = (e: PointerEvent) => {
      const r = rg.getBoundingClientRect();
      return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
    };
    const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

    const frame = (now: number) => {
      const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0;
      lastT = now;
      if (!held && spin) {
        drag += spin * dt;
        spin *= Math.exp(-dt / THROW_DECAY_S);
        if (Math.abs(spin) < 0.01) spin = 0;
      }
      const angle = scroll.get(now) + keys.get(now) + drag;
      const speed = lastAngle === null || !dt ? 0 : Math.abs(angle - lastAngle) / dt;
      lastAngle = angle;
      // the stretch follows how fast the ring turns, through a spring, so it eases back with one little give
      if (!reduced && cfg.flex > 0) {
        const target = clamp01(speed / 6);
        stretchV += (SPRING_K * (target - stretch) - SPRING_C * stretchV) * dt;
        stretch += stretchV * dt;
      }
      const sx = 1 + 2 * cfg.flex * stretch;
      const sy = 1 - cfg.flex * stretch;
      for (let i = 0; i < n; i++) {
        const a = angle + i * step - Math.PI / 2;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;
        const turn = a + Math.PI / 2; // the shape lies along the ring
        items.current[i]?.style.setProperty("transform", `translate3d(${x}px, ${y}px, 0)`);
        masks.current[i]?.style.setProperty("transform", `rotate(${turn}rad) scale(${sx}, ${sy})`);
        // the opposite of the shape's turn and stretch, so the photo stays upright and never bends
        flats.current[i]?.style.setProperty("transform", `scale(${1 / sx}, ${1 / sy}) rotate(${-turn}rad)`);
      }
      raf = onScreen ? requestAnimationFrame(frame) : 0;
    };
    const start = () => {
      if (!raf) {
        lastT = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      scroll.set((span > 0 ? clamp01(-r.top / span) : 0) * cfg.turns * Math.PI * 2, performance.now());
    };
    const onDown = (e: PointerEvent) => {
      if (!cfg.drag || held) return;
      held = { id: e.pointerId, angle: pointerAngle(e), t: e.timeStamp };
      spin = 0;
      rg.setPointerCapture(e.pointerId);
      rg.dataset.held = "true";
    };
    const onMove = (e: PointerEvent) => {
      if (!held || e.pointerId !== held.id) return;
      const a = pointerAngle(e);
      const delta = wrap(a - held.angle);
      const dt = Math.max(1, e.timeStamp - held.t) / 1000;
      drag += delta;
      spin = reduced ? 0 : lerp(spin, delta / dt, 0.5);
      held = { ...held, angle: a, t: e.timeStamp };
    };
    const onUp = (e: PointerEvent) => {
      if (!held || e.pointerId !== held.id) return;
      // a pause before letting go means no throw
      if (e.timeStamp - held.t > 80) spin = 0;
      held = null;
      delete rg.dataset.held;
    };
    keyTurn.current.nudge = (dir: number) => {
      keyTarget += dir * step;
      keys.set(keyTarget, performance.now());
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = !!entry?.isIntersecting;
      if (onScreen) start();
    });
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 150);
    };

    measure();
    onScroll();
    scroll.jump(scroll.get(Infinity));
    void document.fonts?.ready.then(measure);
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    rg.addEventListener("pointerdown", onDown);
    rg.addEventListener("pointermove", onMove);
    rg.addEventListener("pointerup", onUp);
    rg.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      rg.removeEventListener("pointerdown", onDown);
      rg.removeEventListener("pointermove", onMove);
      rg.removeEventListener("pointerup", onUp);
      rg.removeEventListener("pointercancel", onUp);
    };
  }, [cfg, n]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    keyTurn.current.nudge(e.key === "ArrowRight" ? 1 : -1);
  };

  return (
    <section ref={root} className={cn("mo-og bg-bg text-ink", className)} style={{ "--mo-og-runway": RUNWAY } as React.CSSProperties}>
      <div className="mo-og-stage">
        <div
          ref={ring}
          className="mo-og-ring"
          tabIndex={0}
          role="group"
          aria-label={cfg.ariaLabel}
          data-drag={cfg.drag}
          onKeyDown={onKey}
        >
          <ul className="m-0 list-none p-0">
            {cfg.photos.map((photo, i) => (
              <li
                key={i}
                ref={(node) => {
                  items.current[i] = node;
                }}
                className="mo-og-item"
              >
                <div
                  ref={(node) => {
                    masks.current[i] = node;
                  }}
                  className="mo-og-mask bg-surface"
                  style={{ borderRadius: shapes[i] }}
                >
                  <div
                    ref={(node) => {
                      flats.current[i] = node;
                    }}
                    className="mo-og-flat"
                  >
                    {photo.src ? (
                      <img src={photo.src} alt={photo.alt} draggable={false} decoding="async" className="mo-og-img object-cover" />
                    ) : (
                      <div className="mo-og-img" style={{ background: coverFor(i) }} />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div ref={copy} className="mo-og-copy text-center">
          <h2 className="mo-display m-0">
            <span className="block">{cfg.headline[0]}</span>
            <span className="block text-muted">{cfg.headline[1]}</span>
          </h2>
          <p className="mx-auto mb-0 mt-6 max-w-[340px] text-[18px] leading-[1.4] text-muted max-md:mt-[18px] max-md:max-w-[290px] max-md:text-base">
            {cfg.text} <span className="text-ink">{cfg.emphasis}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
