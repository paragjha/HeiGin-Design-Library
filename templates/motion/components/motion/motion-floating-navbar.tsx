"use client";

import * as React from "react";
import { HeiGinMark } from "@heigin/ui";
import { motionConfig } from "@/lib/motion-config";
import { cn } from "@/lib/motion-utils";

const BAR_H = 72;
const HYSTERESIS = 24; // it opens again this far above the threshold, so jitter never flickers it
const PILL_PAD = 6; // around the CTA inside the pill
const MARK_INSET = 22; // from the pill's left edge to the mark
const BG_EXTRA = 32; // the background layer runs below the bar so the pill can sit lower

type Geo = { dx: number[]; dy: number; folded: string; open: string };

/** A header that sits wide open over the hero and folds into a small floating pill once the page scrolls. */
export function MotionFloatingNavbar({ className }: { className?: string }) {
  const { links, cta, threshold, offset } = motionConfig.navbar;
  const brand = motionConfig.brand;
  const header = React.useRef<HTMLElement>(null);
  const items = React.useRef<(HTMLElement | null)[]>([]);
  const [geo, setGeo] = React.useState<Geo | null>(null);
  const [docked, setDocked] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const last = links.length + 1; // index of the CTA: logo first, links, CTA last

  // Reads the open layout, then the folded one (one synchronous class swap, never painted),
  // and turns the difference into translate deltas plus the pill's clip shape.
  const measure = React.useCallback(() => {
    const h = header.current;
    const els = items.current;
    if (!h || els.some((e) => !e)) return;
    h.classList.add("mo-nav-flat");
    const width = h.getBoundingClientRect().width;
    const tops = els.map((e) => e!.getBoundingClientRect().left);
    h.classList.add("mo-nav-measure");
    const docks = els.map((e) => e!.getBoundingClientRect());
    const ctaH = els[last]!.offsetHeight;
    h.classList.remove("mo-nav-measure", "mo-nav-flat");
    const rowLeft = docks[0]!.left;
    const pillW = docks[last]!.right - rowLeft + MARK_INSET + PILL_PAD;
    const pillH = ctaH + PILL_PAD * 2;
    const pillX = (width - pillW) / 2;
    const shift = pillX + MARK_INSET - rowLeft;
    const bgH = BAR_H + BG_EXTRA;
    setGeo({
      dx: els.map((e, i) => (e!.getClientRects().length ? docks[i]!.left + shift - tops[i]! : 0)),
      dy: offset + pillH / 2 - BAR_H / 2,
      open: `inset(0px 0px ${bgH - BAR_H}px 0px round 0px)`,
      folded: `inset(${offset}px ${pillX}px ${Math.max(0, bgH - offset - pillH)}px ${pillX}px round ${pillH / 2}px)`,
    });
  }, [last, offset]);

  React.useEffect(() => {
    measure();
    let lastWidth = header.current?.getBoundingClientRect().width ?? 0;
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const w = header.current?.getBoundingClientRect().width ?? 0;
        if (w === lastWidth) return; // height-only resizes (mobile URL bar) leave the geometry alone
        lastWidth = w;
        measure();
      }, 150);
    };
    const onScroll = () => {
      const y = window.scrollY;
      setDocked((d) => (d ? y >= threshold - HYSTERESIS : y >= threshold));
    };
    onScroll();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.fonts?.ready.then(measure);
    // the first state applies without animating into it
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [measure, threshold]);

  const on = docked && !!geo;
  const move = (i: number) => ({ translate: on ? `${geo!.dx[i]}px 0` : "0 0" });

  return (
    <header
      ref={header}
      data-docked={on}
      className={cn("fixed inset-x-0 top-0 z-50", !ready && "[&_*]:transition-none!", className)}
      style={{ height: BAR_H }}
    >
      <div
        aria-hidden="true"
        className="mo-nav-bg"
        style={{
          height: BAR_H + BG_EXTRA,
          clipPath: geo ? (on ? geo.folded : geo.open) : undefined,
          backgroundColor: on ? "rgb(31 31 31 / 0.84)" : "rgb(31 31 31 / 0)",
          backdropFilter: on ? "blur(14px) saturate(1.6)" : "blur(0px) saturate(1)",
        }}
      />
      <nav
        aria-label="Main"
        className="mo-nav-row mo-nav-lift relative grid h-full grid-cols-[1fr_auto_1fr] items-center px-[clamp(20px,2.8vw,48px)]"
        style={{ translate: on ? `0 ${geo!.dy}px` : "0 0" }}
      >
        <a
          ref={(node) => {
            items.current[0] = node;
          }}
          href={brand.href}
          aria-label={brand.name}
          className={cn("mo-nav-logo mo-nav-move inline-flex items-center gap-2 justify-self-start rounded-sm text-[17px] font-semibold tracking-tight", on ? "text-on-accent" : "text-ink")}
          style={move(0)}
        >
          {brand.logoSrc ? <img src={brand.logoSrc} alt="" width={22} height={22} className="rounded-md object-contain" /> : <HeiGinMark size={22} />}
          {/* the name folds away behind the mark as the bar becomes a pill */}
          <span className="mo-nav-tail" aria-hidden="true">
            <span style={{ translate: on ? "-100% 0" : "0 0", opacity: on ? 0 : 1 }}>{brand.name}</span>
          </span>
        </a>

        <ul className="mo-nav-links m-0 hidden list-none items-center gap-8 p-0 md:flex">
          {links.map((l, i) => (
            <li key={l.href}>
              <a
                ref={(node) => {
                  items.current[i + 1] = node;
                }}
                href={l.href}
                className={cn("mo-nav-move inline-block rounded-sm py-1.5 text-sm font-medium", on ? "text-on-accent/85 hover:text-on-accent" : "text-ink-soft hover:text-ink")}
                style={move(i + 1)}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          ref={(node) => {
            items.current[last] = node;
          }}
          href={cta.href}
          className={cn(
            "mo-nav-move inline-flex h-9 items-center justify-self-end rounded-full px-4 text-sm font-medium",
            on ? "bg-surface text-ink" : "bg-accent text-on-accent",
          )}
          style={move(last)}
        >
          {cta.label}
        </a>
      </nav>
    </header>
  );
}
