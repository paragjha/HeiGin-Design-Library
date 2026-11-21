"use client";

import * as React from "react";
import { motionConfig } from "@/lib/motion-config";
import { cn, coverFor, EASE, prefersReducedMotion } from "@/lib/motion-utils";

const RANGE = 2; // rows either side of the lens that still brighten
const DIM = 0.14; // opacity of a row outside the lens
const CURVE = 1.6; // brightness falls off on this curve, so the rows next to the lens stay readable
const FOLLOW = 9; // how quickly the lens catches up with the pointer, per second
const WIPE_MS = 700;
const SETTLE = 0.001;

/** A list of names that brightens around the pointer like a lens; the nearest name's photo wipes in over the last one. */
export function MotionHoverIndex({ className }: { className?: string }) {
  const { label, ariaLabel, items } = motionConfig.hoverIndex;
  const n = items.length;
  const start = Math.floor((n - 1) / 2);
  const root = React.useRef<HTMLElement>(null);
  const rows = React.useRef<(HTMLAnchorElement | null)[]>([]);
  const imgs = React.useRef<(HTMLElement | null)[]>([]);
  const target = React.useRef(start);

  React.useEffect(() => {
    const el = root.current;
    if (!el || n < 2) return;
    const reduced = prefersReducedMotion();
    const wipes: (Animation | undefined)[] = [];
    let f = target.current;
    let active = Math.round(f);
    let layer = 1;
    let centers: number[] = [];
    let raf = 0;
    let last = 0;
    let dirty = true;

    const measure = () => {
      const top = el.getBoundingClientRect().top;
      centers = rows.current.map((r) => {
        const b = r!.getBoundingClientRect();
        return b.top - top + b.height / 2;
      });
      dirty = true;
    };
    // The pointer's height maps onto the list as a continuous row number, so the lens glides between rows.
    const rowAt = (y: number) => {
      if (y <= centers[0]!) return 0;
      for (let i = 1; i < n; i++) if (y <= centers[i]!) return i - 1 + (y - centers[i - 1]!) / (centers[i]! - centers[i - 1]!);
      return n - 1;
    };
    // The new photo comes in from the side the lens is moving toward and lands over the last one.
    const show = (i: number, dir: number) => {
      const img = imgs.current[i];
      if (!img) return;
      wipes[i]?.cancel();
      img.style.zIndex = String(++layer);
      wipes[i] = img.animate([{ clipPath: dir > 0 ? "inset(100% 0 0% 0)" : "inset(0% 0 100% 0)" }, { clipPath: "inset(0% 0 0% 0)" }], {
        duration: reduced ? 0 : WIPE_MS,
        easing: EASE,
        fill: "forwards",
      });
    };
    const paint = () => {
      rows.current.forEach((r, i) => {
        const near = Math.max(0, 1 - Math.abs(i - f) / RANGE);
        if (r) r.style.opacity = (DIM + (1 - DIM) * Math.pow(near, CURVE)).toFixed(3);
      });
      const i = Math.round(f);
      if (i !== active) {
        show(i, Math.sign(i - active));
        active = i;
      }
    };
    const frame = (now: number) => {
      const dt = last ? Math.max(1 / 240, (now - last) / 1000) : 1 / 60;
      last = now;
      const before = f;
      f = reduced ? target.current : f + (target.current - f) * (1 - Math.exp(-dt * FOLLOW));
      if (Math.abs(target.current - f) < SETTLE) f = target.current;
      if (f !== before || dirty) {
        dirty = false;
        paint();
      }
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch") target.current = rowAt(e.clientY - el.getBoundingClientRect().top);
    };
    el.addEventListener("pointermove", onMove);
    measure();
    paint();
    void document.fonts?.ready.then(measure);
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 150);
    };
    window.addEventListener("resize", onResize);
    // the lens only runs while the section is on screen
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      last = 0;
      if (entry?.isIntersecting) {
        measure();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointermove", onMove);
      wipes.forEach((w) => w?.cancel());
    };
  }, [n]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = rows.current.indexOf(document.activeElement as HTMLAnchorElement);
    if (i < 0) return;
    const to = e.key === "ArrowDown" ? i + 1 : e.key === "ArrowUp" ? i - 1 : -1;
    if (to < 0 || to >= n) return;
    e.preventDefault();
    rows.current[to]?.focus();
  };

  return (
    <section
      ref={root}
      aria-label={ariaLabel}
      className={cn("mo-dark relative min-h-[640px] overflow-hidden bg-bg text-ink [height:100svh]", className)}
    >
      <p className="absolute left-[var(--mo-margin)] top-[var(--mo-margin)] m-0 text-[15px] font-medium text-muted">{label}</p>
      <div className="mo-hi-body">
        <ol className="m-0 list-none p-0" onKeyDown={onKeyDown}>
          {items.map((item, i) => (
            <li key={item.href}>
              <a
                ref={(node) => {
                  rows.current[i] = node;
                }}
                href={item.href}
                onPointerDown={() => (target.current = i)}
                onFocus={() => (target.current = i)}
                className="block whitespace-nowrap rounded-sm text-[26px] font-medium leading-[1.05] tracking-[-0.035em] text-ink [will-change:opacity] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/35 md:text-[clamp(30px,3.6vw,64px)]"
                style={{ opacity: i === start ? 1 : DIM }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ol>
        <figure className="mo-hi-card m-0" aria-hidden="true">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface">
            {items.map((item, i) =>
              item.image ? (
                <img
                  key={i}
                  ref={(node) => {
                    imgs.current[i] = node;
                  }}
                  src={item.image}
                  alt=""
                  decoding="async"
                  className="absolute inset-0 size-full object-cover"
                  style={{ clipPath: i === start ? "inset(0% 0 0% 0)" : "inset(100% 0 0% 0)" }}
                />
              ) : (
                <div
                  key={i}
                  ref={(node) => {
                    imgs.current[i] = node;
                  }}
                  className="absolute inset-0"
                  style={{ background: coverFor(i), clipPath: i === start ? "inset(0% 0 0% 0)" : "inset(100% 0 0% 0)" }}
                />
              ),
            )}
          </div>
        </figure>
      </div>
    </section>
  );
}
