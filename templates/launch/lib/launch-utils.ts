import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True while the element is on screen; with `once`, it stays true after the first time. */
export function useInView<T extends Element>(once = false, rootMargin = "0px 0px -15% 0px") {
  const ref = React.useRef<T>(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return setInView(true);
    const io = new IntersectionObserver(
      ([e]) => {
        const on = !!e?.isIntersecting;
        if (once && !on) return;
        setInView(on);
        if (once) io.disconnect();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin]);
  return [ref, inView] as const;
}

/** A step counter that loops 0..count-1 every `ms` while `active`, and holds its last step under reduced motion. */
export function useTicker(active: boolean, count: number, ms: number) {
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    if (prefersReducedMotion()) return setStep(count - 1);
    if (!active) return;
    const t = window.setInterval(() => setStep((s) => (s + 1) % count), ms);
    return () => window.clearInterval(t);
  }, [active, count, ms]);
  return step;
}

/** Seeded random numbers, so scattered decoration lands in the same place on every render and on the server. */
export function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/** Fill for an image slot that has no photo yet: a soft gradient picked by index, so the download ships no artwork. */
const FILLS = [
  "linear-gradient(135deg, #f4c28a 0%, #d9674a 55%, #3b2a4a 100%)",
  "linear-gradient(160deg, #b9d3c9 0%, #5f8f72 60%, #2f4a3c 100%)",
  "linear-gradient(135deg, #1d2633 0%, #3d5168 50%, #d8733a 100%)",
  "linear-gradient(135deg, #f0d9b5 0%, #b98a6a 100%)",
  "linear-gradient(135deg, #2b2440 0%, #8a3c6b 55%, #f08a4b 100%)",
  "linear-gradient(135deg, #c9d6e6 0%, #7f96b8 100%)",
];
export const fillFor = (i: number) => FILLS[i % FILLS.length]!;

/** A piece of inline copy: plain text, **bold**, *italic*, or a {token} a component swaps for an element. */
export type Inline = { kind: "text" | "bold" | "italic" | "token"; value: string };

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\{(\w+)\}/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push({ kind: "text", value: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ kind: "bold", value: m[1] });
    else if (m[2] !== undefined) out.push({ kind: "italic", value: m[2] });
    else out.push({ kind: "token", value: m[3]! });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ kind: "text", value: text.slice(last) });
  return out;
}

/** Per-character timings of the self-typing prompt, in milliseconds. */
export const TYPING = { type: 42, hold: 2600, erase: 14, gap: 450 };

/**
 * What the prompt shows `elapsed` ms into its loop: each prompt types in, holds, erases faster
 * than it typed, then a short empty pause before the next one starts.
 */
export function typingFrame(prompts: string[], elapsed: number, t = TYPING): { index: number; text: string } {
  if (!prompts.length) return { index: 0, text: "" };
  const lengths = prompts.map((p) => Array.from(p).length);
  const spans = lengths.map((n) => n * t.type + t.hold + n * t.erase + t.gap);
  let ms = elapsed % spans.reduce((a, b) => a + b, 0);
  let index = 0;
  while (ms >= spans[index]!) ms -= spans[index++]!;
  const chars = Array.from(prompts[index]!);
  const n = lengths[index]!;
  let shown: number;
  if (ms < n * t.type) shown = Math.floor(ms / t.type);
  else if ((ms -= n * t.type) < t.hold) shown = n;
  else if ((ms -= t.hold) < n * t.erase) shown = n - Math.ceil(ms / t.erase);
  else shown = 0;
  return { index, text: chars.slice(0, Math.max(0, shown)).join("") };
}

/** The pricing card's two numbers: the list price with the chosen add-ons, and that price after the discount. */
export function pricingTotals(base: number, addOns: { id: string; price: number }[], on: ReadonlySet<string>, discount: number) {
  const list = addOns.reduce((sum, a) => (on.has(a.id) ? sum + a.price : sum), base);
  return { list, now: Math.round(list * (1 - Math.min(1, Math.max(0, discount)))) };
}
