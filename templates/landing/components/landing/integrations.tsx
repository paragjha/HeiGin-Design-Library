import { ArrowRight } from "lucide-react";
import { landingConfig, type LandingConfig } from "@/lib/landing-config";
import { monogram } from "@/lib/landing-utils";
import { Section, SectionHeading } from "./section";

const edgeFade = "linear-gradient(to right, transparent, black 10%, black 90%, transparent)";

/**
 * Integrations band with a slow, continuous marquee. The row is rendered twice
 * and slides -50% so the loop has no seam; it pauses on hover and keyboard
 * focus and stays still for reduced-motion visitors.
 */
export function Integrations({ content = landingConfig.integrations }: { content?: LandingConfig["integrations"] }) {
  const track = [...content.items, ...content.items];
  return (
    <Section tone="tint">
      <div className="grid items-end gap-6 lg:grid-cols-[1.4fr_1fr]">
        <SectionHeading eyebrow={content.eyebrow} title={content.title} description={content.description} />
        {content.link && (
          <a
            href={content.link.href}
            className="inline-flex items-center gap-1.5 text-md font-medium text-foreground hover:underline lg:justify-self-end"
          >
            {content.link.label} <ArrowRight size={15} aria-hidden="true" />
          </a>
        )}
      </div>
      {content.note && <p className="mt-2 text-sm text-faint">{content.note}</p>}
      <div className="group relative mt-10 overflow-hidden" style={{ maskImage: edgeFade, WebkitMaskImage: edgeFade }}>
        <ul
          aria-label="Integrations"
          className="flex w-max items-center gap-14 group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-safe:animate-[landing-marquee_42s_linear_infinite]"
        >
          {track.map((item, i) => {
            const Icon = item.icon;
            return (
              <li
                key={`${item.name}-${i}`}
                aria-hidden={i >= content.items.length ? true : undefined}
                className="flex shrink-0 items-center gap-3 text-foreground"
              >
                <span className="flex size-7 shrink-0 items-center justify-center opacity-75">
                  {item.logo ? (
                    <img
                      src={item.logo}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="size-full object-contain"
                      style={{ filter: "grayscale(1) brightness(0)" }}
                    />
                  ) : Icon ? (
                    <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
                  ) : (
                    <span className="text-xs font-semibold">{monogram(item.name)}</span>
                  )}
                </span>
                <span className="text-md font-medium tracking-tight">{item.name}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
