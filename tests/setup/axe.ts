import axe from "axe-core";
import { expect } from "vitest";

/**
 * Runs axe-core against a rendered container and fails with a readable list of violations.
 * Colour contrast is checked separately (jsdom cannot compute it) — see scripts/check-contrast.mjs.
 */
export async function expectNoAxeViolations(container: Element) {
  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  const messages = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).join("\n  ")}`,
  );
  expect(messages, messages.join("\n\n")).toEqual([]);
}
