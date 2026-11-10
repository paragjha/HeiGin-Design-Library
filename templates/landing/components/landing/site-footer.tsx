import { Button } from "@heigin/ui";
import { landingConfig, type LandingConfig } from "@/lib/landing-config";
import { Brand } from "./brand";

/** Footer: brand block, link columns, legal row and an oversized wordmark. */
export function SiteFooter({ content = landingConfig.footer }: { content?: LandingConfig["footer"] }) {
  const { name } = landingConfig.brand;
  return (
    <footer className="border-t border-border bg-background">
      <div className="container-site py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Brand />
            <p className="mt-4 max-w-60 text-md leading-relaxed text-muted-foreground">{content.tagline}</p>
            {content.badge && (
              <a href={content.badge.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block">
                <img src={content.badge.src} alt={content.badge.alt} width={210} height={46} loading="lazy" />
              </a>
            )}
            {content.cta && (
              <div className="mt-6">
                <a href={content.cta.href}>
                  <Button variant="secondary" size="sm">
                    {content.cta.label}
                  </Button>
                </a>
              </div>
            )}
          </div>
          {content.groups.map((group) => (
            <nav key={group.label} aria-label={`Footer: ${group.label}`}>
              <p className="text-sm font-semibold text-foreground">{group.label}</p>
              <ul className="mt-4 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          {content.legalNote && <p className="text-xs text-faint">{content.legalNote}</p>}
        </div>

        <div aria-hidden="true" className="mt-10 overflow-hidden">
          <span className="block select-none text-center font-semibold leading-none tracking-[-0.06em] text-foreground/5 [font-size:clamp(5rem,16vw,15rem)]">
            {name}
          </span>
        </div>
      </div>
    </footer>
  );
}
