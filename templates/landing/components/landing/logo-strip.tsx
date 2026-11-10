import { landingConfig, type LandingConfig } from "@/lib/landing-config";
import { monogram } from "@/lib/landing-utils";

/** Quiet row of customer names and marks under the hero. */
export function LogoStrip({ content = landingConfig.logoStrip }: { content?: LandingConfig["logoStrip"] }) {
  return (
    <section className="border-b border-border">
      <div className="container-site py-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.1em] text-faint">{content.label}</p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
          {content.logos.map((item) => (
            <li key={item.name} className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface text-2xs font-semibold text-muted-foreground ring-1 ring-border">
                {item.logo ? <img src={item.logo} alt="" className="size-full object-contain" /> : monogram(item.name)}
              </span>
              <span className="text-md font-semibold tracking-tight text-foreground">{item.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
