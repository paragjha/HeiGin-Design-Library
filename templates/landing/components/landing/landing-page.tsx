import type { ComponentType } from "react";
import { landingConfig, type SectionId } from "@/lib/landing-config";
import { AnnouncementBar } from "./announcement-bar";
import { DeepDives } from "./deep-dives";
import { Faq } from "./faq";
import { FinalCta } from "./final-cta";
import { Hero } from "./hero";
import { Integrations } from "./integrations";
import { LogoStrip } from "./logo-strip";
import { Newsroom } from "./newsroom";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { Testimonials } from "./testimonials";
import { WorkflowGrid } from "./workflow-grid";

const sections: Record<SectionId, ComponentType> = {
  hero: Hero,
  logoStrip: LogoStrip,
  workflows: WorkflowGrid,
  integrations: Integrations,
  deepDives: DeepDives,
  newsroom: Newsroom,
  testimonials: Testimonials,
  faq: Faq,
  finalCta: FinalCta,
};

/**
 * The full page. Which sections render, and in what order, comes from
 * `landingConfig.sections`; pass `only` to render a subset without editing
 * the config. Set `chrome={false}` to drop the announcement bar, header and
 * footer when the page already has its own.
 */
export function LandingPage({
  only = landingConfig.sections,
  chrome = true,
}: {
  only?: SectionId[];
  chrome?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {chrome && <AnnouncementBar />}
      {chrome && <SiteHeader />}
      <main className="flex-1">
        {only.map((id) => {
          const SectionComponent = sections[id];
          return <SectionComponent key={id} />;
        })}
      </main>
      {chrome && <SiteFooter />}
    </div>
  );
}
