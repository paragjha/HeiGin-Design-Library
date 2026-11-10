"use client";

import { Button } from "@heigin/ui";
import { landingConfig, trackCta, type LandingConfig } from "@/lib/landing-config";
import { Backdrop } from "./backdrop";
import { Section } from "./section";

/** Contained closing banner over the backdrop: headline, one line of copy, up to two actions. */
export function FinalCta({ content = landingConfig.finalCta }: { content?: LandingConfig["finalCta"] }) {
  return (
    <Section className="border-t border-border">
      <div
        className="relative mx-auto flex w-full items-center justify-center overflow-hidden rounded-[2rem] px-6 py-16 text-center md:px-12"
        style={{ maxWidth: 1279, minHeight: "min(64vw, 825px)" }}
      >
        <Backdrop />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-foreground/65 via-foreground/45 to-foreground/70"
        />
        <div className="relative flex flex-col items-center">
          <h2 className="mx-auto max-w-2xl text-balance text-[clamp(2rem,1.3rem+3vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-background">
            {content.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-background/85">{content.description}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={content.primary.href} onClick={() => trackCta("final-cta")}>
              <Button variant="primary" size="lg">
                {content.primary.label}
              </Button>
            </a>
            {content.secondary && (
              <a href={content.secondary.href}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-background/40 bg-background/10 text-background hover:bg-background/20"
                >
                  {content.secondary.label}
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
