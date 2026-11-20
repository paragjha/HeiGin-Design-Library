import { describe, expect, it } from "vitest";
import { chaser, expoOut, odometerColumns } from "../../templates/motion/lib/motion-utils";

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
