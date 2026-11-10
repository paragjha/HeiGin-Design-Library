"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@heigin/ui";
import { landingConfig, trackCta, type LandingConfig, type NavGroup, type NavItem } from "@/lib/landing-config";
import { cn } from "@/lib/landing-utils";
import { Backdrop } from "./backdrop";
import { Brand, BrandMark } from "./brand";

function isGroup(item: NavGroup | NavItem): item is NavGroup {
  return "items" in item;
}

function panelWidth(group: NavGroup): number {
  if (group.feature) return 560;
  if (group.items.length > 1) return 420;
  return 260;
}

/**
 * Desktop nav with one dropdown container that morphs between groups instead
 * of unmounting and remounting, so sliding from one trigger to the next
 * changes width, position and content in place.
 *
 * A short grace timeout on mouseleave lets the pointer travel from a trigger
 * into the panel without it snapping shut.
 */
function DesktopNav({ nav }: { nav: (NavGroup | NavItem)[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const rowRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [panelLeft, setPanelLeft] = useState(0);

  // Read layout synchronously so the first frame of the transition does not flash at the old position.
  useLayoutEffect(() => {
    if (openIndex === null) return;
    const trigger = triggerRefs.current[openIndex];
    const row = rowRef.current;
    if (!trigger || !row) return;
    setPanelLeft(trigger.getBoundingClientRect().left - row.getBoundingClientRect().left);
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenIndex(null);
        triggerRefs.current[openIndex]?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openIndex]);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenIndex(null), 140);
  };

  const openItem = openIndex !== null ? nav[openIndex] : undefined;
  const openGroup = openItem && isGroup(openItem) ? openItem : null;

  return (
    <div ref={rowRef} className="relative hidden lg:block" onMouseLeave={scheduleClose} onMouseEnter={cancelClose}>
      <nav aria-label="Primary" className="flex items-center gap-0.5">
        {nav.map((item, i) =>
          isGroup(item) ? (
            <button
              key={item.label}
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
              type="button"
              aria-expanded={openIndex === i}
              aria-haspopup="true"
              onMouseEnter={() => {
                cancelClose();
                setOpenIndex(i);
              }}
              onFocus={() => {
                cancelClose();
                setOpenIndex(i);
              }}
              onClick={() => setOpenIndex((v) => (v === i ? null : i))}
              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-nav font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
              <ChevronDown
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className={cn("transition-transform", openIndex === i && "rotate-180")}
              />
            </button>
          ) : (
            <a
              key={item.label}
              href={item.href}
              onMouseEnter={() => setOpenIndex(null)}
              className="rounded-md px-3 py-1.5 text-nav font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </a>
          )
        )}
      </nav>

      <AnimatePresence>
        {openGroup && (
          <motion.div
            key="nav-panel"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0, x: panelLeft, width: panelWidth(openGroup) }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.14 } }}
            transition={{ type: "spring", stiffness: 420, damping: 36, mass: 0.6 }}
            className="absolute left-0 top-full z-40 pt-2"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <motion.div
              layout="size"
              transition={{ type: "spring", stiffness: 420, damping: 36, mass: 0.6 }}
              className="overflow-hidden rounded-xl border border-border bg-popover p-2 shadow-[var(--hg-shadow-popover)]"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={openIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4, position: "absolute" }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <NavPanel group={openGroup} onClose={() => setOpenIndex(null)} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavPanel({ group, onClose }: { group: NavGroup; onClose: () => void }) {
  const feature = group.feature;
  return (
    <div
      className={cn(
        "grid gap-2",
        feature ? "grid-cols-[0.95fr_1fr]" : group.items.length > 1 ? "grid-cols-2" : "grid-cols-1"
      )}
    >
      {feature && (
        <a
          href={feature.href}
          onClick={onClose}
          className="group/feature relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-md p-5 text-background no-underline"
        >
          <Backdrop />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-foreground/70 via-foreground/55 to-foreground/75"
          />
          <div className="relative flex items-center gap-2">
            <BrandMark className="size-6" />
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-background/80">{feature.eyebrow}</span>
          </div>
          <div className="relative">
            <p className="text-lg font-semibold leading-snug text-background">{feature.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-background/80">{feature.body}</p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-background">
              {feature.cta}
              <ArrowRight
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
                className="transition-transform group-hover/feature:translate-x-0.5"
              />
            </p>
          </div>
        </a>
      )}
      <ul className={cn("flex flex-col gap-1", feature && "self-stretch")}>
        {group.items.map((item) => (
          <li key={item.label} className="flex">
            <a
              href={item.href}
              onClick={onClose}
              className="group/nav-item flex w-full flex-col justify-center rounded-md px-3 py-2.5 transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-1.5 text-md font-medium text-foreground">
                {item.label}
                <ArrowRight
                  size={12}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="opacity-0 transition-all group-hover/nav-item:translate-x-0.5 group-hover/nav-item:opacity-70"
                />
              </span>
              {item.description && (
                <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{item.description}</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Sticky header: brand, morphing dropdown nav, sign-in and primary action, with a mobile sheet. */
export function SiteHeader({ content = landingConfig.header }: { content?: LandingConfig["header"] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { name, homeHref } = landingConfig.brand;

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container-site flex h-14 items-center justify-between gap-4">
        <a href={homeHref} aria-label={`${name} home`} className="shrink-0">
          <Brand />
        </a>

        <DesktopNav nav={content.nav} />

        <div className="hidden items-center gap-2 lg:flex">
          {content.signIn && (
            <a href={content.signIn.href}>
              <Button variant="ghost" size="sm">
                {content.signIn.label}
              </Button>
            </a>
          )}
          <a href={content.cta.href} onClick={() => trackCta("header")}>
            <Button variant="primary" size="sm">
              {content.cta.label}
            </Button>
          </a>
        </div>

        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={20} strokeWidth={1.8} /> : <Menu size={20} strokeWidth={1.8} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav aria-label="Mobile" className="container-site max-h-[calc(100dvh-3.5rem)] overflow-y-auto py-4">
            {content.nav.map((item) =>
              isGroup(item) ? (
                <div key={item.label} className="py-2">
                  <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-faint">{item.label}</p>
                  {item.items.map((child) => (
                    <a
                      key={child.label}
                      href={child.href}
                      onClick={closeMobile}
                      className="block rounded-md px-3 py-2.5 text-lg font-medium text-foreground hover:bg-accent"
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeMobile}
                  className="block rounded-md px-3 py-2.5 text-lg font-medium text-foreground hover:bg-accent"
                >
                  {item.label}
                </a>
              )
            )}
            <div className="mt-3 border-t border-border pt-4">
              <a href={content.cta.href} onClick={() => trackCta("header-mobile")}>
                <Button variant="primary" fullWidth>
                  {content.cta.label}
                </Button>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
