import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SectionIndex } from "./section-index";

const ITEMS = [
  { id: "s-one", label: "One" },
  { id: "s-two", label: "Two" },
  { id: "s-three", label: "Three" },
];

/** Puts three sections on the page with the given tops (px from the top of an 800px window), 300px tall each. */
function sections(tops: number[]) {
  ITEMS.forEach((it, i) => {
    let el = document.getElementById(it.id);
    if (!el) {
      el = document.createElement("section");
      el.id = it.id;
      document.body.appendChild(el);
    }
    const top = tops[i]!;
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({ top, bottom: top + 300, height: 300, left: 0, right: 0, width: 0, x: 0, y: top, toJSON: () => ({}) });
  });
}

async function scroll(tops: number[]) {
  sections(tops);
  await act(async () => {
    window.dispatchEvent(new Event("scroll"));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  });
}

describe("SectionIndex", () => {
  it("marks the last section whose top has passed 40% of the window as current", async () => {
    window.innerHeight = 800;
    sections([900, 1200, 1500]);
    render(<SectionIndex items={ITEMS} />);
    const current = () => screen.getAllByRole("link").find((a) => a.getAttribute("aria-current") === "location")?.textContent;
    expect(current()).toBe("One");
    await scroll([-400, 300, 600]); // two's top (300) is above the 320px line
    expect(current()).toBe("Two");
    await scroll([-1000, -700, 100]);
    expect(current()).toBe("Three");
  });

  it("shows the fixed index only while its sections are on screen", async () => {
    window.innerHeight = 800;
    sections([1200, 1500, 1800]);
    render(<SectionIndex items={ITEMS} />);
    const nav = screen.getByRole("navigation", { name: "Sections" });
    expect(nav).not.toHaveAttribute("data-shown");
    await scroll([200, 500, 800]);
    expect(nav).toHaveAttribute("data-shown");
    await scroll([-1200, -900, -600]); // the last section ended above the window
    expect(nav).not.toHaveAttribute("data-shown");
  });

  it("opens on focus and closes on Escape, returning focus to the ticks", () => {
    sections([0, 300, 600]);
    render(<SectionIndex items={ITEMS} placement="static" />);
    const nav = screen.getByRole("navigation", { name: "Sections" });
    const ticks = screen.getByRole("button", { name: "Show sections" });
    fireEvent.click(ticks);
    expect(screen.getByRole("link", { name: "One" })).toHaveFocus();
    expect(nav).toHaveAttribute("data-open");
    fireEvent.keyDown(nav, { key: "Escape" });
    expect(nav).not.toHaveAttribute("data-open");
    expect(ticks).toHaveFocus();
  });
});
