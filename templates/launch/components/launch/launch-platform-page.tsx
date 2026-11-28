"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { launchConfig } from "@/lib/launch-config";
import { cn, useInView } from "@/lib/launch-utils";
import { BrandMark } from "@/components/launch/launch-brand";
import { LaunchPanel } from "@/components/launch/launch-panels";

/**
 * A light platform page drawn on hairline grid lines: a large headline, a product tour whose tabs
 * advance on their own, a grid of agents that reveal a line on hover, a feature slider, a
 * testimonial switcher and a closing call to action.
 */
export function LaunchPlatformPage({ className }: { className?: string }) {
  const c = launchConfig.platformPage;
  return (
    <div className={cn("lpl min-h-svh", className)}>
      <a href={c.banner.href} className="lpl-banner block px-5 py-2 text-center text-[13px]">
        {c.banner.text}
        <ArrowRight size={13} aria-hidden="true" className="ml-1.5 inline align-[-2px]" />
      </a>
      <header className="lpl-head sticky top-0 z-30">
        <div className="lpl-frame flex h-14 items-center justify-between gap-6 px-5 md:px-8">
          <div className="flex items-center gap-8">
            <a href={launchConfig.brand.href} className="flex items-center gap-2 text-[15px] font-semibold">
              <BrandMark size={20} />
              {launchConfig.brand.name}
            </a>
            <nav aria-label="Main" className="hidden md:block">
              <ul className="m-0 flex list-none gap-6 p-0 text-[13px]">
                {c.nav.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="lpl-link">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <a href={c.contact.href} className="lpl-btn lpl-btn-line max-sm:hidden">
              {c.contact.label}
            </a>
            <a href={c.cta.href} className="lpl-btn lpl-btn-solid">
              {c.cta.label}
            </a>
          </div>
        </div>
      </header>

      <main className="lpl-frame lpl-rails">
        <Hero />
        <Tour />
        <Agents />
        <Slides />
        <Testimonials />
        <Final />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  const h = launchConfig.platformPage.hero;
  const c = launchConfig.platformPage;
  return (
    <section className="px-5 pb-14 pt-20 md:px-8 md:pt-28">
      <p className="lpl-rise lpl-muted m-0 text-[13px]">{h.eyebrow}</p>
      <h1 className="m-0 mt-4 text-[clamp(40px,5.6vw,76px)] font-medium leading-[1.02] tracking-[-0.035em]">
        {h.title.map((line, i) => (
          <span key={line} className="lpl-mask">
            <span className="lpl-line" style={{ "--d": `${120 + i * 90}ms` } as React.CSSProperties}>
              {line}
            </span>
          </span>
        ))}
      </h1>
      <p className="lpl-rise lpl-muted m-0 mt-5 max-w-[520px] text-[16px] leading-[1.5]" style={{ "--d": "320ms" } as React.CSSProperties}>
        {h.text}
      </p>
      <div className="lpl-rise mt-7 flex flex-wrap gap-2" style={{ "--d": "400ms" } as React.CSSProperties}>
        <a href={c.cta.href} className="lpl-btn lpl-btn-solid">
          {c.cta.label}
        </a>
        <a href={c.contact.href} className="lpl-btn lpl-btn-line">
          {c.contact.label}
        </a>
      </div>
    </section>
  );
}

/**
 * Tabs that advance on their own: the open tab's bar fills over `seconds`, and when it is full the next
 * tab opens. Hovering or focusing the tour pauses it; under reduced motion the bar never runs, so it stays put.
 */
function Tour() {
  const t = launchConfig.platformPage.tour;
  const [open, setOpen] = React.useState(0);
  const [ref, inView] = useInView<HTMLElement>();
  const tab = t.tabs[open]!;
  return (
    <section ref={ref} id="product" className="lpl-tour lpl-line-t" data-run={inView} style={{ "--secs": `${t.seconds}s` } as React.CSSProperties}>
      <div role="tablist" aria-label="Product tour" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {t.tabs.map((x, i) => (
          <button
            key={x.label}
            type="button"
            role="tab"
            id={`lpl-tab-${i}`}
            aria-selected={i === open}
            aria-controls="lpl-tour-panel"
            className="lpl-tab text-left"
            onClick={() => setOpen(i)}
          >
            {i === open && <span key={open} className="lpl-bar" aria-hidden="true" onAnimationEnd={() => setOpen((open + 1) % t.tabs.length)} />}
            <span className="block text-[14px] font-medium">{x.label}</span>
            <span className="lpl-muted mt-1 block text-[13px] leading-[1.4]">{x.text}</span>
          </button>
        ))}
      </div>
      <div id="lpl-tour-panel" role="tabpanel" aria-labelledby={`lpl-tab-${open}`} className="lpl-stage lpl-line-t grid min-h-[420px] place-items-center px-5 py-12">
        <div key={open} className="lpl-enter w-full max-w-[560px]">
          <LaunchPanel kind={tab.ui} active={inView} />
        </div>
      </div>
    </section>
  );
}

function Agents() {
  const a = launchConfig.platformPage.agents;
  return (
    <section id="agents" className="lpl-line-t">
      <div className="grid gap-4 px-5 py-14 md:grid-cols-2 md:px-8">
        <h2 className="m-0 text-[clamp(28px,3vw,40px)] font-medium leading-[1.08] tracking-[-0.03em]">{a.title}</h2>
        <p className="lpl-muted m-0 self-end text-[16px] md:justify-self-end">{a.text}</p>
      </div>
      <ul className="lpl-cells lpl-line-t m-0 grid list-none grid-cols-1 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {a.items.map((agent, i) => (
          <li key={agent.name} className="lpl-agent" tabIndex={0}>
            <span className="lpl-muted text-[12px] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <span className="lpl-agent-name block text-[19px] font-medium tracking-[-0.01em]">{agent.name}</span>
            <span className="lpl-agent-text lpl-muted block text-[14px] leading-[1.45]">{agent.text}</span>
          </li>
        ))}
        <li className="lpl-agent lpl-agent-more">
          <a href={a.more.href} className="inline-flex items-center gap-1.5 text-[15px] font-medium">
            {a.more.label}
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </li>
      </ul>
    </section>
  );
}

