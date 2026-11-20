import { StrictMode, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { MotionFloatingNavbar } from "@/components/motion/motion-floating-navbar";
import { MotionFlyIn } from "@/components/motion/motion-fly-in";
import { MotionPricing } from "@/components/motion/motion-pricing";
import { MotionProcessRail } from "@/components/motion/motion-process-rail";
import { MotionStackingCards } from "@/components/motion/motion-stacking-cards";
import { motionConfig } from "@/lib/motion-config";
import "./motion.css";

// The preview shows photos and HeiGin UI screenshots. They are set here, not in the template's
// config, so the download ships with no artwork of its own.
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;
const covers = ["landscape", "aurora", "meadow", "ember", "chair"];
motionConfig.stack.cards.forEach((c, i) => (c.src = asset(`covers/${covers[i % covers.length]}.webp`)));
const shots = [
  ["metric-card", "lg"],
  ["conversation-list-item", "md"],
  ["table", "lg"],
  ["approval-card", "md"],
  ["record-header", "lg"],
  ["activity-timeline", "md"],
  ["task-row", "sm"],
  ["sidebar-nav", "sm"],
  ["detail-list", "sm"],
  ["workspace-switcher", "sm"],
  ["tabs", "md"],
  ["empty-state", "md"],
] as const;
motionConfig.flyIn.items = shots.map(([name, size], i) => ({ src: asset(`ui/${name}.webp`), size, hideMobile: i >= 8 }));
const steps = ["connect", "triage", "decide", "close"];
motionConfig.process.steps.forEach((s, i) => (s.image = asset(`steps/${steps[i]}.webp`)));

// Room after a scroll-driven section, so the page can scroll past its last step.
const Tail = () => <div className="h-[40vh]" aria-hidden="true" />;

// ?section=navbar | pricing | stack | fly-in | process renders that section; no parameter renders all of them.
const SECTIONS: Record<string, () => ReactElement> = {
  // the open bar is ink on light, so it is shown over light sections
  navbar: () => (
    <>
      <MotionFloatingNavbar />
      <MotionPricing />
      <MotionStackingCards />
      <Tail />
    </>
  ),
  pricing: () => <MotionPricing />,
  stack: () => (
    <>
      <MotionStackingCards />
      <Tail />
    </>
  ),
  "fly-in": () => <MotionFlyIn />,
  process: () => (
    <>
      <MotionProcessRail />
      <Tail />
    </>
  ),
};

function Preview() {
  const section = new URLSearchParams(window.location.search).get("section");
  const One = section ? SECTIONS[section] : undefined;
  if (One) return <One />;
  return (
    <>
      <MotionFloatingNavbar />
      <MotionPricing />
      <MotionProcessRail />
      <MotionStackingCards />
      <MotionFlyIn />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
