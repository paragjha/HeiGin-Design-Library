"use client";

import * as React from "react";
import { motionConfig } from "@/lib/motion-config";
import { cn, prefersReducedMotion } from "@/lib/motion-utils";

/** A statement that rises into place line by line, each line out of its own mask, the first time it scrolls into view. */
export function MotionTextReveal({ className }: { className?: string }) {
  const { segments } = motionConfig.textReveal;
  const text = React.useRef<HTMLParagraphElement>(null);
  const [shown, setShown] = React.useState(false);
  const words = segments.flatMap((s) =>
    s.text
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => ({ w, strong: !!s.strong })),
  );

  React.useEffect(() => {
    const el = text.current;
    if (!el) return;
    // Every word carries its line number, so the words on one line rise together like one masked line.
    const lineUp = () => {
      let top = -Infinity;
      let line = -1;
      for (const w of Array.from(el.children) as HTMLElement[]) {
        if (w.offsetTop > top + 1) {
          top = w.offsetTop;
          line++;
        }
        w.style.setProperty("--mo-line", String(line));
      }
    };
    lineUp();
    void document.fonts?.ready.then(lineUp);
    const ro = new ResizeObserver(lineUp);
    ro.observe(el);
    if (prefersReducedMotion()) {
      setShown(true);
      return () => ro.disconnect();
    }
    // plays once, when the top of the text reaches 80% of the window
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <section className={cn("bg-bg text-ink", className)}>
      <div className="mx-auto grid min-h-svh w-full max-w-6xl content-center px-5 py-24 md:px-8">
        <p
          ref={text}
          data-shown={shown}
          className="mo-tr m-0 text-[clamp(32px,3.4vw,60px)] font-medium leading-[1.05] tracking-[-0.035em] text-muted md:w-3/4"
        >
          {words.map((x, i) => (
            <React.Fragment key={i}>
              {i > 0 && " "}
              <span className="mo-tr-word">
                <span className={x.strong ? "text-ink" : undefined}>{x.w}</span>
              </span>
            </React.Fragment>
          ))}
        </p>
      </div>
    </section>
  );
}