/** A row of feature cards that scrolls sideways; the arrows move it one card at a time. */
function Slides() {
  const s = launchConfig.platformPage.slides;
  const track = React.useRef<HTMLUListElement>(null);
  const [ends, setEnds] = React.useState({ start: true, end: false });
  const [ref, inView] = useInView<HTMLElement>();
  const measure = () => {
    const el = track.current;
    if (!el) return;
    setEnds({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  };
  React.useEffect(measure, []);
  const step = (dir: number) => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 12), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  return (
    <section ref={ref} className="lpl-line-t py-14">
      <div className="flex flex-col justify-between gap-6 px-5 md:flex-row md:items-end md:px-8">
        <div>
          <h2 className="m-0 text-[clamp(28px,3vw,40px)] font-medium leading-[1.08] tracking-[-0.03em]">{s.title}</h2>
          <p className="lpl-muted m-0 mt-2 text-[16px]">{s.text}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="lpl-arrow" aria-label="Previous" disabled={ends.start} onClick={() => step(-1)}>
            <ArrowLeft size={15} aria-hidden="true" />
          </button>
          <button type="button" className="lpl-arrow" aria-label="Next" disabled={ends.end} onClick={() => step(1)}>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul ref={track} onScroll={measure} className="lpl-track m-0 mt-8 flex list-none gap-3 overflow-x-auto px-5 pb-2 md:px-8" aria-label={s.title}>
        {s.items.map((item, i) => (
          <li key={item.title} className="lpl-slide shrink-0" aria-label={`${i + 1} of ${s.items.length}`}>
            <div className="lpl-stage grid h-[300px] place-items-center overflow-hidden rounded-[8px] p-6" aria-hidden="true">
              <LaunchPanel kind={item.ui} active={inView} className="max-w-[360px]" />
            </div>
            <h3 className="m-0 mt-4 text-[15px] font-medium">{item.title}</h3>
            <p className="lpl-muted m-0 mt-1 text-[14px] leading-[1.45]">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** One wide quote with the others folded into narrow tabs beside it; picking a tab opens it. */
function Testimonials() {
  const items = launchConfig.platformPage.testimonials.items;
  const [open, setOpen] = React.useState(0);
  return (
    <section className="lpl-line-t px-5 py-14 md:px-8" aria-label="What customers say">
      <div className="flex min-h-[380px] gap-2 max-md:flex-col">
        {items.map((t, i) => (
          <div key={t.company} className="lpl-quote" data-open={i === open}>
            {i === open ? (
              <figure className="lpl-enter m-0 flex h-full flex-col items-center justify-center gap-6 px-6 py-10 text-center">
                <Quote size={22} aria-hidden="true" className="lpl-muted" />
                <figcaption className="lpl-muted text-[13px]">{t.person}</figcaption>
                <blockquote className="m-0 max-w-[30ch] text-[clamp(22px,2.4vw,32px)] font-medium leading-[1.2] tracking-[-0.02em]">{t.quote}</blockquote>
                <p className="m-0 text-[14px] font-medium">{t.company}</p>
              </figure>
            ) : (
              <button type="button" className="lpl-quote-tab" onClick={() => setOpen(i)} aria-label={`Show the quote from ${t.company}`}>
                <span className="lpl-quote-name text-[14px] font-medium">{t.company}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Final() {
  const c = launchConfig.platformPage;
  return (
    <section className="lpl-line-t px-5 py-24 text-center md:px-8">
      <p className="lpl-accent m-0 text-[13px]">{c.final.eyebrow}</p>
      <h2 className="m-0 mx-auto mt-3 max-w-[18ch] text-[clamp(32px,4vw,52px)] font-medium leading-[1.05] tracking-[-0.03em]">{c.final.title}</h2>
      <p className="lpl-muted m-0 mx-auto mt-4 max-w-[460px] text-[15px] leading-[1.5]">{c.final.text}</p>
      <div className="mt-8 flex justify-center gap-2">
        <a href={c.cta.href} className="lpl-btn lpl-btn-solid">
          {c.cta.label}
        </a>
        <a href={c.contact.href} className="lpl-btn lpl-btn-line">
          {c.contact.label}
        </a>
      </div>
    </section>
  );
}

function Footer() {
  const c = launchConfig.platformPage;
  return (
    <footer className="lpl-line-t">
      <div className="lpl-frame grid gap-10 px-5 py-14 sm:grid-cols-[1fr_repeat(3,minmax(0,160px))] md:px-8">
        <BrandMark size={22} />
        {c.footer.map((col) => (
          <div key={col.label}>
            <h3 className="m-0 mb-3 text-[13px] font-medium">{col.label}</h3>
            <ul className="m-0 grid list-none gap-2 p-0 text-[13px]">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="lpl-link lpl-muted">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="lpl-frame lpl-muted my-0 px-5 pb-10 text-[12px] md:px-8">&copy; {c.legal}</p>
    </footer>
  );
}
