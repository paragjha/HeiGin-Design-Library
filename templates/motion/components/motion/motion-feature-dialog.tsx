"use client";

import * as React from "react";
import { motionConfig } from "@/lib/motion-config";
import { cn, coverFor, EASE, EASE_IN_OUT, prefersReducedMotion } from "@/lib/motion-utils";

const DURATION_MS = 550;
const ENTER = 128; // px the sheet rises from
const EXIT = 64; // the exit is its own quicker leg: half the travel, dropping away
const TINT = "rgb(10 10 10 / 0.2)";
const TINT_OFF = "rgb(10 10 10 / 0)";
const BLUR = "blur(6px)";
const BLUR_OFF = "blur(0px)";

function Media({ src, alt, i, className }: { src?: string; alt: string; i: number; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl bg-surface-hover", className)}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" className="block size-full object-cover" />
      ) : (
        <div className="size-full" style={{ background: coverFor(i) }} aria-hidden="true" />
      )}
    </div>
  );
}

const roundButton =
  "absolute right-4 top-4 z-[2] grid size-12 place-items-center rounded-full border border-current text-ink transition-colors duration-[350ms] ease-[cubic-bezier(0.3,0.9,0.1,1)]";

/** A feature tile that opens a detail sheet: the page dims and blurs, the sheet rises in from below and drops away on close. */
export function MotionFeatureDialog({ className }: { className?: string }) {
  const { label, title, image, alt, sheet } = motionConfig.featureDialog;
  const dialog = React.useRef<HTMLDialogElement>(null);
  const scrim = React.useRef<HTMLDivElement>(null);
  const modal = React.useRef<HTMLDivElement>(null);
  const closeBtn = React.useRef<HTMLButtonElement>(null);
  const live = React.useRef<Animation[]>([]);
  const isOpen = React.useRef(false);
  const titleId = React.useId();

  // Open and close are paired builds, not one reversed timeline: each starts from the live values, so either can interrupt the other.
  const run = (scrimTo: Keyframe, modalTo: Keyframe, legs: { scrim: number; move: number; fade: number }, easing: string) => {
    const s = scrim.current!;
    const m = modal.current!;
    const cs = getComputedStyle(s);
    const cm = getComputedStyle(m);
    const from = { s: { backgroundColor: cs.backgroundColor, backdropFilter: cs.backdropFilter }, t: cm.transform, o: cm.opacity };
    live.current.forEach((a) => a.cancel());
    const k = prefersReducedMotion() ? 0.05 : 1;
    const opts = (ms: number): KeyframeAnimationOptions => ({ duration: ms * k, easing, fill: "forwards" });
    live.current = [
      s.animate([from.s, scrimTo], opts(legs.scrim)),
      m.animate([{ transform: from.t }, { transform: modalTo.transform as string }], opts(legs.move)),
      m.animate([{ opacity: from.o }, { opacity: modalTo.opacity as string }], opts(legs.fade)),
    ];
    return live.current[1]!;
  };

  const open = () => {
    const d = dialog.current;
    if (!d || isOpen.current) return;
    isOpen.current = true;
    if (!d.open) {
      modal.current!.style.transform = `translateY(${ENTER}px)`;
      modal.current!.style.opacity = "0";
      d.showModal();
      closeBtn.current?.focus();
    }
    document.documentElement.style.overflow = "hidden";
    run(
      { backgroundColor: TINT, backdropFilter: BLUR },
      { transform: "translateY(0)", opacity: "1" },
      { scrim: DURATION_MS * 0.6, move: DURATION_MS, fade: DURATION_MS * 0.45 },
      EASE,
    );
  };

  const close = () => {
    if (!isOpen.current) return;
    isOpen.current = false;
    const done = run(
      { backgroundColor: TINT_OFF, backdropFilter: BLUR_OFF },
      { transform: `translateY(${EXIT}px)`, opacity: "0" },
      { scrim: DURATION_MS * 0.4, move: DURATION_MS * 0.4, fade: DURATION_MS * 0.32 },
      EASE_IN_OUT,
    );
    done.finished.then(
      () => {
        if (isOpen.current) return;
        live.current.forEach((a) => a.cancel());
        dialog.current?.close(); // the browser hands focus back to the tile
        document.documentElement.style.overflow = "";
      },
      () => {},
    );
  };

  React.useEffect(
    () => () => {
      document.documentElement.style.overflow = "";
    },
    [],
  );

  return (
    <section className={cn("flex min-h-svh items-center justify-center bg-bg px-5 py-20 text-ink md:px-8", className)}>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={open}
        className="group relative flex w-full max-w-[680px] flex-col-reverse overflow-hidden rounded-xl bg-surface text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus md:min-h-[340px] md:flex-row md:items-stretch"
      >
        <span className="flex flex-1 flex-col justify-between gap-2 p-6">
          <span className="text-sm font-medium text-muted">{label}</span>
          <span className="text-[clamp(18px,1.4vw,28px)] font-medium leading-[1.15] tracking-tight">{title}</span>
        </span>
        <span className="mx-4 mt-20 block h-[200px] overflow-hidden rounded-xl bg-ink md:mx-0 md:mb-6 md:mr-6 md:h-auto md:w-[40%] md:flex-none">
          {image ? (
            <img src={image} alt={alt} decoding="async" className="block size-full object-cover" />
          ) : (
            <span className="block size-full" style={{ background: coverFor(2) }} />
          )}
        </span>
        <span className={cn(roundButton, "group-hover:bg-ink group-hover:text-surface")} aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none" className="size-4 overflow-visible">
            {/* the two corner arrows spread outward on hover */}
            <path className="mo-fd-tr" d="M10 2H14V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path className="mo-fd-bl" d="M6 14H2V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        className="mo-fd-dialog m-0 size-full max-h-none max-w-none overflow-hidden bg-transparent p-0"
      >
        <div ref={scrim} className="fixed inset-0" style={{ backgroundColor: TINT_OFF, backdropFilter: BLUR_OFF }} aria-hidden="true" />
        <div
          ref={modal}
          className="fixed inset-0 flex items-end justify-center px-5 pt-6 md:px-8 md:pt-12"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <section className="relative max-h-[calc(100svh-40px)] w-full overflow-y-auto overflow-x-hidden rounded-t-xl bg-surface text-ink md:max-h-[calc(100svh-64px)] md:w-[min(100%,900px)]">
            <button ref={closeBtn} type="button" aria-label="Close" onClick={close} className={cn(roundButton, "hover:bg-ink hover:text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus")}>
              <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden="true">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="p-[clamp(20px,2.8vw,48px)]">
              <h2 id={titleId} className="m-0 max-w-[16ch] pr-14 text-[clamp(36px,4.2vw,72px)] font-medium leading-[0.98] tracking-[-0.035em]">
                {sheet.title}
              </h2>
              <p className="mb-0 mt-6 max-w-[440px] text-[15px] leading-[1.4] text-muted">{sheet.text}</p>
              <a
                href={sheet.cta.href}
                className="mt-6 inline-flex h-12 items-center rounded-full bg-accent px-[22px] text-[15px] font-medium text-on-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                {sheet.cta.label}
              </a>
              <div className="mt-[clamp(24px,3vw,40px)] grid gap-[clamp(12px,1.4vw,24px)] md:grid-cols-2">
                {sheet.media.map((m, i) => (
                  <Media key={i} {...m} i={i} className="h-[220px] md:h-[320px]" />
                ))}
              </div>
              <dl className="m-0 mt-[clamp(32px,4vw,56px)] grid gap-[clamp(20px,3vw,40px)] border-t border-border pt-[clamp(24px,3vw,40px)] md:grid-cols-3">
                {sheet.stats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse">
                    <dt className="mt-2 text-[13px] font-medium text-muted">{s.label}</dt>
                    <dd className="m-0 text-[clamp(18px,1.4vw,28px)] font-medium leading-none tracking-[-0.035em]">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <Media {...sheet.banner} i={3} className="mt-[clamp(24px,3vw,40px)] h-[220px] md:h-[320px]" />
              <p className="mx-auto mb-3 mt-[clamp(32px,4vw,56px)] max-w-[520px] text-center text-[15px] leading-[1.4] text-muted">{sheet.outro}</p>
            </div>
          </section>
        </div>
      </dialog>
    </section>
  );
}
