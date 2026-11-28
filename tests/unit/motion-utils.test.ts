import { describe, expect, it } from "vitest";
import {
  chaser,
  cubicBezier,
  dampingForOvershoot,
  easeInOut,
  expoOut,
  fitFontSize,
  odometerColumns,
  seeded,
  springCurve,
} from "../../templates/motion/lib/motion-utils";

describe("seeded", () => {
  it("repeats the same numbers for the same seed, in [0, 1)", () => {
    const a = seeded(7);
    const b = seeded(7);
    const xs = Array.from({ length: 50 }, () => a());
    expect(Array.from({ length: 50 }, () => b())).toEqual(xs);
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true);
    expect(seeded(8)()).not.toBe(xs[0]);
  });
});

describe("spring overshoot", () => {
  const peak = (curve: (t: number) => number) => Math.max(...Array.from({ length: 2001 }, (_, i) => curve(i / 2000)));

  it("overshoots by the same pixels on a small and a large move", () => {
    for (const distance of [40, 300]) {
      const over = (peak(springCurve(dampingForOvershoot(6, distance))) - 1) * distance;
      expect(over).toBeCloseTo(6, 0);
    }
  });

  it("lands on 1 and starts at 0", () => {
    const c = springCurve(dampingForOvershoot(6, 120));
    expect(c(0)).toBeCloseTo(0, 5);
    expect(c(1)).toBe(1);
    expect(Math.abs(c(0.98) - 1)).toBeLessThan(0.01);
  });

  it("does not bounce with no overshoot", () => {
    expect(dampingForOvershoot(0, 100)).toBe(1);
    expect(peak(springCurve(1))).toBe(1);
  });
});

describe("fitFontSize", () => {
  it("scales the size so the measured word spans the target", () => {
    expect(fitFontSize(1200, 300, 100)).toBe(400);
    expect(fitFontSize(1200, 0, 100)).toBe(100);
  });
});

const digits = (cols: { digit: number; dropping: boolean }[]) => cols.filter((c) => !c.dropping).map((c) => c.digit).join("");

describe("odometerColumns", () => {
  it("gains a column on the left and rolls the rest right-aligned", () => {
    const start = odometerColumns(29, []);
    const next = odometerColumns(290, start);
    expect(digits(next)).toBe("290");
    expect(next[0]!.fresh).toBe(true);
    // the old columns keep their identity, so they roll instead of remounting
    expect(next.slice(1).map((c) => c.id)).toEqual(start.map((c) => c.id));
  });

  it("marks the extra left columns as dropping, with their old digit", () => {
    const yearly = odometerColumns(1990, []);
    const monthly = odometerColumns(199, yearly);
    expect(monthly).toHaveLength(4);
    expect(monthly[0]).toMatchObject({ dropping: true, digit: 1 });
    expect(digits(monthly)).toBe("199");
  });

  it("removes columns still dropping from an earlier change", () => {
    const mid = odometerColumns(29, odometerColumns(290, []));
    const again = odometerColumns(790, mid);
    expect(again.some((c) => c.dropping)).toBe(false);
    expect(digits(again)).toBe("790");
  });
});

describe("chaser", () => {
  it("eases to its target and restarts from where it is on a new target", () => {
    const c = chaser(1, expoOut);
    c.set(100, 0);
    expect(c.get(500)).toBeCloseTo(100 * expoOut(0.5));
    expect(c.get(1000)).toBe(100);
    const at = c.get(500);
    c.set(0, 500);
    expect(c.get(500)).toBeCloseTo(at);
    expect(c.get(1500)).toBe(0);
  });

  it("follows at once with no duration", () => {
    const c = chaser(0, expoOut);
    c.set(42, 10);
    expect(c.get(10)).toBe(42);
  });
});

describe("cubicBezier", () => {
  it("matches the CSS curve at its ends, its symmetry and a known point", () => {
    const linear = cubicBezier(1 / 3, 1 / 3, 2 / 3, 2 / 3);
    expect(linear(0.37)).toBeCloseTo(0.37, 5);
    const sym = cubicBezier(0.65, 0, 0.35, 1);
    expect(sym(0.5)).toBeCloseTo(0.5, 5);
    expect(sym(0.2) + sym(0.8)).toBeCloseTo(1, 5);
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    // the in-out curve starts slow: a fifth of the time covers well under a fifth of the way
    expect(easeInOut(0.2)).toBeLessThan(0.1);
  });
});
