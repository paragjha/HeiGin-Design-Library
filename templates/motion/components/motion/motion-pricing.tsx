"use client";

import * as React from "react";
import { Badge, VisuallyHidden } from "@heigin/ui";
import { motionConfig } from "@/lib/motion-config";
import { cn, EASE_IN_OUT, EXPO_OUT, POWER2_IN_OUT, POWER2_OUT, odometerColumns, prefersReducedMotion, type OdometerColumn } from "@/lib/motion-utils";

const TOGGLE_MS = 280; // knob travel
const DIGIT_STAGGER_MS = 40; // between digit columns, from the right
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Digit({ col, order }: { col: OdometerColumn; order: number }) {
  const box = React.useRef<HTMLSpanElement>(null);
  const strip = React.useRef<HTMLSpanElement>(null);
  // A column the price gains grows in from zero width and rolls up from 0.
  React.useLayoutEffect(() => {
    if (!col.fresh || prefersReducedMotion()) return;
    const grow = box.current?.animate([{ width: "0em" }, { width: "0.62em" }], { duration: 450, easing: EXPO_OUT });
    const roll = strip.current?.animate([{ transform: "translateY(0em)" }, { transform: `translateY(${-col.digit}em)` }], {
      duration: 450,
      delay: order * DIGIT_STAGGER_MS,
      easing: EXPO_OUT,
      fill: "backwards",
    });
    return () => {
      grow?.cancel();
      roll?.cancel();
    };
    // mount only: later digit changes roll through the CSS transition
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <span ref={box} className="mo-digit" style={col.dropping ? { width: 0 } : undefined}>
      <span ref={strip} className="mo-digit-strip" style={{ transform: `translateY(${-col.digit}em)`, transitionDelay: `${order * DIGIT_STAGGER_MS}ms` }}>
        {DIGITS.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </span>
    </span>
  );
}

/** A price as one rolling column per digit. */
function Odometer({ value }: { value: number }) {
  const [cols, setCols] = React.useState(() => odometerColumns(value, []).map((c) => ({ ...c, fresh: false })));
  const first = React.useRef(true);
  React.useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setCols((prev) => odometerColumns(value, prev));
  }, [value]);
  React.useEffect(() => {
    if (!cols.some((c) => c.dropping)) return;
    const t = window.setTimeout(() => setCols((prev) => prev.filter((c) => !c.dropping)), 315);
    return () => window.clearTimeout(t);
  }, [cols]);
  return (
    <span className="inline-flex items-baseline" aria-hidden="true">
      {cols.map((c, i) => (
        <Digit key={c.id} col={c} order={cols.length - 1 - i} />
      ))}
    </span>
  );
}

/** Two faces in a 1em mask: "/mo" rolls up and out as "/yr" rolls in. */
function Swap({ a, b, on }: { a: string; b: string; on: boolean }) {
  return (
    <span className="mo-swap" aria-hidden="true">
      <span className="mo-swap-track" style={{ transform: on ? "translateY(-1em)" : undefined }}>
        <span>{a}</span>
        <span>{b}</span>
      </span>
    </span>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="mt-0.5 shrink-0">
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Plan cards with a monthly/yearly switch: each price rolls to its new number digit by digit. */
export function MotionPricing({ className }: { className?: string }) {
  const p = motionConfig.pricing;
  const [period, setPeriod] = React.useState(p.defaultPeriod);
  const yearly = period === "yearly";
  const knob = React.useRef<HTMLSpanElement>(null);
  const headingId = React.useId();

  const toggle = () => {
    const toYearly = !yearly;
    setPeriod(toYearly ? "yearly" : "monthly");
    const k = knob.current;
    if (!k || prefersReducedMotion()) return;
    // The knob smears along its travel: it stretches from its trailing edge, then snaps back to shape.
    k.style.transformOrigin = toYearly ? "left center" : "right center";
    k.animate(
      [
        { scale: "1 1", easing: POWER2_OUT },
        { scale: "1.18 1", offset: 0.4375, easing: POWER2_IN_OUT },
        { scale: "1 1" },
      ],
      { duration: TOGGLE_MS * 0.8 },
    );
  };

  return (
    <section aria-labelledby={headingId} className={cn("bg-bg px-5 py-24 text-ink", className)}>
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm font-medium text-muted">{p.eyebrow}</p>
          <h2 id={headingId} className="mt-2 text-[clamp(28px,4vw,44px)] font-semibold leading-tight tracking-tight">
            {p.title}
          </h2>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="relative inline-flex">
            <button
              type="button"
              role="switch"
              aria-checked={yearly}
              aria-label="Billing period"
              onClick={toggle}
              className="relative grid grid-cols-2 rounded-full bg-surface-hover p-[3px] text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <span
                ref={knob}
                aria-hidden="true"
                className="absolute bottom-[3px] left-[3px] top-[3px] w-[calc(50%-3px)] rounded-full bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_rgb(0_0_0/0.04)] motion-safe:transition-[translate]"
                style={{ translate: yearly ? "100% 0" : "0 0", transitionDuration: `${TOGGLE_MS}ms`, transitionTimingFunction: EASE_IN_OUT }}
              />
              <span className={cn("relative px-4 py-1.5 transition-colors", yearly ? "text-muted" : "text-ink")}>{p.monthlyLabel}</span>
              <span className={cn("relative px-4 py-1.5 transition-colors", yearly ? "text-ink" : "text-muted")}>{p.yearlyLabel}</span>
            </button>
            <span className="mo-chip absolute left-full top-1/2 ml-3 -translate-y-1/2" data-on={yearly} aria-hidden={!yearly}>
              <Badge tone="success">{p.savingsLabel}</Badge>
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {p.plans.map((plan, i) => {
            const value = yearly ? plan.yearly : plan.monthly;
            return (
              <article
                key={plan.name}
                className={cn(
                  "flex flex-col rounded-xl border p-6",
                  plan.popular ? "mo-plan-popular border-transparent bg-accent text-on-accent" : "border-border bg-surface shadow-card",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* each card starts a third of a sweep apart, so the three never shimmer in unison */}
                  <h3 className="mo-shimmer text-lg font-semibold tracking-tight" style={{ animationDelay: `${(-i / 3) * 2.4}s` }}>
                    {plan.name}
                  </h3>
                  {plan.popular && <Badge>Popular</Badge>}
                </div>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className={cn("text-sm", plan.popular ? "text-on-accent/70" : "text-muted")} aria-hidden="true">
                    {p.currency}
                  </span>
                  <span className="text-5xl font-semibold leading-none tracking-tight tabular-nums">
                    <Odometer value={value} />
                  </span>
                  <span className={cn("text-sm", plan.popular ? "text-on-accent/70" : "text-muted")}>
                    <Swap a="/mo" b="/yr" on={yearly} />
                  </span>
                  <VisuallyHidden>{`${p.currency}${value} per ${yearly ? "year" : "month"}`}</VisuallyHidden>
                </p>
                <ul className={cn("mt-6 space-y-2.5 text-sm", plan.popular ? "text-on-accent/85" : "text-ink-soft")}>
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.cta.href}
                  className={cn(
                    "mt-8 inline-flex h-10 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                    plan.popular ? "bg-surface text-ink hover:bg-surface-hover" : "bg-accent text-on-accent hover:bg-accent-hover",
                  )}
                >
                  {plan.cta.label}
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
