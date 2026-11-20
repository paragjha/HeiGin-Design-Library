"use client";

import * as React from "react";
import { motionConfig } from "@/lib/motion-config";
import { chaser, clamp01, cn, expoOut, prefersReducedMotion } from "@/lib/motion-utils";

const SCRUB_S = 0.6; // how long the bead takes to catch up with the scroll
const UPCOMING = 0.42; // opacity of a step the bead has not reached; passed steps sit at VISITED, the active one at 1
const VISITED = 0.72;
const ARRIVE = 0.02; // a click scrolls just past a step's anchor, so the step is reached
const STAGGER_MS = 80; // between a step brightening, its image and its number
const ROLL_STAGGER_MS = 50; // between the digits of a number

/** A step number as one window per digit over a 0..d strip, parked one glyph below the window until reached. */
function digitsOf(i: number) {
  return String(i + 1)
    .padStart(2, "0")
    .split("")
    .map(Number)
    .map((d) => ({ glyphs: Array.from({ length: d + 1 }, (_, g) => g), hidden: 100 / (d + 1), target: (-d * 100) / (d + 1) }));
}

/** A how-it-works row on a line: as you scroll, a bead draws the line and each step lights up as the bead reaches it. */
export function MotionProcessRail({ className }: { className?: string }) {
  const { steps, ariaLabel } = motionConfig.process;
  const root = React.useRef<HTMLElement>(null);
  const line = React.useRef<HTMLDivElement>(null);
  const drawn = React.useRef<SVGLineElement>(null);
  const bead = React.useRef<HTMLSpanElement>(null);
  const stepEls = React.useRef<(HTMLLIElement | null)[]>([]);
  const anchors = React.useRef<number[]>(steps.map((_, i) => (i + 0.5) / steps.length));
  const [active, setActive] = React.useState(-1);
  const [showAll, setShowAll] = React.useState(false); // phones: every step readable at once

  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    // shortcut: phones show every step at once instead of the vertical scrub; add a vertical line when phone traffic matters.
    const phone = window.matchMedia("(max-width: 767px)");
    const scrub = chaser(prefersReducedMotion() ? 0 : SCRUB_S, expoOut);
    let raf = 0;
    let last = -1;
    let current = -1;

    // Each step's anchor is the middle of its column, as a share of the line.
    const layout = () => {
      const lr = line.current?.getBoundingClientRect();
      if (!lr?.width) return;
      anchors.current = stepEls.current.map((s) => {
        const r = s?.getBoundingClientRect();
        return r ? clamp01((r.left + r.width / 2 - lr.left) / lr.width) : 0;
      });
    };
    const target = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return span > 0 ? clamp01(-r.top / span) : 0;
    };
    const reach = (p: number) => {
      let idx = -1;
      if (p > 0) anchors.current.forEach((a, i) => p >= a - 0.0001 && (idx = i));
      if (idx !== current) setActive((current = idx));
    };
    const draw = (p: number) => {
      drawn.current?.setAttribute("x2", `${p * 100}%`);
      if (bead.current) bead.current.style.left = `${p * 100}%`;
    };
    const frame = (now: number) => {
      scrub.set(target(), now);
      const p = scrub.get(now);
      if (p !== last) {
        last = p;
        draw(p);
        reach(p);
      }
      raf = requestAnimationFrame(frame);
    };

    let io: IntersectionObserver | null = null;
    const build = () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      setShowAll(phone.matches);
      if (phone.matches) {
        draw(1);
        return;
      }
      layout();
      scrub.jump(target());
      last = -1;
      io = new IntersectionObserver(([entry]) => {
        cancelAnimationFrame(raf);
        if (entry?.isIntersecting) raf = requestAnimationFrame(frame);
      });
      io.observe(el);
    };
    build();
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(layout, 150);
    };
    window.addEventListener("resize", onResize);
    phone.addEventListener("change", build);
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      phone.removeEventListener("change", build);
    };
  }, [steps]);

  // A click only moves the page to where that step has arrived; the scroll stays the single source of truth.
  const jumpTo = (i: number) => {
    const el = root.current;
    if (!el || window.matchMedia("(max-width: 767px)").matches) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * Math.min(1, (anchors.current[i] ?? 0) + ARRIVE), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <section ref={root} aria-label={ariaLabel} className={cn("relative bg-bg text-ink md:h-[300vh]", className)}>
      <div className="px-5 py-20 md:sticky md:top-0 md:flex md:h-screen md:items-center md:px-8 md:py-0">
        <div className="mx-auto w-full max-w-6xl">
          <div ref={line} className="relative hidden h-6 md:block" aria-hidden="true">
            <svg className="absolute inset-0 h-full w-full overflow-visible">
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--hg-color-border-strong)" strokeWidth="1" />
              <line ref={drawn} x1="0" y1="50%" x2="0" y2="50%" stroke="var(--hg-color-ink)" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span ref={bead} className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" style={{ left: 0 }} />
          </div>

          <ol className="m-0 mt-8 grid list-none gap-10 p-0 md:grid-cols-4 md:gap-6">
            {steps.map((step, i) => {
              const reached = showAll || i <= active;
              const digits = digitsOf(i);
              return (
                <li
                  key={step.title}
                  ref={(node) => {
                    stepEls.current[i] = node;
                  }}
                  className="mo-step"
                  style={{ opacity: showAll || i === active ? 1 : reached ? VISITED : UPCOMING }}
                >
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    aria-current={i === active ? "step" : undefined}
                    className="block w-full rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
                  >
                    <span className="flex text-[13px] font-medium tabular-nums text-muted" aria-hidden="true">
                      {digits.map((d, k) => (
                        <span key={k} className="mo-col">
                          <span
                            className="mo-strip"
                            style={{
                              translate: `0 ${reached ? d.target : d.hidden}%`,
                              transitionDelay: `${reached ? STAGGER_MS * 2 + k * ROLL_STAGGER_MS : (digits.length - 1 - k) * ROLL_STAGGER_MS}ms`,
                            }}
                          >
                            {d.glyphs.map((g) => (
                              <span key={g}>{g}</span>
                            ))}
                          </span>
                        </span>
                      ))}
                    </span>
                    <span className="mt-3 block text-[15px] font-medium tracking-tight">{step.title}</span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-muted">{step.text}</span>
                    {step.image && (
                      <span className="mo-step-media mt-5 block overflow-hidden rounded-lg border border-border bg-surface" data-shown={reached}>
                        <img src={step.image} alt={step.alt} loading="lazy" className="block aspect-[4/3] w-full object-contain" />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
