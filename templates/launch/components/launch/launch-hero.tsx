"use client";

import * as React from "react";
import { ArrowUp, ArrowUpRight, ChevronDown, Plus } from "lucide-react";
import { launchConfig } from "@/lib/launch-config";
import { cn, fillFor, parseInline, prefersReducedMotion, typingFrame } from "@/lib/launch-utils";
import { BrandMark } from "@/components/launch/launch-brand";

/**
 * A clean hero: a serif headline that mixes roman and italic, two calls to action, and a photo
 * panel whose prompt types itself, clears and types the next one. The photo drifts a little as
 * the panel scrolls by, and a three-column strip of links sits under it.
 */
export function LaunchHero({ className }: { className?: string }) {
  const c = launchConfig.hero;
  const panel = React.useRef<HTMLDivElement>(null);
  const photo = React.useRef<HTMLDivElement>(null);

  // The photo moves slower than the page while the panel crosses the window.
  React.useEffect(() => {
    const el = panel.current;
    const img = photo.current;
    if (!el || !img || prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
      img.style.transform = `translate3d(0, ${(p - 0.5) * -44}px, 0) scale(1.1)`;
    };
    const onScroll = () => (raf ||= requestAnimationFrame(update));
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const lines = c.title.split("\n");

  return (
    <section className={cn("lh", className)}>
      <header className="lh-in mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <a href={launchConfig.brand.href} className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em]">
          <BrandMark size={18} tile={false} />
          {launchConfig.brand.name}
        </a>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="lh-mono m-0 flex list-none gap-7 p-0 text-[11.5px] uppercase">
            {c.nav.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="lh-link inline-flex items-center gap-1">
                  {l.label}
                  {l.menu && <ChevronDown size={12} aria-hidden="true" />}
                  {l.external && <ArrowUpRight size={12} aria-hidden="true" />}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a href={c.signIn.href} className="lh-btn lh-btn-ghost max-sm:hidden">
            {c.signIn.label}
          </a>
          <a href={c.signUp.href} className="lh-btn lh-btn-accent">
            {c.signUp.label}
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 text-center md:px-8">
        <a href={c.announcement.href} className="lh-chip lh-rise mt-[clamp(40px,8vh,88px)]" style={{ animationDelay: "60ms" }}>
          <span className="lh-chip-tag">{c.announcement.tag}</span>
          <span className="truncate">{c.announcement.text}</span>
        </a>

        <h1 className="lh-serif m-0 mt-6 text-[clamp(40px,6vw,74px)] font-normal leading-[1.06] tracking-[-0.02em]">
          {lines.map((line, li) => (
            <span key={li} className="lh-rise block" style={{ animationDelay: `${140 + li * 90}ms` }}>
              {parseInline(line).map((seg, i) => (seg.kind === "italic" ? <em key={i}>{seg.value}</em> : <React.Fragment key={i}>{seg.value}</React.Fragment>))}
            </span>
          ))}
        </h1>

        <p className="lh-rise m-0 mx-auto mt-5 max-w-[460px] whitespace-pre-line text-[15px] leading-[1.55] text-[var(--lh-muted)]" style={{ animationDelay: "320ms" }}>
          {c.subtitle}
        </p>

        <div className="lh-rise mt-7 flex justify-center gap-2" style={{ animationDelay: "400ms" }}>
          <a href={c.demo.href} className="lh-btn lh-btn-ghost">
            {c.demo.label}
          </a>
          <a href={c.signUp.href} className="lh-btn lh-btn-accent">
            {c.signUp.label}
          </a>
        </div>

        <div ref={panel} className="lh-rise relative mt-[clamp(48px,9vh,88px)] overflow-hidden rounded-[3px] aspect-[16/9] max-md:aspect-[4/5]" style={{ animationDelay: "520ms" }}>
          <div ref={photo} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.1)", background: c.image ? undefined : fillFor(1) }}>
            {c.image && <img src={c.image} alt={c.imageAlt} className="size-full object-cover" draggable={false} />}
          </div>
          <Prompt />
        </div>

        <ul className="m-0 grid list-none border border-t-0 border-[var(--lh-line)] bg-white p-0 text-left md:grid-cols-3">
          {c.features.map((f) => (
            <li key={f.title} className="flex flex-col border-[var(--lh-line)] max-md:border-b md:border-r md:last:border-r-0 max-md:last:border-b-0">
              <div className="flex-1 px-4 pb-5 pt-4">
                <h2 className="lh-mono m-0 text-[13px] font-medium">{f.title}</h2>
                <p className="m-0 mt-2 text-[13px] leading-[1.5] text-[var(--lh-muted)]">{f.body}</p>
              </div>
              <a href={f.link.href} className="lh-doc lh-mono flex items-center justify-between border-t border-[var(--lh-line)] px-4 py-2.5 text-[10.5px] uppercase">
                {f.link.label}
                <span className="sr-only"> for {f.title}</span>
                <ArrowUpRight size={13} aria-hidden="true" className="lh-doc-arrow" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The prompt box over the photo. It types each prompt in turn; with reduced motion it shows the first one whole. */
function Prompt() {
  const { prompts } = launchConfig.hero;
  const box = React.useRef<HTMLDivElement>(null);
  const [text, setText] = React.useState("");
  const [still, setStill] = React.useState(false);

  React.useEffect(() => {
    if (prefersReducedMotion()) {
      setStill(true);
      setText(prompts[0] ?? "");
      return;
    }
    let raf = 0;
    let start = 0;
    let paused = 0; // time the loop was put away while off screen, so it resumes where it stopped
    const tick = (now: number) => {
      if (!start) start = now;
      setText(typingFrame(prompts, now - start).text);
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        if (paused) start += performance.now() - paused;
        paused = 0;
        if (!raf) raf = requestAnimationFrame(tick);
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        paused = performance.now();
      }
    });
    if (box.current) io.observe(box.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [prompts]);

  return (
    <div
      ref={box}
      aria-hidden="true"
      className="absolute left-1/2 top-[38%] w-[min(560px,88%)] select-none -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-white p-3 text-left shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)] max-md:top-1/2"
    >
      <p className="m-0 min-h-[2.9em] px-1 text-[13px] leading-[1.45] text-[#27272a]">
        {text}
        {!still && <span className="lh-caret" />}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="grid size-6 place-items-center rounded-md text-[#52525b]">
          <Plus size={15} />
        </span>
        <span className="grid size-6 place-items-center rounded-md bg-[var(--lh-send)] text-white">
          <ArrowUp size={14} strokeWidth={2.4} />
        </span>
      </div>
    </div>
  );
}
