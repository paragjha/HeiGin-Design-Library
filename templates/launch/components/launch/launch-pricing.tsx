"use client";

import * as React from "react";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { Switch } from "@heigin/ui";
import { launchConfig } from "@/lib/launch-config";
import { cn, fillFor, parseInline, pricingTotals } from "@/lib/launch-utils";
import { BrandMark } from "@/components/launch/launch-brand";

/**
 * A single-plan pricing page: a light headline, then one card whose add-on switches change the
 * price (struck list price beside the discounted one) over a pile of 3D icons that grows as add-ons
 * turn on, then a question list. Icons and numbers settle without motion under reduced motion.
 */
export function LaunchPricing({ className }: { className?: string }) {
  const c = launchConfig.pricing;
  const [on, setOn] = React.useState<ReadonlySet<string>>(() => new Set());
  const { list, now } = pricingTotals(c.base, c.addOns, on, c.discount);
  const toggle = (id: string, value: boolean) =>
    setOn((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <div className={cn("lp min-h-svh", className)}>
      <header className="lp-head">
        <div className="mx-auto flex h-[52px] max-w-[900px] items-center justify-between gap-6 px-5">
          <a href={launchConfig.brand.href} className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
            <BrandMark size={20} />
            {launchConfig.brand.name}
          </a>
          <nav aria-label="Main" className="hidden flex-1 md:block">
            <ul className="m-0 flex list-none justify-around p-0 text-[14px]">
              {c.nav.map((l) => (
                <li key={l.href}>
                  <a href={l.href} aria-current={l.current ? "page" : undefined} className="lp-link inline-flex items-center gap-0.5">
                    {l.label}
                    {l.external && <ArrowUpRight size={11} aria-hidden="true" />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href={c.cta.href} className="lp-link lp-cta inline-flex items-center gap-2 text-[14px] font-medium">
            {c.cta.label}
            <span className="grid size-[18px] place-items-center rounded-full bg-[var(--lp-ink)] text-white">
              <ArrowRight size={11} strokeWidth={2.6} aria-hidden="true" />
            </span>
          </a>
        </div>
      </header>

      <main className="px-5 pb-28">
        <div className="mx-auto max-w-[620px] pt-[clamp(56px,12vh,104px)] text-center">
          <h1 className="lp-title lp-rise m-0 whitespace-pre-line text-[clamp(44px,6.2vw,78px)] font-light leading-[0.98] tracking-[-0.045em]">{c.title}</h1>
          <p className="lp-rise lp-soft m-0 mx-auto mt-9 max-w-[390px] text-balance text-[15.5px] leading-[1.45]" style={{ animationDelay: "80ms" }}>
            {parseInline(c.intro).map((s, i) =>
              s.kind === "bold" ? (
                <strong key={i} className="font-medium text-[var(--lp-ink)]">
                  {s.value}
                </strong>
              ) : (
                <React.Fragment key={i}>{s.value}</React.Fragment>
              ),
            )}
          </p>
        </div>

        <div className="lp-stage relative mx-auto mt-[clamp(48px,6vw,80px)] w-full max-w-[760px] px-[clamp(0px,9vw,150px)] py-[clamp(60px,10vw,96px)]">
          <Pile on={on} />
          <section aria-labelledby="lp-plan" className="lp-card lp-rise relative z-10 mx-auto max-w-[348px] p-8 pb-6" style={{ animationDelay: "160ms" }}>
            <h2 id="lp-plan" className="sr-only">
              Plan price
            </h2>
            <p className="m-0 flex flex-wrap items-baseline gap-x-2.5" aria-live="polite">
              {c.discount > 0 && (
                <s className="lp-was">
                  <span className="sr-only">Was </span>
                  <Roll value={list} prefix={c.currency} />
                </s>
              )}
              <span className="lp-now">
                {c.discount > 0 && <span className="sr-only">now </span>}
                <Roll value={now} prefix={c.currency} />
              </span>
              <span className="text-[14px]">{c.period}</span>
            </p>
            <hr className="lp-rule my-5 border-0" />
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {c.addOns.map((a) => (
                <li key={a.id}>
                  <Switch label={a.label} checked={on.has(a.id)} onCheckedChange={(v) => toggle(a.id, v)} className="lp-switch" />
                </li>
              ))}
            </ul>
            <a href={c.button.href} className="lp-button mt-7 flex h-[38px] items-center justify-center rounded-full text-[14px] font-medium">
              {c.button.label}
            </a>
            <p className="lp-soft m-0 mt-6 text-[11.5px] leading-[1.45]">{c.footnote}</p>
          </section>
        </div>

        <section aria-labelledby="lp-faq" className="mx-auto mt-[clamp(48px,8vw,96px)] max-w-[880px]">
          <h2 id="lp-faq" className="sr-only">
            {c.faqTitle}
          </h2>
          {c.faq.map((f) => (
            <details key={f.q} className="lp-faq group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-[22px] text-[15px] [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus size={16} strokeWidth={1.6} aria-hidden="true" className="lp-plus shrink-0" />
              </summary>
              <p className="lp-soft m-0 max-w-[640px] pb-6 text-[14.5px] leading-[1.55]">{f.a}</p>
            </details>
          ))}
        </section>
      </main>
    </div>
  );
}

const STRIP = Array.from("0123456789");

/** A number whose digits scroll to their new value, right-aligned so the ones column stays put; columns that join roll up from 0. */
function Roll({ value, prefix }: { value: number; prefix: string }) {
  const digits = Array.from(String(value));
  return (
    <>
      <span className="sr-only">
        {prefix}
        {value}
      </span>
      <span aria-hidden="true" className="lp-roll">
        {prefix}
        {digits.map((d, i) => (
          <Digit key={digits.length - i} digit={Number(d)} place={digits.length - 1 - i} />
        ))}
      </span>
    </>
  );
}

function Digit({ digit, place }: { digit: number; place: number }) {
  const [shown, setShown] = React.useState(0);
  // set after the first paint, so a new column scrolls up from 0 rather than appearing on its digit
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setShown(digit));
    return () => cancelAnimationFrame(id);
  }, [digit]);
  return (
    <span className="lp-digit">
      <span className="lp-strip" style={{ translate: `0 ${-shown * 10}%`, transitionDelay: `${place * 40}ms` }}>
        {STRIP.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </span>
    </span>
  );
}

/** The 3D icons behind the card. An add-on's icons fly out from behind it while it is on; the rest swell a little with each one. */
function Pile({ on }: { on: ReadonlySet<string> }) {
  const { icons } = launchConfig.pricing;
  return (
    <div aria-hidden="true" className="lp-pile pointer-events-none absolute inset-0" style={{ "--lp-grow": 1 + on.size * 0.05 } as React.CSSProperties}>
      {icons.map((icon, i) => {
        const shown = !icon.addOn || on.has(icon.addOn);
        return (
          <span
            key={i}
            className="lp-icon absolute block"
            style={
              {
                left: `${icon.x}%`,
                top: `${icon.y}%`,
                width: `calc(${icon.size}px * var(--lp-scale))`,
                rotate: `${icon.rotate}deg`,
                animationDelay: `${120 + i * 35}ms`,
                // hidden add-on icons wait behind the card, nearer its centre
                "--lp-dx": `${(50 - icon.x) * 2.2}px`,
                "--lp-dy": `${(50 - icon.y) * 2.2}px`,
              } as React.CSSProperties
            }
          >
            <span className={cn("lp-icon-body block aspect-square", icon.addOn ? "lp-extra" : "lp-base")} data-shown={shown}>
              {icon.src ? (
                <img src={icon.src} alt="" className="block size-full object-contain" draggable={false} />
              ) : (
                <span className="block size-full rounded-[28%]" style={{ background: fillFor(i) }} />
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
}
