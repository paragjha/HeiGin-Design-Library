"use client";

import * as React from "react";
import { motionConfig } from "@/lib/motion-config";
import { cn, coverFor, easeInOut, prefersReducedMotion } from "@/lib/motion-utils";

const MIN_SCALE = 0.3; // the tail card's size against the head card's as it leaves the screen
// Speeds are per 60 fps frame, as tuned in the original; the loop scales them by the real frame time.
const AUTOPLAY = 0.0016;
const DRAG = 0.0012;
const SCROLL = 0.0002;
const SCROLL_DAMP = 0.9; // per-frame decay of the scroll boost: higher glides longer
const THROW_DAMP = 0.95; // per-frame decay of a released drag
const OVERLAP = 1.5; // px each card overlaps its tail neighbour, to hide sub-pixel seams

/**
 * Square photos on one bottom baseline, sized by where they are: each is a fixed ratio larger than its
 * tail neighbour, so they shrink continuously as they travel and leave the edge still a third of the head's size.
 * It drifts on its own, speeds up while the page scrolls, follows a drag and steps one card with the arrows or arrow keys.
 */
export function MotionScaleSlider({ className }: { className?: string }) {
  const { slides, ariaLabel } = motionConfig.scaleSlider;
  const m = slides.length;
  const scene = React.useRef<HTMLDivElement>(null);
  const cards = React.useRef<(HTMLDivElement | null)[]>([]);
  const api = React.useRef<{ step: (dir: number) => void } | null>(null);

  React.useEffect(() => {
    const el = scene.current;
    if (!el || m < 3) return;
    const reduced = prefersReducedMotion();
    let vis = 5;
    let ratio = 1.35;
    let span = 1;
    let vanish = 0;
    let base = 100;
    let travel = 0;
    let dragX = 0;
    let velocity = 0;
    let boost = 0;
    let lastY = window.scrollY;
    let last = 0;
    let raf = 0;
    let drag: { x: number; id: number } | null = null;
    let nav: { from: number; to: number; start: number; ms: number } | null = null;

    // Card boundaries sit on an exponential map whose vanishing point is past the tail edge, so exactly
    // `vis` cards tile the stage edge to edge at every phase and the loop has no seam.
    const boundary = (k: number) => vanish + span * Math.pow(ratio, travel - Math.floor(travel) - k);
    const position = () => {
      const shift = Math.floor(travel);
      cards.current.forEach((card, i) => {
        if (!card) return;
        const k = (((i - shift) % m) + m) % m;
        const inner = boundary(k + 1);
        const w = Math.max(boundary(k) - inner, 1) + OVERLAP;
        card.style.zIndex = String(vis - k);
        card.style.transform = `translate3d(${(inner - OVERLAP).toFixed(1)}px,0,0) scale(${(w / base).toFixed(5)})`;
      });
    };
    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const aspect = w / h;
      // more cards on wider screens keeps the head card from outgrowing the stage height
      vis = Math.min(m - 1, aspect >= 2.2 ? 6 : aspect >= 1.5 ? 5 : aspect >= 1 ? 4 : 3);
      ratio = Math.pow(1 / MIN_SCALE, 1 / (vis - 1));
      span = w / (1 - MIN_SCALE);
      vanish = -MIN_SCALE * span;
      // every card is drawn at the largest size it ever reaches and scaled down, so nothing re-rasterises per frame
      base = span * (ratio - 1) + OVERLAP;
      cards.current.forEach((c) => {
        if (c) c.style.width = c.style.height = `${base.toFixed(1)}px`;
      });
      position();
    };

    const frame = (now: number) => {
      const f = last ? Math.min(3, ((now - last) / 1000) * 60) : 1;
      last = now;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (nav) {
        const k = Math.min(1, (now - nav.start) / nav.ms);
        travel = nav.from + (nav.to - nav.from) * easeInOut(k);
        if (k >= 1) nav = null;
      } else {
        // scrolling either way adds speed that glides off, never reverses the drift
        boost = boost * Math.pow(SCROLL_DAMP, f) + Math.abs(dy) * SCROLL;
        if (!drag) {
          dragX += velocity * f;
          velocity = Math.abs(velocity) < 0.05 ? 0 : velocity * Math.pow(THROW_DAMP, f);
        }
        travel += dragX * DRAG - (reduced ? 0 : AUTOPLAY * f) - boost * f;
      }
      dragX = 0;
      position();
      raf = requestAnimationFrame(frame);
    };

    api.current = {
      step(dir) {
        const to = Math.round(travel) + dir;
        drag = null;
        velocity = 0;
        nav = { from: travel, to, start: performance.now(), ms: Math.min(1100, 450 + 120 * Math.abs(to - travel)) };
      },
    };

    // content follows the finger: the head is on the right, so a rightward drag runs the conveyor back
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      nav = null;
      velocity = 0;
      drag = { x: e.clientX, id: e.pointerId };
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      drag.x = e.clientX;
      dragX += dx;
      velocity = dx;
    };
    const onUp = (e: PointerEvent) => {
      if (drag?.id === e.pointerId) drag = null;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    resize();
    let timer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(resize, 150);
    });
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      last = 0;
      lastY = window.scrollY;
      if (entry?.isIntersecting) raf = requestAnimationFrame(frame);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      api.current = null;
    };
  }, [m]);

  // -1 runs the way the conveyor drifts (next); +1 brings the last card back
  return (
    <section
      role="group"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") api.current?.step(-1);
        else if (e.key === "ArrowRight") api.current?.step(1);
        else return;
        e.preventDefault();
      }}
      className={cn(
        "relative overflow-hidden bg-bg [height:100svh] focus-visible:outline-1 focus-visible:-outline-offset-2 focus-visible:outline-focus",
        className,
      )}
    >
      <div ref={scene} className="absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing">
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(node) => {
              cards.current[i] = node;
            }}
            className="absolute bottom-0 left-0 origin-bottom-left overflow-hidden [backface-visibility:hidden] [will-change:transform]"
          >
            {slide.src ? (
              <img src={slide.src} alt={slide.alt} draggable={false} decoding="async" className="block size-full object-cover [object-position:50%_22%]" />
            ) : (
              <div className="size-full" style={{ background: coverFor(i) }} role="img" aria-label={slide.alt || undefined} />
            )}
          </div>
        ))}
      </div>
      <div
        role="group"
        aria-label="Slide controls"
        className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3.5 rounded-full bg-accent p-1.5 md:bottom-10"
      >
        {[
          { label: "Previous", dir: 1, d: "M10 3L5 8L10 13" },
          { label: "Next", dir: -1, d: "M6 3L11 8L6 13" },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            aria-label={b.label}
            onClick={() => api.current?.step(b.dir)}
            className="grid size-10 place-items-center rounded-full text-on-accent transition-colors duration-300 hover:bg-white/15 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          >
            <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden="true">
              <path d={b.d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </section>
  );
}
