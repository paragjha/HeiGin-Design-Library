import { StrictMode, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { LaunchCareers } from "@/components/launch/launch-careers";
import { LaunchChangelog } from "@/components/launch/launch-changelog";
import { LaunchCta } from "@/components/launch/launch-cta";
import { LaunchHero } from "@/components/launch/launch-hero";
import { LaunchPricing } from "@/components/launch/launch-pricing";
import { LaunchWaitlist } from "@/components/launch/launch-waitlist";
import { launchConfig } from "@/lib/launch-config";
import "./launch.css";

// The preview shows photos. They are set here, not in the template's config, so the download
// ships with no artwork of its own.
const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}.webp`;
launchConfig.waitlist.tiles = ["coupe", "ribbed-ember", "hills", "desk-field", "wave-grain", "ribbed-magenta"].map(img);
launchConfig.hero.image = img("hills");
launchConfig.cta.image = img("desk-field");
const backdrops = ["ribbed-ember", "wave-grain", "coupe", "ribbed-magenta"];
let b = 0;
for (const entry of launchConfig.changelog.entries) {
  for (const figure of [entry.figure, ...(entry.sections ?? []).map((s) => s.figure)]) {
    if (figure) figure.image = img(backdrops[b++ % backdrops.length]!);
  }
}

// The pricing pile: 3D renders of integration logos (see public/icons/NOTICE.txt), in the order of pricing.icons.
const ICONS = [
  ...["slack", "gmail", "notion", "google-calendar", "salesforce", "google-drive", "shopify", "linear", "messenger"],
  ...["openai", "claude", "zapier"], // unlimited agent runs
  ...["whatsapp", "twilio", "telegram"], // WhatsApp and phone channels
  ...["microsoft-teams", "zoom", "google-meet"], // more workspace members
];
launchConfig.pricing.icons.forEach((icon, i) => (icon.src = `${import.meta.env.BASE_URL}icons/${ICONS[i]}.webp`));

// The waitlist form pretends to send for a moment, so the preview shows its pending state.
const join = () => new Promise<void>((resolve) => setTimeout(resolve, 700));

// ?section=<name> (a key below) renders that piece; no parameter renders all of them.
const SECTIONS: Record<string, () => ReactElement> = {
  waitlist: () => <LaunchWaitlist onJoin={join} />,
  changelog: () => <LaunchChangelog />,
  cta: () => <LaunchCta />,
  hero: () => <LaunchHero />,
  careers: () => <LaunchCareers />,
  pricing: () => <LaunchPricing />,
};

function Preview() {
  const section = new URLSearchParams(window.location.search).get("section");
  const One = section ? SECTIONS[section] : undefined;
  if (One) return <One />;
  return (
    <>
      <LaunchHero />
      <LaunchWaitlist onJoin={join} />
      <LaunchChangelog />
      <LaunchPricing />
      <LaunchCareers />
      <LaunchCta />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
