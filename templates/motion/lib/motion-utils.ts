import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/*
 * The curves the sections animate with. CSS strings for transitions and the Web Animations API;
 * JS functions for the values the sections compute each frame.
 */
export const EASE = "cubic-bezier(0.3, 0.9, 0.1, 1)"; // fast out, long settle: most arrivals
export const EASE_IN_OUT = "cubic-bezier(0.7, 0, 0.16, 1)"; // the pricing knob
export const EXPO_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
export const EXPO_IN_OUT = "cubic-bezier(0.87, 0, 0.13, 1)";
export const POWER2_OUT = "cubic-bezier(0.33, 1, 0.68, 1)";
export const POWER2_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";

/** A CSS cubic-bezier as a JS function of progress, for values computed each frame. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) => 3 * a * (1 - t) * (1 - t) * t + 3 * b * (1 - t) * t * t + t * t * t;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}
export const easeInOut = cubicBezier(0.7, 0, 0.16, 1);

export const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const power3Out = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * A number that eases toward its latest target over `duration` seconds and restarts the ease
 * from wherever it is whenever the target changes. This is how a scrubbed scroll catches up
 * with the scrollbar, and how a pointer-follow glides instead of snapping.
 */
export function chaser(duration: number, ease: (t: number) => number, initial = 0) {
  let from = initial;
  let to = initial;
  let start = -Infinity;
  const at = (now: number) => {
    const k = duration > 0 ? Math.min(1, (now - start) / (duration * 1000)) : 1;
    return from + (to - from) * ease(k);
  };
  return {
    set(target: number, now: number) {
      if (target === to) return;
      from = at(now);
      to = target;
      start = now;
    },
    jump(value: number) {
      from = to = value;
      start = -Infinity;
    },
    get: at,
    settled: (now: number) => now - start >= duration * 1000,
  };
}

/**
 * The digit columns of a rolling price, right-aligned so the ones digit stays put. When the new
 * value has more digits, fresh columns join on the left (they grow in from zero width); when it
 * has fewer, the extra left columns are marked `dropping` (they shrink away, then go).
 */
export type OdometerColumn = { id: number; digit: number; dropping: boolean; fresh: boolean };
let nextColumnId = 0;
export function odometerColumns(value: number, prev: OdometerColumn[]): OdometerColumn[] {
  const digits = String(Math.round(Math.abs(value))).split("").map(Number);
  const live = prev.filter((c) => !c.dropping); // columns still shrinking from an earlier change go now
  const diff = digits.length - live.length;
  if (diff >= 0) {
    const gained = Array.from({ length: diff }, () => ({ id: nextColumnId++, digit: 0, dropping: false, fresh: true }));
    return [...gained, ...live.map((c) => ({ ...c, fresh: false }))].map((c, i) => ({ ...c, digit: digits[i]! }));
  }
  return [
    ...live.slice(0, -diff).map((c) => ({ ...c, dropping: true, fresh: false })),
    ...live.slice(-diff).map((c, i) => ({ ...c, digit: digits[i]!, fresh: false })),
  ];
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smoothstep = (t: number) => t * t * (3 - 2 * t);

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Cover art for a card that has no photo yet: a soft gradient picked by index, so the download ships no artwork. */
const COVERS = [
  "linear-gradient(135deg, #2a2a2a 0%, #4a4a4a 100%)",
  "linear-gradient(135deg, #2b3440 0%, #56657a 100%)",
  "linear-gradient(135deg, #2c3a31 0%, #5a7262 100%)",
  "linear-gradient(135deg, #3d332a 0%, #7a6450 100%)",
  "linear-gradient(135deg, #322d3d 0%, #645a7a 100%)",
];
export const coverFor = (i: number) => COVERS[i % COVERS.length]!;
