import type { ComponentType } from "react";
import { landingConfig, type LandingConfig, type WorkflowScene } from "@/lib/landing-config";
import { Backdrop } from "./backdrop";
import { Section, SectionHeading } from "./section";
import { SceneDealBrief, SceneFollowUpDraft, SceneMeetingContext, SceneStalledAccount } from "./scenes/workflow-scenes";

const scenes: Record<WorkflowScene, ComponentType> = {
  "meeting-context": SceneMeetingContext,
  "follow-up-draft": SceneFollowUpDraft,
  "deal-brief": SceneDealBrief,
  "stalled-account": SceneStalledAccount,
};

/** 2x2 grid of workflow cards, each holding a small animated product scene in a glass frame. */
export function WorkflowGrid({ content = landingConfig.workflows }: { content?: LandingConfig["workflows"] }) {
  return (
    <Section>
      <SectionHeading eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {content.cards.map((card) => {
          const Scene = scenes[card.scene];
          return (
            <article key={card.title} className="relative overflow-hidden rounded-[1.75rem] border border-border">
              <Backdrop />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-b from-foreground/55 via-foreground/35 to-foreground/55"
              />
              <div className="relative flex flex-col gap-5 p-6 md:p-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-background/70">{card.eyebrow}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-background">{card.title}</h3>
                  <p className="mt-2 max-w-md text-md leading-relaxed text-background/85">{card.description}</p>
                </div>
                <div className="rounded-xl bg-white/15 p-1.5 shadow-[0_18px_42px_-12px_rgba(0,0,0,0.4)] ring-1 ring-white/30 backdrop-blur-md">
                  <div className="rounded-lg border border-border bg-surface p-4 md:p-5">
                    <Scene />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
