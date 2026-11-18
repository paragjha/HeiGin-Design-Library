import { useMemo, useState } from "react";
import { Button, TypeMotion, typeMotionDefaultArtwork, type TypeMotionArt, type TypeMotionEffect } from "@heigin/ui";
import { ServiceLogo, type ServiceName } from "../../components/ServiceLogos";

// Microsoft Fluent Emoji 3D (MIT), pinned to a commit. Docs demo only; the component ships no images.
const FLUENT = "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/";
const fluent = (name: string) => ({ src: `${FLUENT}${encodeURIComponent(name)}/3D/${name.toLowerCase().replace(/[ -]/g, "_")}_3d.png`, alt: name });
const OBJECTS = ["Laptop", "Mobile phone", "Television", "Floppy disk", "Joystick", "Camera", "Light bulb", "Rocket", "Crystal ball", "Robot", "Nerd face", "Partying face"];
const LOGOS: ServiceName[] = ["slack", "github", "notion", "linear", "figma", "jira", "openai", "claude", "vercel", "hubspot", "salesforce", "zapier"];

const SETS: Record<string, () => TypeMotionArt[]> = {
  HeiGin: () => typeMotionDefaultArtwork,
  "Service logos": () => LOGOS.map((n) => <ServiceLogo key={n} name={n} size={64} />),
  "3D objects": () => OBJECTS.map(fluent),
};
const EFFECTS: TypeMotionEffect[] = ["lens", "pop", "shuffle", "word", "bubble", "swell", "sticker", "burst"];

/** Hover the headline. Switch the artwork and the effect below it. */
export default function TypeMotionArtwork() {
  const [set, setSet] = useState("HeiGin");
  const [effect, setEffect] = useState<TypeMotionEffect>("lens");
  const artwork = useMemo(() => SETS[set]!(), [set]);

  return (
    <div style={{ display: "grid", gap: 16, width: "100%", justifyItems: "center" }}>
      <TypeMotion text={"Work with every\ntool you use"} effect={effect} artwork={artwork} as="h2" style={{ fontSize: "clamp(40px, 7vw, 76px)", textAlign: "center" }} />
      <div role="group" aria-label="Artwork" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {Object.keys(SETS).map((k) => (
          <Button key={k} size="sm" touch={false} variant={set === k ? "primary" : "secondary"} aria-pressed={set === k} onClick={() => setSet(k)}>
            {k}
          </Button>
        ))}
      </div>
      <div role="group" aria-label="Effect" style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
        {EFFECTS.map((e) => (
          <Button key={e} size="sm" touch={false} variant={effect === e ? "primary" : "ghost"} aria-pressed={effect === e} onClick={() => setEffect(e)}>
            {e}
          </Button>
        ))}
      </div>
    </div>
  );
}
