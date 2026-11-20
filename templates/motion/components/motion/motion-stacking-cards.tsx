"use client";

import * as React from "react";
import { motionConfig } from "@/lib/motion-config";
import { chaser, clamp01, cn, coverFor, expoOut, prefersReducedMotion } from "@/lib/motion-utils";

const STEP_VH = 50; // scroll distance per card
const SCRUB_S = 0.5; // how long the cards take to catch up with the scroll
const TILT = 2; // degrees a covered card turns as it sinks; its photo turns the same again
const ZOOM = 1.2; // how far a covered card's photo zooms in
const DROP = 20; // how far a covered card sinks, % of its height
const DRIFT = 10; // how far an incoming photo trails its card, %
const LABEL_DELAY = 0.6; // share of a slide-in before the incoming label rises
const LABEL_OUT = 0.1; // share of a step the covered card's label takes to fade
const CLICK_LOCK_MS = 1500; // a click holds the counter on its target until the page arrives

const pad2 = (n: number) => String(n).padStart(2, "0");

type Parts = { card: HTMLLIElement; clip: HTMLDivElement; fig: HTMLElement; img: HTMLElement; label: HTMLElement | null; fill: HTMLSpanElement | null };

/** A stack of cards that holds the screen while you scroll: each new card slides up over the last, which tilts, shrinks and sinks. */
export function MotionStackingCards({ className }: { className?: string }) {
  const { cards, ariaLabel } = motionConfig.stack;
  const n = cards.length;
  const root = React.useRef<HTMLElement>(null);
  const parts = React.useRef<Partial<Parts>[]>([]);
  const [count, setCount] = React.useState({ active: 0, prev: -1 });
  const [risen, setRisen] = React.useState<boolean[]>(() => cards.map((_, i) => i === 0));
  const activeRef = React.useRef(0);
  const lock = React.useRef({ to: -1, until: 0 });

  const setActive = React.useCallback((i: number) => {
    if (i === activeRef.current) return;
    setCount({ active: i, prev: activeRef.current });
    activeRef.current = i;
  }, []);

  React.useEffect(() => {
    const el = root.current;
    if (!el || n < 2) return;
    const scrub = chaser(prefersReducedMotion() ? 0 : SCRUB_S, expoOut);
    const up = cards.map((_, i) => i === 0);
    let raf = 0;
    let last = -1;

    const target = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return span > 0 ? clamp01(-r.top / span) : 0;
    };

    const render = (p: number, now: number) => {
      const pos = p * (n - 1);
      for (let i = 0; i < n; i++) {
        const e = parts.current[i];
        if (!e?.card || !e.clip || !e.fig || !e.img) continue;
        const sIn = i === 0 ? 1 : clamp01(pos - (i - 1)); // this card sliding in
        const sOut = i === n - 1 ? 0 : clamp01(pos - i); // this card being covered
        e.card.style.transform = `translate3d(0, ${(1 - sIn) * 101}%, 0)`;
        e.img.style.transform = `translate3d(0, ${-DRIFT * (1 - sIn)}%, 0) scale(${1 + (DRIFT / 50) * (1 - sIn)})`;
        e.clip.style.transform = `translate3d(0, ${DROP * sOut}%, 0) rotate(${TILT * sOut}deg)`;
        e.clip.style.setProperty("--mo-c", sOut.toFixed(4));
        e.fig.style.transform = `scale(${1 + (ZOOM - 1) * sOut}) rotate(${TILT * sOut}deg)`;
        if (e.label) e.label.style.opacity = String(1 - clamp01(sOut / LABEL_OUT));
        if (e.fill) e.fill.style.scale = `${sIn} 1`;
      }
      // the incoming label and the counter play on their own clock, not the scrub
      let flipped = false;
      for (let i = 1; i < n; i++) {
        const want = pos >= i - 1 + LABEL_DELAY;
        if (up[i] !== want) {
          up[i] = want;
          flipped = true;
        }
      }
      if (flipped) setRisen([...up]);
      const nearest = Math.round(pos);
      if (lock.current.to >= 0) {
        if (nearest !== lock.current.to && now < lock.current.until) return;
        lock.current.to = -1;
      }
      setActive(nearest);
    };

    const frame = (now: number) => {
      scrub.set(target(), now);
      const p = scrub.get(now);
      if (p !== last) {
        last = p;
        render(p, now);
      }
      raf = requestAnimationFrame(frame);
    };
    scrub.jump(target());
    // only run while the stack is on screen
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry?.isIntersecting) raf = requestAnimationFrame(frame);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [cards, n, setActive]);

  const jumpTo = (i: number, at: number) => {
    const el = root.current;
    if (!el || n < 2) return;
    lock.current = { to: i, until: at + CLICK_LOCK_MS };
    setActive(i);
    const top = window.scrollY + el.getBoundingClientRect().top;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * (i / (n - 1)), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const set = (i: number, key: keyof Parts) => (node: HTMLElement | null) => {
    (parts.current[i] ??= {})[key] = (node ?? undefined) as never;
  };

  return (
    <section
      ref={root}
      aria-label={ariaLabel}
      className={cn("mo-stack bg-bg text-ink", className)}
      style={{ "--mo-n": n, "--mo-step": STEP_VH } as React.CSSProperties}
    >
      <div className="mo-stack-stage">
        <div className="mo-stack-view">
          <ol className="mo-stack-frame isolate">
            {cards.map((card, i) => (
              <li key={i} ref={set(i, "card")} className="mo-stack-card" style={{ zIndex: i, transform: i ? "translate3d(0, 101%, 0)" : undefined }}>
                <div ref={set(i, "clip")} className="mo-stack-clip">
                  <figure ref={set(i, "fig")} className="mo-stack-fig">
                    {card.src ? (
                      <img ref={set(i, "img")} className="mo-stack-img" src={card.src} alt={card.alt} />
                    ) : (
                      <div ref={set(i, "img")} className="mo-stack-img" style={{ background: coverFor(i) }} aria-hidden="true" />
                    )}
                    <figcaption
                      ref={set(i, "label")}
                      className="absolute bottom-16 left-5 z-[2] overflow-hidden pb-[0.16em] text-[clamp(18px,1.6vw,28px)] font-medium leading-tight tracking-tight text-white"
                    >
                      <span className="mo-stack-label block" data-up={risen[i]}>
                        {card.label}
                      </span>
                    </figcaption>
                    <span aria-hidden="true" className="absolute right-5 top-4 z-[2] text-[13px] font-medium tabular-nums text-white">
                      {pad2(i + 1)}
                    </span>
                  </figure>
                </div>
              </li>
            ))}
          </ol>

          {n >= 2 && (
            <nav
              aria-label="Card index"
              className="absolute bottom-4 left-1/2 z-[1] flex -translate-x-1/2 items-center gap-3 rounded-full bg-accent py-1.5 pl-3.5 pr-2 text-[13px] font-medium tabular-nums text-on-accent"
            >
              <span aria-hidden="true" className="flex items-center gap-1">
                <span className="mo-count grid h-[1.2em] overflow-hidden leading-[1.2em]">
                  {cards.map((_, i) => (
                    <span
                      key={i}
                      style={{
                        translate: `0 ${i === count.active ? 0 : i < count.active ? -100 : 100}%`,
                        transition: i === count.active || i === count.prev ? undefined : "none",
                      }}
                    >
                      {pad2(i + 1)}
                    </span>
                  ))}
                </span>
                <span className="text-on-accent/55">/ {pad2(n)}</span>
              </span>
              <span className="flex items-center">
                {cards.map((card, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={card.label}
                    aria-current={i === count.active ? "true" : undefined}
                    onClick={(e) => jumpTo(i, e.timeStamp)}
                    className="grid h-6 w-5 place-items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
                  >
                    <span className="block h-[3px] w-3.5 overflow-hidden rounded-full bg-white/25">
                      <span ref={set(i, "fill")} className="block h-full origin-left bg-white" style={{ scale: i === 0 ? "1 1" : "0 1" }} />
                    </span>
                  </button>
                ))}
              </span>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
