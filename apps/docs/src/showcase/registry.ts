import type { ComponentType } from "react";
import {
  AvatarCirclesDemo,
  BorderBeamDemo,
  RainbowButtonDemo,
  AnimatedTerminalDemo,
  FileTreeDemo,
  SaasLandingDemo,
  BarVisualizerDemo,
  ShimmeringTextDemo,
  IntegrationBeamDemo,
  CursorParticlesDemo,
  DotMatrixOrbDemo,
  AgentOrbDemo,
  DottedGlobeDemo,
  IconCloudDemo,
  FlickerGridDemo,
  GlyphMatrixDemo,
  ImageStreamHeroDemo,
  LiveWaveformDemo,
  ConversationBarDemo,
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
  group: "Marketing" | "Dev UI" | "Pages" | "Agent UI" | "Uploads";
  demo: ComponentType;
  source: string;
  props: ShowcaseProp[];
  /** When true, the demo renders flush with its stage (no padding). */
  flushStage?: boolean;
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
    slug: "saas-landing",
    title: "SaaS landing page",
    description:
      "A composable landing page: fixed nav with centered links and a mobile drawer, an announcement pill, a gradient headline, a supporting paragraph, a primary CTA and a dashboard preview with ambient glow. The dashboard preview is built in SVG from scratch — no external image.",
    group: "Pages",
    demo: SaasLandingDemo,
    source: read("SaasLanding"),
    flushStage: true,
    props: [
      { name: "brand", type: "string", defaultValue: '"HeiGin UI"', description: "Brand name shown in the nav." },
      { name: "navLinks", type: "{ label: string; href: string }[]", description: "Section links shown centre-aligned on desktop and in the mobile drawer." },
      { name: "title", type: "React.ReactNode", description: "Hero headline. Supports a <br/> to split lines." },
      { name: "subtitle", type: "React.ReactNode", description: "Supporting paragraph under the headline." },
      { name: "announcement", type: "{ text: string; linkText: string; linkHref: string }", description: "Pill shown above the title." },
      { name: "ctaText", type: "string", defaultValue: '"Get started"', description: "Primary CTA button label." },
      { name: "onCtaClick", type: "() => void", description: "Click handler for the CTA." },
    ],
  },
  {
    slug: "bar-visualizer",
    title: "Audio bar visualizer",
    description:
      "A row of animated bars that reads as an agent state (connecting, initializing, listening, speaking, thinking). Demo mode drives heights with simple noise instead of microphone input, so it runs without permission.",
    group: "Agent UI",
    demo: BarVisualizerDemo,
    source: read("BarVisualizer"),
    props: [
      { name: "state", type: '"connecting" | "initializing" | "listening" | "speaking" | "thinking"', defaultValue: '"listening"', description: "Agent state driving the bar shape." },
      { name: "barCount", type: "number", defaultValue: "20", description: "Number of bars rendered." },
      { name: "minHeight", type: "number", defaultValue: "15", description: "Minimum visible bar height in px." },
      { name: "maxHeight", type: "number", defaultValue: "90", description: "Maximum visible bar height in px." },
      { name: "demo", type: "boolean", defaultValue: "true", description: "Use procedural heights (no mic)." },
      { name: "height", type: "number", defaultValue: "160", description: "Container height in px." },
      { name: "color", type: "string", description: "Bar colour; defaults to the HeiGin brand token." },
    ],
  },
  {
    slug: "shimmering-text",
    title: "Shimmering text",
    description:
      "A soft moving sheen for short status copy. Pass a string for a single line or an array to rotate phrases every few seconds, with a gentle fade between them.",
    group: "Agent UI",
    demo: ShimmeringTextDemo,
    source: read("ShimmeringText"),
    props: [
      { name: "text", type: "string | string[]", description: "The phrase, or a list to rotate through." },
      { name: "intervalMs", type: "number", defaultValue: "3000", description: "ms between phrase swaps." },
      { name: "shimmerSeconds", type: "number", defaultValue: "2.4", description: "Shimmer cycle length." },
    ],
  },
  {
    slug: "integration-beam",
    title: "Integration beam",
    description:
      "A smooth stroke that cycles along SVG paths connecting a source icon to one or more target icons. Pure SVG + CSS keyframes — no runtime deps.",
    group: "Marketing",
    demo: IntegrationBeamDemo,
    source: read("IntegrationBeam"),
    props: [
      { name: "from", type: "IntegrationBeamIcon", description: "Icon shown on the left." },
      { name: "to", type: "IntegrationBeamIcon[]", description: "One or more right-side icons; each gets its own path." },
      { name: "duration", type: "number", defaultValue: "2.8", description: "Beam cycle time in seconds." },
      { name: "color", type: "string", description: "Beam colour. Defaults to the HeiGin brand." },
    ],
  },
  {
    slug: "dot-matrix-orb",
    title: "Dot-matrix orb",
    description:
      "A dot grid rendered on canvas that reads as a 3-D sphere, a ring, or a wave. Depth comes from math — no sampled image — and 'rotation' is a phase shift so the dot grid stays crisp at every frame.",
    group: "Agent UI",
    demo: DotMatrixOrbDemo,
    source: read("DotMatrixOrb"),
    props: [
      { name: "size", type: "number", defaultValue: "240", description: "Width and height in CSS px." },
      { name: "resolution", type: "number", defaultValue: "48", description: "Dot grid resolution." },
      { name: "shape", type: '"sphere" | "ring" | "wave"', defaultValue: '"sphere"', description: "Form the dots take." },
      { name: "rotate", type: "boolean", defaultValue: "true", description: "Keeps the pattern animating; off for a static mark." },
      { name: "color", type: "string", description: "Dot colour. Defaults to HeiGin brand." },
    ],
  },
  {
    slug: "agent-orb",
    title: "Agent orbs",
    description:
      "Soft, luminous orbs that read as agent state — idle, listening, talking. Breathing rhythm and glow intensity change with the state. Pass a palette and seed per orb to make a cluster feel distinct.",
    group: "Agent UI",
    demo: AgentOrbDemo,
    source: read("AgentOrb"),
    props: [
      { name: "state", type: 'null | "listening" | "talking"', defaultValue: "null", description: "State controls breathing speed and glow." },
      { name: "size", type: "number", defaultValue: "128", description: "Orb diameter in CSS px." },
      { name: "palette", type: "OrbPalette", description: "Three colour stops." },
      { name: "seed", type: "number", defaultValue: "0", description: "Deterministic phase offset per orb." },
    ],
  },
  {
    slug: "dotted-globe",
    title: "Dotted globe",
    description:
      "A rotating 3-D globe drawn as a grid of dots on canvas. Dots fade to zero as they cross to the back of the sphere, giving the pierced-silhouette look without WebGL or a texture. Hand-rolled, no three.js.",
    group: "Marketing",
    demo: DottedGlobeDemo,
    source: read("DottedGlobe"),
    props: [
      { name: "size", type: "number", defaultValue: "320", description: "Globe diameter in CSS px." },
      { name: "density", type: "number", defaultValue: "42", description: "Latitude bands; dot count scales with cos(lat)." },
      { name: "rotationSeconds", type: "number", defaultValue: "32", description: "Full rotation period in seconds." },
      { name: "tilt", type: "number", defaultValue: "22", description: "Degrees of x-axis tilt." },
      { name: "color", type: "string", description: "Dot colour. Defaults to HeiGin brand." },
    ],
  },
  {
    slug: "icon-cloud",
    title: "Rotating icon cloud",
    description:
      "A 3-D cloud of logo chips, placed on a Fibonacci sphere and rotated with CSS transforms. Chips stay upright and scale/fade with their depth so the sphere reads clearly. No three.js — the demo uses hand-drawn SVG glyphs so there is no external image dependency.",
    group: "Marketing",
    demo: IconCloudDemo,
    source: read("IconCloud"),
    props: [
      { name: "icons", type: "CloudIcon[]", description: "List of chips. Each entry is { id, label, node }." },
      { name: "size", type: "number", defaultValue: "320", description: "Cloud diameter in CSS px." },
      { name: "rotationSeconds", type: "number", defaultValue: "24", description: "Rotation period." },
      { name: "paused", type: "boolean", defaultValue: "false", description: "Hold the cloud still." },
      { name: "label", type: "string", description: "Accessible description of the cloud." },
    ],
  },
  {
    slug: "flicker-grid",
    title: "Flickering grid with shapes",
    description:
      "A grid of flickering dots that reveals an uploaded silhouette. Dark pixels of the uploaded image count as 'inside' and glow brighter. A magnetic cursor response pushes nearby cells to peak opacity. File picker validates type and 1.5 MB size; object URLs are revoked on unmount.",
    group: "Uploads",
    demo: FlickerGridDemo,
    source: read("FlickerGrid"),
    props: [
      { name: "width", type: "number", defaultValue: "480", description: "Canvas width in CSS px." },
      { name: "height", type: "number", defaultValue: "320", description: "Canvas height in CSS px." },
      { name: "squareSize", type: "number", defaultValue: "4", description: "Cell size." },
      { name: "gridGap", type: "number", defaultValue: "6", description: "Space between cells." },
      { name: "maxOpacity", type: "number", defaultValue: "0.9", description: "Peak opacity of lit cells." },
      { name: "flickerChance", type: "number", defaultValue: "0.1", description: "Per-frame chance a cell re-rolls." },
      { name: "magnetRadius", type: "number", defaultValue: "90", description: "Cursor influence radius; 0 disables." },
      { name: "shapeSrc", type: "string", description: "Image URL or object URL to use as a mask." },
    ],
  },
  {
    slug: "glyph-matrix",
    title: "Rotating glyph matrix",
    description:
      "A low-contrast background matrix of small glyphs that cycles between forms: random noise, typed text, and uploaded silhouettes. Each form is sampled to the same grid so transitions morph character by character.",
    group: "Uploads",
    demo: GlyphMatrixDemo,
    source: read("GlyphMatrix"),
    props: [
      { name: "width", type: "number", defaultValue: "480", description: "Canvas width in CSS px." },
      { name: "height", type: "number", defaultValue: "320", description: "Canvas height in CSS px." },
      { name: "cellSize", type: "number", defaultValue: "14", description: "Glyph cell size." },
      { name: "charset", type: "string", description: "Characters drawn in each cell." },
      { name: "forms", type: "GlyphForm[]", description: "Random noise, typed text, or uploaded images to cycle through." },
      { name: "holdSeconds", type: "number", defaultValue: "3", description: "Seconds each form holds before morphing." },
      { name: "morphSeconds", type: "number", defaultValue: "1.2", description: "Morph duration between forms." },
      { name: "color", type: "string", description: "Glyph colour." },
    ],
  },
  {
    slug: "image-stream-hero",
    title: "Image-stream hero",
    description:
      "Mirrored image rails receding to a central vanishing point. Each image is repeated across both rails on staggered animation delays so the stream stays continuous. Upload wrapper supports add, remove, reorder, with object-URL cleanup.",
    group: "Uploads",
    demo: ImageStreamHeroDemo,
    source: read("ImageStreamHero"),
    flushStage: true,
    props: [
      { name: "images", type: "string[]", description: "Image URLs rendered on the rails." },
      { name: "height", type: "number", defaultValue: "420", description: "Rail height in px." },
      { name: "cardSize", type: "number", defaultValue: "0.18", description: "Card width as ratio of rail width." },
      { name: "speed", type: "number", defaultValue: "24", description: "Seconds per card traversal." },
      { name: "curve", type: "number", defaultValue: "0.1", description: "Rail curve amplitude ratio of height." },
    ],
  },
  {
    slug: "live-waveform",
    title: "Live waveform",
    description:
      "A microphone-driven waveform with mutually exclusive active/listening and processing states, in static or scrolling display. Uses the Web Audio API; opens the mic only when active is true and closes the stream + context on unmount or when active flips off.",
    group: "Agent UI",
    demo: LiveWaveformDemo,
    source: read("LiveWaveform"),
    props: [
      { name: "active", type: "boolean", description: "Opens the microphone when true." },
      { name: "processing", type: "boolean", defaultValue: "false", description: "Shows a procedural shimmer; mutually exclusive with active." },
      { name: "mode", type: '"static" | "scrolling"', defaultValue: '"static"', description: "Static paints in place; scrolling shifts history leftward." },
      { name: "height", type: "number", defaultValue: "80", description: "Visible height." },
      { name: "barWidth", type: "number", defaultValue: "3", description: "Bar width in px." },
      { name: "barGap", type: "number", defaultValue: "2", description: "Gap between bars." },
      { name: "fadeEdges", type: "boolean", defaultValue: "true", description: "Fade left and right edges." },
      { name: "barColor", type: "string", description: "Bar colour." },
      { name: "historySize", type: "number", defaultValue: "120", description: "Scrolling-mode history length." },
      { name: "onError", type: "(error: Error) => void", description: "Called when mic access fails." },
    ],
  },
  {
    slug: "conversation-bar",
    title: "Agent conversation bar",
    description:
      "A compact pill with a status indicator, agent name, live waveform, mute toggle and start/end button. The UI is standalone — pass status and the start/end callbacks to any voice-agent SDK (such as ElevenLabs' useConversation hook) in the parent. The waveform reuses the Live waveform component above.",
    group: "Agent UI",
    demo: ConversationBarDemo,
    source: read("ConversationBar"),
    props: [
      { name: "status", type: '"idle" | "connecting" | "connected" | "listening" | "speaking" | "error"', defaultValue: '"idle"', description: "Session status; drives the dot colour and the waveform." },
      { name: "agentName", type: "string", defaultValue: '"Agent"', description: "Title on the left of the bar." },
      { name: "caption", type: "React.ReactNode", description: "Overrides the auto-generated caption." },
      { name: "onStart", type: "() => void | Promise<void>", description: "Called when the user starts the session." },
      { name: "onEnd", type: "() => void", description: "Called when the user ends the session." },
      { name: "onMuteChange", type: "(muted: boolean) => void", description: "Called when the user toggles mute." },
    ],
  },
  {
    slug: "cursor-particles",
    title: "Cursor-reactive particles",
    description:
      "Canvas particles that attract to or repel from the pointer with spring-back easing. Honours prefers-reduced-motion with a single static frame. Takes children so you can lay a title on top.",
    group: "Marketing",
    demo: CursorParticlesDemo,
    source: read("CursorParticles"),
    props: [
      { name: "mode", type: '"attract" | "repel"', defaultValue: '"repel"', description: "How particles react to the cursor." },
      { name: "count", type: "number", defaultValue: "90", description: "Particle population." },
      { name: "radius", type: "number", defaultValue: "140", description: "Influence radius in CSS px." },
      { name: "force", type: "number", defaultValue: "0.6", description: "Peak force applied inside the radius." },
      { name: "damping", type: "number", defaultValue: "0.14", description: "Per-frame velocity decay (0–1)." },
      { name: "height", type: "number", defaultValue: "320", description: "Canvas area height." },
      { name: "color", type: "string", description: "Particle colour; defaults to the HeiGin brand." },
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
