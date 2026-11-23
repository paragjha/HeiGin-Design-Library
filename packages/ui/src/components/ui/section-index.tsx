"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./section-index.module.css";

export interface SectionIndexItem {
  /** The id of the section element on the page (the whole section, not only its heading). */
  id: string;
  /** What the index calls the section. */
  label: string;
}

export interface SectionIndexProps {
  /** The sections, in page order. */
  items: SectionIndexItem[];
  /** Accessible name for the navigation. Default "Sections". */
  label?: string;
  /**
   * `fixed` pins the index to the left edge of the window, shows it only while the sections are on
   * screen and hides it below 1024px; move it with the `--section-index-left` CSS variable.
   * `static` leaves it in the flow, always shown. Default `fixed`.
   */
  placement?: "fixed" | "static";
  /** The element that scrolls, when it isn't the window. */
  scrollRoot?: React.RefObject<HTMLElement | null>;
  /** How far down the view, as a fraction of its height, a section's top must pass to become current. Default 0.4. */
  activeLine?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A section index for long pages: a short tick per section, the current one longer and darker,
 * that opens into a card of section names on hover or focus. It follows the scroll, and a click
 * on a name scrolls to that section and moves focus to it.
 */
export function SectionIndex({ items, label = "Sections", placement = "fixed", scrollRoot, activeLine = 0.4, className, style }: SectionIndexProps) {
  const [current, setCurrent] = React.useState(0);
  const [shown, setShown] = React.useState(placement === "static");
  const [open, setOpen] = React.useState(false);
  const root = React.useRef<HTMLElement>(null);
  const ticks = React.useRef<HTMLButtonElement>(null);
  const first = React.useRef<HTMLAnchorElement>(null);
  const dismissed = React.useRef(false); // Escape sends focus back to the ticks without reopening the card

  React.useEffect(() => {
    const scroller = scrollRoot?.current ?? null;
    let raf = 0;
    const update = () => {
      raf = 0;
      const view = scroller ? scroller.getBoundingClientRect() : { top: 0, height: window.innerHeight };
      const rects = items.map((it) => document.getElementById(it.id)?.getBoundingClientRect());
      // The current section is the last one whose top has passed the active line.
      const line = view.top + view.height * activeLine;
      let idx = 0;
      rects.forEach((r, i) => {
        if (r && r.top <= line) idx = i;
      });
      setCurrent(idx);
      if (placement === "fixed") {
        const top = rects[0]?.top ?? Infinity;
        const bottom = rects[rects.length - 1]?.bottom ?? -Infinity;
        setShown(top < view.top + view.height * 0.75 && bottom > view.top + view.height * 0.25);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    const target = scroller ?? window;
    target.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      target.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items, scrollRoot, activeLine, placement]);

  const go = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
    // Focus follows, so the next Tab continues from the section the reader chose.
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
    setOpen(false);
  };

  return (
    <nav
      ref={root}
      aria-label={label}
      className={cn(styles.index, placement === "fixed" && styles.fixed, className)}
      style={style}
      data-shown={shown || undefined}
      data-open={open || undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => {
        if (dismissed.current) dismissed.current = false;
        else setOpen(true);
      }}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || !open) return;
        setOpen(false);
        if (document.activeElement === ticks.current) return;
        dismissed.current = true;
        ticks.current?.focus();
      }}
    >
      <button ref={ticks} type="button" className={styles.ticks} aria-label={`Show ${label.toLowerCase()}`} onClick={() => first.current?.focus()}>
        {items.map((it, i) => (
          <i key={it.id} className={styles.tick} data-current={i === current || undefined} />
        ))}
      </button>
      <ul className={styles.card}>
        {items.map((it, i) => (
          <li key={it.id}>
            <a
              ref={i === 0 ? first : undefined}
              href={`#${it.id}`}
              className={styles.link}
              aria-current={i === current ? "location" : undefined}
              onClick={(e) => go(e, it.id)}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
