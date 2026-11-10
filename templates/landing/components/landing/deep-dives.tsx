import type { ComponentType } from "react";
import { landingConfig, type DeepDiveContent, type DeepDiveScene } from "@/lib/landing-config";
import { Backdrop } from "./backdrop";
import { Section } from "./section";
import { DeepEarlySignals, DeepFollowUps, DeepSalesContext } from "./scenes/workflow-scenes";

const scenes: Record<DeepDiveScene, ComponentType> = {
  "sales-context": DeepSalesContext,
  "follow-ups": DeepFollowUps,
  "early-signals": DeepEarlySignals,
};

/** Numbered feature sections: heading left, long-form copy right, framed demo below. */
export function DeepDives({ content = landingConfig.deepDives }: { content?: DeepDiveContent[] }) {
  return (
    <>
      {content.map((dive, i) => {
        const Scene = scenes[dive.scene];
        return (
          <Section
            key={dive.title}
            id={i === 0 ? "features" : undefined}
            tone={dive.tone ?? (i % 2 ? "tint" : "white")}
            className="scroll-mt-28"
          >
            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-16">
              <div>
                <p className="font-mono text-sm font-medium tracking-wider text-faint">{dive.number}</p>
                <h2 className="mt-2 text-balance text-headline text-foreground">{dive.title}</h2>
              </div>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground lg:pt-8">{dive.description}</p>
            </div>
            <div className="relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-[1.75rem] p-4 md:p-8">
              <Backdrop />
              <div className="relative rounded-2xl bg-white/15 p-1.5 shadow-[0_18px_42px_-12px_rgba(0,0,0,0.3)] ring-1 ring-white/30 backdrop-blur-md md:p-2">
                <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
                  <Scene />
                </div>
              </div>
            </div>
          </Section>
        );
      })}
    </>
  );
}
