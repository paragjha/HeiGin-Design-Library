import { Button } from "@heigin/ui";
import { landingConfig, type LandingConfig } from "@/lib/landing-config";
import { monogram } from "@/lib/landing-utils";
import { Section } from "./section";

/** Customer quotes in a two-column grid. Only publish quotes the customer has approved. */
export function Testimonials({ content = landingConfig.testimonials }: { content?: LandingConfig["testimonials"] }) {
  return (
    <Section tone="tint" className="overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="inline-flex rounded-full bg-surface px-3 py-1 text-sm font-medium text-foreground shadow-card">
            {content.badge}
          </span>
          <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] font-semibold leading-tight tracking-tight text-foreground">
            {content.title}
            {content.titleMuted && (
              <>
                <br />
                <span className="text-faint">{content.titleMuted}</span>
              </>
            )}
          </h2>
        </div>
        {content.cta && (
          <a href={content.cta.href}>
            <Button variant="primary" size="md">
              {content.cta.label}
            </Button>
          </a>
        )}
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {content.items.map((t) => (
          <figure key={t.company} className="flex min-h-72 flex-col rounded-2xl bg-surface p-8 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface text-sm font-semibold text-muted-foreground ring-1 ring-border">
                {t.logo ? <img src={t.logo} alt="" className="size-full object-contain" /> : monogram(t.company)}
              </span>
              <div>
                <p className="font-medium text-foreground">{t.company}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
            <blockquote className="mt-6 text-xl leading-relaxed text-foreground">“{t.quote}”</blockquote>
            <figcaption className="mt-auto flex items-center justify-between pt-6 text-sm text-muted-foreground">
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-foreground">{t.role}</span>
              <span>{t.year}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
