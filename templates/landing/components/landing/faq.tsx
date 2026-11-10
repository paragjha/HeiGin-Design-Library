"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { landingConfig, type LandingConfig } from "@/lib/landing-config";
import { InlineEyebrow } from "./inline-eyebrow";
import { Section } from "./section";

/** Single-open accordion with a spring height transition. `defaultOpen={null}` starts all closed. */
export function Faq({
  content = landingConfig.faq,
  defaultOpen = 0,
}: {
  content?: LandingConfig["faq"];
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <Section className="border-t border-border">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <InlineEyebrow>{content.eyebrow}</InlineEyebrow>
          <h2 className="mt-3 text-balance text-headline text-foreground">{content.title}</h2>
        </div>
        <ul className="divide-y divide-border border-y border-border">
          {content.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen((cur) => (cur === i ? null : i))}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-xl font-medium text-foreground"
                >
                  {item.q}
                  <motion.span
                    aria-hidden="true"
                    className="text-2xl font-light text-faint"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { type: "spring", stiffness: 320, damping: 32, mass: 0.6 },
                        opacity: { duration: 0.18 },
                      }}
                      style={{ overflow: "hidden" }}
                    >
                      <p className="max-w-2xl pb-5 text-lg leading-relaxed text-muted-foreground">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
