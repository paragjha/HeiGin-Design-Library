import type { ComponentType } from "react";
import {
  AvatarCirclesDemo,
  BorderBeamDemo,
  RainbowButtonDemo,
  AnimatedTerminalDemo,
  FileTreeDemo,
} from "./demos";

const sources = import.meta.glob("./*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const read = (name: string): string => sources[`./${name}.tsx`] ?? "";

export interface ShowcaseProp {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export interface ShowcaseItem {
  slug: string;
  title: string;
  description: string;
  group: "Marketing" | "Dev UI";
  demo: ComponentType;
  source: string;
  props: ShowcaseProp[];
}

export const showcaseItems: ShowcaseItem[] = [
  {
    slug: "avatar-circles",
    title: "Avatar circles",
    description:
      "A stack of overlapping circular avatars with a trailing overflow count. Reuses HeiGin's Avatar primitive and keeps keyboard focus on each link.",
    group: "Marketing",
    demo: AvatarCirclesDemo,
    source: read("AvatarCircles"),
    props: [
      { name: "people", type: "AvatarCirclesPerson[]", description: "Visible people (name, optional image, optional profile link)." },
      { name: "max", type: "number", defaultValue: "4", description: "How many avatars to show before the overflow count." },
      { name: "numPeople", type: "number", description: "Total count for the overflow label. Defaults to people.length." },
      { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Avatar diameter preset." },
      { name: "label", type: "string", description: "Accessible label for the whole group." },
    ],
  },
  {
    slug: "border-beam",
    title: "Border beam",
    description:
      "A beam of colour that travels along the parent element's border, built with a conic-gradient mask. Mount it inside a positioned element with its own border-radius.",
    group: "Marketing",
    demo: BorderBeamDemo,
    source: read("BorderBeam"),
    props: [
      { name: "duration", type: "number", defaultValue: "8", description: "Travel time in seconds for one full orbit." },
      { name: "colorFrom", type: "string", defaultValue: '"#a855f7"', description: "First beam colour." },
      { name: "colorTo", type: "string", defaultValue: '"#22d3ee"', description: "Second beam colour." },
      { name: "size", type: "number", defaultValue: "60", description: "Beam arc length in degrees." },
    ],
  },
  {
    slug: "rainbow-button",
    title: "Rainbow button",
    description:
      "A dark CTA button with a moving rainbow border and a soft glow. Respects prefers-reduced-motion and inherits HeiGin's focus ring.",
    group: "Marketing",
    demo: RainbowButtonDemo,
    source: read("RainbowButton"),
    props: [
      { name: "speed", type: "number", defaultValue: "6", description: "Gradient cycle time in seconds." },
      { name: "…ButtonHTMLAttributes", type: "React.ButtonHTMLAttributes<HTMLButtonElement>", description: "Any native button attribute." },
    ],
  },
  {
    slug: "animated-terminal",
    title: "Animated terminal",
    description:
      "A terminal window that types a command and reveals status lines one by one. Collapses to instant render under prefers-reduced-motion and announces completion to screen readers.",
    group: "Dev UI",
    demo: AnimatedTerminalDemo,
    source: read("AnimatedTerminal"),
    props: [
      { name: "lines", type: "TerminalLine[]", description: "Script of prompt, ok, info and output lines." },
      { name: "typeSpeedMs", type: "number", defaultValue: "40", description: "ms per character while typing prompts." },
      { name: "stepMs", type: "number", defaultValue: "300", description: "Delay between non-prompt lines." },
      { name: "autoplay", type: "boolean", defaultValue: "true", description: "Start on mount." },
    ],
  },
  {
    slug: "file-tree",
    title: "File tree",
    description:
      "A keyboard-operable file and folder tree. Folders expand with Enter / ArrowRight and collapse with ArrowLeft; files fire onSelect with their id.",
    group: "Dev UI",
    demo: FileTreeDemo,
    source: read("FileTree"),
    props: [
      { name: "nodes", type: "FileTreeNode[]", description: "Root nodes. children: [] marks a folder; omitted means a file." },
      { name: "defaultExpanded", type: "string[]", description: "Folder ids to open on mount." },
      { name: "defaultSelected", type: "string", description: "File id to select on mount." },
      { name: "onSelect", type: "(id: string) => void", description: "Fires when a file is picked." },
    ],
  },
];
