"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/landing-utils";

/**
 * Fades and rises children into view once, as they scroll into the viewport.
 *
 * Progressive enhancement: the server and the first client render show the content as normal.
 * Only after hydration are elements that sit below the fold armed (hidden), then revealed when
 * they approach the viewport. Content already on screen is never hidden, so there is no flash,
 * and visitors without JavaScript, crawlers and print all get the full page.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Already in (or above) the viewport on load: leave it visible, no animation.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setArmed(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(armed && "reveal", shown && "is-visible", className)}
    >
      {children}
    </div>
  );
}
