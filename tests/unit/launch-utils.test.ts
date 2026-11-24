import { describe, expect, it } from "vitest";
import { parseInline, pricingTotals, typingFrame } from "../../templates/launch/lib/launch-utils";

describe("parseInline", () => {
  it("splits bold, italic and tokens out of plain text", () => {
    expect(parseInline("Connect {mail} **Gmail**, then *relax*.")).toEqual([
      { kind: "text", value: "Connect " },
      { kind: "token", value: "mail" },
      { kind: "text", value: " " },
      { kind: "bold", value: "Gmail" },
      { kind: "text", value: ", then " },
      { kind: "italic", value: "relax" },
      { kind: "text", value: "." },
    ]);
  });

  it("returns plain text untouched", () => {
    expect(parseInline("No marks here")).toEqual([{ kind: "text", value: "No marks here" }]);
  });
});

describe("typingFrame", () => {
  const t = { type: 10, hold: 100, erase: 5, gap: 50 };
  const prompts = ["abcd", "xy"];
  // "abcd" spans 4*10 + 100 + 4*5 + 50 = 210 ms; "xy" spans 2*10 + 100 + 2*5 + 50 = 180 ms

  it("types a character per step, then holds the whole prompt", () => {
    expect(typingFrame(prompts, 0, t)).toEqual({ index: 0, text: "" });
    expect(typingFrame(prompts, 25, t).text).toBe("ab");
    expect(typingFrame(prompts, 40, t).text).toBe("abcd");
    expect(typingFrame(prompts, 139, t).text).toBe("abcd");
  });

  it("erases faster than it typed, pauses empty, then starts the next prompt", () => {
    expect(typingFrame(prompts, 147, t).text).toBe("ab");
    expect(typingFrame(prompts, 170, t).text).toBe("");
    expect(typingFrame(prompts, 220, t)).toEqual({ index: 1, text: "x" });
  });

  it("loops back to the first prompt", () => {
    expect(typingFrame(prompts, 390 + 25, t)).toEqual({ index: 0, text: "ab" });
  });

  it("counts emoji as one character each", () => {
    expect(typingFrame(["👋👋"], 10, t).text).toBe("👋");
  });
});

describe("pricingTotals", () => {
  const addOns = [
    { id: "runs", price: 96 },
    { id: "channels", price: 58 },
  ];

  it("adds the chosen add-ons to the list price and takes the discount off", () => {
    expect(pricingTotals(98, addOns, new Set(), 0.5)).toEqual({ list: 98, now: 49 });
    expect(pricingTotals(98, addOns, new Set(["runs"]), 0.5)).toEqual({ list: 194, now: 97 });
    expect(pricingTotals(98, addOns, new Set(["runs", "channels"]), 0.5)).toEqual({ list: 252, now: 126 });
  });

  it("ignores ids that aren't add-ons and keeps the discount between 0 and 1", () => {
    expect(pricingTotals(98, addOns, new Set(["nope"]), 0)).toEqual({ list: 98, now: 98 });
    expect(pricingTotals(98, addOns, new Set(), 1.5)).toEqual({ list: 98, now: 0 });
    expect(pricingTotals(99, addOns, new Set(), 0.25)).toEqual({ list: 99, now: 74 });
  });
});
