"use client";

import { Button } from "@heigin/ui";
import { landingConfig, trackCta, type LandingConfig } from "@/lib/landing-config";
import { ProductDemo } from "./scenes/product-demo";

/** Two-column headline row above the framed, auto-playing product demo. */
export function Hero({ content = landingConfig.hero }: { content?: LandingConfig["hero"] }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="container-site pt-10 md:pt-14">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
          <h1 className="text-balance text-display text-foreground">{content.title}</h1>
          <div className="flex flex-col gap-6">
            <p className="max-w-xl text-subhead text-muted-foreground">{content.description}</p>
            <div className="flex flex-wrap items-center gap-3">
              <a href={content.primaryCta.href} onClick={() => trackCta("hero")}>
                <Button variant="primary" size="lg">
                  {content.primaryCta.label}
                </Button>
              </a>
              {content.secondaryCta && (
                <a href={content.secondaryCta.href}>
                  <Button variant="secondary" size="lg">
                    {content.secondaryCta.label}
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="relative mt-10 pb-12 md:mt-14 md:pb-16">
        <ProductDemo />
      </div>
    </section>
  );
}
