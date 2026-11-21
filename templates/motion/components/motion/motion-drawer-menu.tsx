"use client";

import * as React from "react";
import { HeiGinMark } from "@heigin/ui";
import { motionConfig } from "@/lib/motion-config";
import { cn, coverFor } from "@/lib/motion-utils";

// Opening and closing are separate legs, so every element gets an open delay and a (quicker) close delay.
const PRIMARY_IN_MS = 315; // the menu items start sliding in this far into the open
const EXTRAS_IN_MS = 405; // then the link, cards and footer follow
const STAGGER_MS = 60;
const OUT_STAGGER_MS = 18;
const SUB_IN_MS = 100; // a second panel's links start after its sweep has begun
const SUB_SWAP_MS = 180; // on a swap, the old links leave first
const CLOSE_SUB_MS = 200; // grace period when the pointer leaves the first panel
const PHONE = "(max-width: 767px)";

const pad2 = (n: number) => String(n).padStart(2, "0");
const delays = (open: number, close: number) => ({ "--mo-in": `${open}ms`, "--mo-out": `${close}ms` }) as React.CSSProperties;

/** A menu button that sweeps open a drawer from the left edge; hovering a category opens a second panel beside it
 *  (on phones it slides in over the first, with a back button). */
export function MotionDrawerMenu({ className }: { className?: string }) {
  const { brand, drawer } = motionConfig;
  const { primary, explore, cards, footer } = drawer;
  const [open, setOpen] = React.useState(false);
  const [sub, setSub] = React.useState<number | null>(null); // the category panel 2 shows; null while it is shut
  const [shown, setShown] = React.useState(0); // stays on the last category while panel 2 sweeps shut
  const [swapped, setSwapped] = React.useState(false);
  const overlay = React.useRef<HTMLDivElement>(null);
  const toggle = React.useRef<HTMLButtonElement>(null);
  const p1Nav = React.useRef<HTMLDivElement>(null);
  const p2 = React.useRef<HTMLDivElement>(null);
  const timer = React.useRef(0);
  const panelId = React.useId();

  const openSub = (i: number) => {
    window.clearTimeout(timer.current);
    if (sub === i) return;
    setSwapped(sub !== null);
    setSub(i);
    setShown(i);
  };
  const closeSub = () => {
    window.clearTimeout(timer.current);
    setSub(null);
  };
  const scheduleClose = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSub(null), CLOSE_SUB_MS);
  };
  const close = React.useCallback(() => {
    window.clearTimeout(timer.current);
    setOpen(false);
    setSub(null);
    toggle.current?.focus();
  }, []);

  React.useEffect(() => {
    // set as a property so it works on React 18 too
    if (overlay.current) overlay.current.inert = !open;
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const desktopPointer = (e: React.PointerEvent) => e.pointerType === "mouse" && !window.matchMedia(PHONE).matches;
  // the pointer crossing between the two panels must not shut the second one
  const leave = (e: React.MouseEvent, other: React.RefObject<HTMLElement | null>) => {
    if (open && !window.matchMedia(PHONE).matches && !(e.relatedTarget instanceof Node && other.current?.contains(e.relatedTarget))) scheduleClose();
  };
  const outAt = (k: number) => k * OUT_STAGGER_MS;
  const extraDelays = (j: number) => delays(EXTRAS_IN_MS + j * STAGGER_MS * 0.7, outAt(primary.length + j));

  return (
    <header className={cn("mo-dr", className)} data-open={open}>
      <a href={brand.href} className="mo-dr-logo fixed z-[40] inline-flex items-center gap-2 rounded-sm text-[17px] font-semibold tracking-tight text-ink">
        {brand.logoSrc ? <img src={brand.logoSrc} alt="" width={22} height={22} className="rounded-md object-contain" /> : <HeiGinMark size={22} />}
        {brand.name}
      </a>

      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => (open ? close() : setOpen(true))}
        className="mo-dr-toggle fixed z-[110] inline-flex items-center gap-2.5 rounded-sm text-[15px] font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
      >
        <span className="block h-[1em] w-[3em] overflow-hidden text-left leading-none" aria-hidden="true">
          <span className="mo-dr-track flex flex-col gap-[2px]">
            <span className="block h-[1em]">{drawer.menuLabel}</span>
            <span className="block h-[1em]">{drawer.closeLabel}</span>
          </span>
        </span>
        <span className="relative grid size-4 place-items-center" aria-hidden="true">
          <span className="mo-dr-line mo-dr-line-top absolute h-[1.5px] w-4 rounded-full bg-current" />
          <span className="mo-dr-line mo-dr-line-bottom absolute h-[1.5px] w-4 rounded-full bg-current" />
        </span>
      </button>

      <div ref={overlay} id={panelId} className="fixed inset-0 z-[100]" style={{ pointerEvents: open ? "auto" : "none" }}>
        <div className="mo-dr-scrim absolute inset-0 bg-[rgb(18_18_18/0.55)]" onClick={close} aria-hidden="true" />

        <nav aria-label="Main" className="mo-dr-panel mo-dr-p1 bg-surface text-ink">
          <div className="flex h-full flex-col overflow-hidden p-10">
            <div ref={p1Nav} className="flex flex-col gap-7" onMouseLeave={(e) => leave(e, p2)}>
              <ul className="m-0 flex list-none flex-col p-0">
                {primary.map((p, i) => (
                  <li key={p.label} className="flex items-center justify-between gap-3 border-t border-border py-3.5">
                    <button
                      type="button"
                      aria-expanded={sub === i}
                      aria-controls={`${panelId}-sub`}
                      onPointerEnter={(e) => open && desktopPointer(e) && openSub(i)}
                      onClick={() => openSub(i)}
                      className="mo-dr-link relative inline-flex items-center rounded-sm text-muted hover:text-ink focus-visible:text-ink focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    >
                      <span className="mo-dr-dot absolute left-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-ink" aria-hidden="true" />
                      <span className="mo-dr-in block" style={delays(PRIMARY_IN_MS + i * STAGGER_MS, outAt(i))}>
                        <span className="mo-dr-shift block text-[26px] font-medium leading-[1.05] tracking-[-0.035em] lg:text-[28px]">{p.label}</span>
                      </span>
                    </button>
                    <span className="text-[13px] font-medium tabular-nums text-muted" aria-hidden="true">
                      {pad2(i + 1)}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href={explore.href}
                className="mo-dr-in self-start text-[15px] font-medium text-ink underline underline-offset-4 hover:text-muted"
                style={extraDelays(0)}
              >
                {explore.label}
              </a>
            </div>

            <div className="my-auto flex gap-3">
              {cards.map((c, j) => (
                <a key={c.href} href={c.href} className="mo-dr-in mo-dr-card flex flex-1 flex-col gap-2 rounded-md text-[15px] font-medium text-ink" style={extraDelays(1 + j)}>
                  <span className="block aspect-square overflow-hidden rounded-lg bg-surface-hover">
                    {c.src ? (
                      <img src={c.src} alt={c.alt} className="mo-dr-card-img block size-full object-cover" />
                    ) : (
                      <span className="mo-dr-card-img block size-full" style={{ background: coverFor(j + 1) }} />
                    )}
                  </span>
                  {c.label}
                </a>
              ))}
            </div>

            <div className="flex gap-5">
              {footer.map((f, j) => (
                <a key={f.href} href={f.href} className="mo-dr-in text-[15px] font-medium text-muted hover:text-ink" style={extraDelays(1 + cards.length + j)}>
                  {f.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        <div
          ref={p2}
          id={`${panelId}-sub`}
          className="mo-dr-panel mo-dr-p2 bg-surface text-ink"
          data-on={sub !== null}
          onMouseEnter={() => window.clearTimeout(timer.current)}
          onMouseLeave={(e) => leave(e, p1Nav)}
        >
          <button
            type="button"
            onClick={closeSub}
            className="mo-dr-back absolute left-10 top-6 z-[5] items-center gap-2 rounded-sm py-1 text-[15px] font-medium text-ink"
          >
            <span className="mr-1 inline-block size-2 -rotate-45 border-l-[1.25px] border-t-[1.25px] border-current" aria-hidden="true" />
            Back
          </button>
          <div className="mo-dr-p2-inner flex h-full flex-col overflow-hidden p-10">
            <div className="grid">
              {primary.map((p, i) => {
                const lit = sub === i;
                return (
                  <div key={p.label} className="mo-dr-sublist [grid-area:1/1]" data-on={shown === i} data-lit={lit} aria-hidden={!lit}>
                    <ul className="m-0 flex list-none flex-col p-0">
                      {p.items.map((item, k) => (
                        <li key={item.href} className="flex items-center justify-between gap-3 border-t border-border py-1.5">
                          <a
                            href={item.href}
                            tabIndex={lit ? undefined : -1}
                            className="mo-dr-link mo-dr-link-sub relative inline-flex flex-1 items-center rounded-sm py-1 text-muted hover:text-ink focus-visible:text-ink focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-focus"
                          >
                            <span className="mo-dr-dot absolute left-0 top-1/2 size-[7px] -translate-y-1/2 rounded-full bg-ink" aria-hidden="true" />
                            <span className="mo-dr-sub-in block" style={{ "--mo-in": `${(swapped ? SUB_SWAP_MS : SUB_IN_MS) + k * STAGGER_MS}ms` } as React.CSSProperties}>
                              <span className="mo-dr-shift block text-lg font-medium leading-[1.2] tracking-tight lg:text-xl">{item.label}</span>
                            </span>
                          </a>
                          <span className="text-[13px] font-medium tabular-nums text-muted" aria-hidden="true">
                            {pad2(k + 1)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={p.href}
                      tabIndex={lit ? undefined : -1}
                      className="mt-6 inline-block text-[15px] font-medium text-ink underline underline-offset-4 hover:text-muted"
                    >
                      {explore.label}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
