"use client";

import * as React from "react";
import { motionConfig } from "@/lib/motion-config";
import { clamp01, cn, fitFontSize, prefersReducedMotion } from "@/lib/motion-utils";

const MEASURE_PX = 100;

/** A footer with a soft glow rising off its bottom edge and a giant brand name that scales to fill the width. */
export function MotionGradientFooter({ className }: { className?: string }) {
  const cfg = motionConfig.footer;
  const root = React.useRef<HTMLElement>(null);
  const box = React.useRef<HTMLDivElement>(null);
  const word = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);
  const chars = Array.from(cfg.wordmark);

  React.useEffect(() => {
    const el = root.current;
    const b = box.current;
    const w = word.current;
    if (!el || !b || !w) return;
    // measure the word at a known size, then scale it so it sits edge to edge, whatever the name
    const fit = () => {
      w.style.fontSize = `${MEASURE_PX}px`;
      w.style.fontSize = `${fitFontSize(b.clientWidth, w.scrollWidth, MEASURE_PX)}px`;
      w.style.visibility = "visible";
    };
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mo-gf-scroll", String(clamp01(1 - r.top / window.innerHeight)));
    };
    fit();
    onScroll();
    void document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    window.addEventListener("scroll", onScroll, { passive: true });
    let io: IntersectionObserver | undefined;
    if (prefersReducedMotion()) setShown(true);
    else {
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          setShown(true);
          io?.disconnect();
        },
        { rootMargin: "0px 0px -15% 0px" },
      );
      io.observe(el);
    }
    return () => {
      ro.disconnect();
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [cfg.wordmark]);

  return (
    <footer
      ref={root}
      className={cn("mo-gf mo-dark bg-bg text-ink", className)}
      data-shown={shown}
      style={{ "--mo-gf-glow": cfg.glow, "--mo-gf-arch": `${cfg.arch}%` } as React.CSSProperties}
    >
      <div className="mo-gf-glow" aria-hidden="true" />
      <div className="mo-gf-inner">
        <nav className="mo-gf-cols" aria-label="Footer">
          {cfg.columns.map((col, i) => (
            <div key={col.label} className="mo-gf-in" style={{ "--i": i } as React.CSSProperties}>
              <h3 className="m-0 mb-[22px] text-sm font-medium text-muted">{col.label}</h3>
              <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="mo-gf-link text-sm text-ink">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="mo-gf-legal mo-gf-in text-sm text-muted" style={{ "--i": cfg.columns.length } as React.CSSProperties}>
          <span className="inline-flex flex-wrap items-center gap-[22px]">
            <span>&copy; {cfg.copyright}</span>
            {cfg.legal.map((link) => (
              <a key={link.label} href={link.href} className="text-inherit no-underline transition-colors hover:text-ink">
                {link.label}
              </a>
            ))}
          </span>
          <a href="#top" className="inline-flex items-center gap-[7px] text-inherit no-underline transition-colors hover:text-ink">
            {cfg.backToTop}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path d="M6.5 10.5V2.5M6.5 2.5L3 6M6.5 2.5L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
        <div ref={box} className="mo-gf-wordmark">
          <div ref={word} className="mo-gf-word" role="img" aria-label={cfg.wordmark}>
            {chars.map((c, i) => (
              <span key={i} className="mo-gf-char" aria-hidden="true" style={{ "--i": i } as React.CSSProperties}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mo-gf-grain" aria-hidden="true" />
    </footer>
  );
}
