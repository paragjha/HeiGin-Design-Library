"use client";

import * as React from "react";
import { motionConfig } from "@/lib/motion-config";
import { cn, coverFor, dampingForOvershoot, EASE, prefersReducedMotion, springCurve } from "@/lib/motion-utils";

type View = "idle" | "list" | "detail";
const FRAMES = 48;
const ROW_H = 44;
const IDLE = { w: 176, h: 40 };
const IDLE_SMALL = { w: 160, h: 38 };
const WIDTH = { list: 248, detail: 340 };
const WIDTH_SMALL = { list: 232, detail: 300 };

const pad = (i: number) => String(i + 1).padStart(2, "0");
const small = () => window.matchMedia("(max-width: 479px)").matches;

/**
 * A dark capsule pinned to the top that always names the section you are in. Click it and it grows into the
 * section list; pick one and it grows again into a short description with a scroll-to link, then settles back.
 */
export function MotionMorphingIsland({ className }: { className?: string }) {
  const cfg = motionConfig.island;
  const pill = React.useRef<HTMLDivElement>(null);
  const views = React.useRef<Record<View, HTMLElement | null>>({ idle: null, list: null, detail: null });
  const toggle = React.useRef<HTMLButtonElement>(null);
  const rows = React.useRef<(HTMLButtonElement | null)[]>([]);
  const go = React.useRef<HTMLButtonElement>(null);
  const sections = React.useRef<(HTMLElement | null)[]>([]);
  const anim = React.useRef<Animation | null>(null);
  const [view, setView] = React.useState<View>("idle");
  const [current, setCurrent] = React.useState(0);
  const [picked, setPicked] = React.useState(0);

  // The section in view is the one under the middle of the window.
  React.useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight / 2;
      const i = sections.current.findIndex((s) => {
        const r = s?.getBoundingClientRect();
        return r && r.top <= mid && r.bottom > mid;
      });
      if (i >= 0) setCurrent(i);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sizeOf = React.useCallback((v: View) => {
    const s = small();
    if (v === "idle") return s ? IDLE_SMALL : IDLE;
    const w = (s ? WIDTH_SMALL : WIDTH)[v];
    return { w, h: views.current[v]?.offsetHeight ?? 0 };
  }, []);

  // Grows spring with the same few pixels of overshoot however far they go; a collapse just settles.
  const morph = React.useCallback(
    (to: View) => {
      const el = pill.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const from = { w: r.width, h: r.height };
      const target = sizeOf(to);
      anim.current?.cancel();
      const done = () => {
        el.style.width = `${target.w}px`;
        el.style.height = `${target.h}px`;
      };
      if (prefersReducedMotion() || (Math.abs(target.w - from.w) < 0.5 && Math.abs(target.h - from.h) < 0.5)) return done();
      const duration = cfg.duration * 1000;
      const grow = target.w * target.h > from.w * from.h;
      let frames: Keyframe[];
      let easing = "linear";
      if (grow) {
        const cw = springCurve(dampingForOvershoot(cfg.overshoot, target.w - from.w));
        const ch = springCurve(dampingForOvershoot(cfg.overshoot, target.h - from.h));
        frames = Array.from({ length: FRAMES + 1 }, (_, k) => {
          const t = k / FRAMES;
          return { width: `${from.w + (target.w - from.w) * cw(t)}px`, height: `${from.h + (target.h - from.h) * ch(t)}px` };
        });
      } else {
        frames = [
          { width: `${from.w}px`, height: `${from.h}px` },
          { width: `${target.w}px`, height: `${target.h}px` },
        ];
        easing = EASE;
      }
      done();
      anim.current = el.animate(frames, { duration, easing });
    },
    [cfg.duration, cfg.overshoot, sizeOf],
  );

  // after render, so the detail card is measured with the section just picked
  React.useLayoutEffect(() => morph(view), [view, picked, morph]);

  // Focus follows the view, so keyboard users land on what just opened.
  React.useEffect(() => {
    if (view === "list") rows.current[current]?.focus({ preventScroll: true });
    else if (view === "detail") go.current?.focus({ preventScroll: true });
    // the current section is read once per opening, not on every scroll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  React.useEffect(() => {
    if (view === "idle") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Escape steps back one level at a time
      const back = view === "detail" ? "list" : "idle";
      setView(back);
      if (back === "idle") toggle.current?.focus({ preventScroll: true });
    };
    const onDown = (e: PointerEvent) => {
      if (!pill.current?.contains(e.target as Node)) setView("idle");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [view]);

  React.useEffect(() => {
    const onResize = () => morph(view);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [view, morph]);

  const scrollTo = (i: number) => {
    sections.current[i]?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    setView("idle");
    toggle.current?.focus({ preventScroll: true });
  };

  const detail = cfg.sections[picked]!;

  return (
    <div className={cn("mo-mi mo-dark bg-bg text-ink", className)} style={{ "--mo-mi-blur": `${cfg.blur}px` } as React.CSSProperties}>
      <div className="mo-mi-dock">
        <div ref={pill} className="mo-mi-pill border border-border bg-surface" data-view={view}>
          <button
            ref={(node) => {
              views.current.idle = node;
              toggle.current = node;
            }}
            type="button"
            className="mo-mi-view mo-mi-idle"
            data-active={view === "idle"}
            inert={view !== "idle"}
            aria-expanded={view !== "idle"}
            aria-controls="mo-mi-list"
            aria-label={`${cfg.listLabel}: ${cfg.sections[current]?.name ?? ""}`}
            onClick={() => setView("list")}
          >
            <span className="mo-mi-slot w-[1.7em] shrink-0 text-[13px] font-medium tabular-nums text-muted" aria-hidden="true">
              <span className="mo-mi-col" style={{ transform: `translateY(${-current * 1.2}em)` }}>
                {cfg.sections.map((_, i) => (
                  <span key={i} className="mo-mi-cell">
                    {pad(i)}
                  </span>
                ))}
              </span>
            </span>
            <span className="mo-mi-slot min-w-0 flex-1 text-left text-[15px] font-medium" aria-hidden="true">
              <span className="mo-mi-col" style={{ transform: `translateY(${-current * 1.2}em)` }}>
                {cfg.sections.map((s, i) => (
                  <span key={i} className="mo-mi-cell">
                    {s.name}
                  </span>
                ))}
              </span>
            </span>
            <span className="size-1.5 shrink-0 rounded-full bg-ink" aria-hidden="true" />
          </button>

          <div
            ref={(node) => {
              views.current.list = node;
            }}
            id="mo-mi-list"
            className="mo-mi-view mo-mi-list flex-col px-2 pb-1.5 pt-2.5"
            data-active={view === "list"}
            inert={view !== "list"}
          >
            <div className="flex h-8 items-center justify-between pl-3 pr-2.5">
              <span className="text-[13px] font-medium text-muted">{cfg.listLabel}</span>
              <button type="button" className="mo-mi-text" onClick={() => setView("idle")}>
                {cfg.closeLabel}
              </button>
            </div>
            <div className="relative">
              {cfg.sections.map((s, i) => (
                <button
                  key={s.name}
                  ref={(node) => {
                    rows.current[i] = node;
                  }}
                  type="button"
                  className="mo-mi-row"
                  aria-current={i === current ? "true" : undefined}
                  onClick={() => {
                    setPicked(i);
                    setView("detail");
                  }}
                >
                  <span className="w-[18px] shrink-0 text-[13px] tabular-nums text-muted">{pad(i)}</span>
                  <span className="flex-1">{s.name}</span>
                </button>
              ))}
              <span
                className="mo-mi-mark size-1.5 rounded-full bg-ink"
                style={{ transform: `translateY(${current * ROW_H + ROW_H / 2 - 3}px)` }}
                aria-hidden="true"
              />
            </div>
          </div>

          <div
            ref={(node) => {
              views.current.detail = node;
            }}
            className="mo-mi-view mo-mi-detail flex-col gap-2.5 px-5 pb-3.5 pt-[18px] max-[479px]:px-[18px] max-[479px]:pt-4"
            data-active={view === "detail"}
            inert={view !== "detail"}
          >
            <div className="flex items-baseline gap-2.5">
              <span className="text-[13px] font-medium tabular-nums text-muted">{pad(picked)}</span>
              <span className="text-[clamp(18px,1.4vw,28px)] font-medium">{detail.name}</span>
            </div>
            <p className="m-0 text-sm leading-[1.4] text-ink-soft">{detail.text}</p>
            <div className="flex items-center justify-between border-t border-border pt-2.5">
              <button type="button" className="mo-mi-text" onClick={() => setView("list")}>
                {cfg.backLabel}
              </button>
              <button ref={go} type="button" className="mo-mi-text mo-mi-text-primary" onClick={() => scrollTo(picked)}>
                {cfg.goLabel}
              </button>
            </div>
          </div>
        </div>
        <div className="sr-only" aria-live="polite" role="status" aria-atomic="true">
          {cfg.sections[current]?.name}
        </div>
      </div>

      {cfg.sections.map((s, i) => (
        <section
          key={s.name}
          ref={(node) => {
            sections.current[i] = node;
          }}
          className="mo-mi-section"
          aria-label={s.name}
        >
          {s.src ? (
            <img src={s.src} alt={s.alt} loading={i ? "lazy" : "eager"} decoding="async" className="mo-mi-photo object-cover" />
          ) : (
            <div className="mo-mi-photo" style={{ background: coverFor(i) }} />
          )}
          <span className="absolute left-[var(--mo-margin)] top-[var(--mo-margin)] z-[1] text-[13px] font-medium tabular-nums text-muted">
            {pad(i)}
          </span>
          <h2 className="mo-display absolute bottom-[var(--mo-margin)] left-[var(--mo-margin)] z-[1] m-0">{s.name}</h2>
        </section>
      ))}
    </div>
  );
}
