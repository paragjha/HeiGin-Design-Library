import type { ServiceName } from "@/components/heroes/service-logos";

/**
 * Everything the hero templates say and link to. Edit this file to make them yours: the brand,
 * the copy, the links and which integrations appear. Components read from here and hold no copy.
 */
export const heroesConfig = {
  brand: {
    name: "HeiGin",
    /** Leave unset to use the HeiGin mark from @heigin/ui; set a path to use your own logo. */
    logoSrc: undefined as string | undefined,
    href: "/",
  },
  nav: [
    { label: "Product", href: "#product" },
    { label: "Agents", href: "#agents" },
    { label: "Integrations", href: "#integrations" },
    { label: "Pricing", href: "#pricing" },
    { label: "Docs", href: "#docs" },
  ],
  cta: {
    primary: { label: "Get started", href: "#start" },
    secondary: { label: "Book a demo", href: "#demo" },
    signIn: { label: "Log in", href: "#login" },
  },

  /**
   * A studio portfolio: a tilted wall of case-study covers that opens into "Selected work".
   * The case studies below are sample content. Replace the clients, logos and projects with your
   * own work before you publish; real logos should only appear for clients you have worked with.
   */
  wall: {
    nav: [
      { label: "Work", href: "#work" },
      { label: "Services", href: "#services" },
      { label: "Studio", href: "#studio" },
      { label: "Journal", href: "#journal" },
    ],
    cta: { label: "Book a call", href: "#contact" },
    cursorLabel: "Book a call",
    cardLabel: "View case study",
    hint: "Move to look around, scroll to open",
    pauseLabel: "Pause motion",
    resumeLabel: "Play motion",
    sheetTitle: "Selected work",
    sheetIntro: "Brand, product and launch work for teams that sweat the details. A few favourites from the last two years.",
    /** Cover photos, used in turn by the case studies. Leave empty for generated gradient covers. */
    covers: [] as string[],
    /** Short lines set as type tiles between the covers. */
    taglines: ["Brand.\nProduct.\nMotion.", "Selected work\n’19 – ’26", "Small studio,\nbig launches."],
    caseStudies: [
      { client: "Notion", logo: "notion", project: "Onboarding that teaches itself", services: "Product design · Motion", year: "2026" },
      { client: "Slack", logo: "slack", project: "A launch film in four colours", services: "Campaign · 3D", year: "2026" },
      { client: "Linear", logo: "linear", project: "A quieter changelog", services: "Brand · Web", year: "2026" },
      { client: "Stripe", logo: "stripe", project: "Checkout for forty markets", services: "Product · Localisation", year: "2025" },
      { client: "Figma", logo: "figma", project: "Keynote stage visuals", services: "Event · Motion", year: "2025" },
      { client: "OpenAI", logo: "openai", project: "A help centre that answers back", services: "Content design · Web", year: "2025" },
      { client: "GitHub", logo: "github", project: "Annual report, in code", services: "Editorial · Data", year: "2025" },
      { client: "Zendesk", logo: "zendesk", project: "Support, redrawn", services: "Illustration · Brand", year: "2024" },
      { client: "HubSpot", logo: "hubspot", project: "A design system for 40 teams", services: "Design systems", year: "2024" },
      { client: "Zapier", logo: "zapier", project: "Automation, explained in a minute", services: "Explainer · Motion", year: "2024" },
    ] as { client: string; logo: ServiceName; project: string; services: string; year: string }[],
  },

  /** Light hero with a product window over a drifting archive collage. */
  archive: {
    title: "Meet HeiGin, the CRM whose agents do the follow-ups",
    subtitle: "HeiGin agents read the inbox, update the pipeline and draft every reminder, then wait for your approval before anything goes out.",
    plate: { title: "Meet HeiGin Agents", detail: "Approve once, they handle the rest", href: "#agents" },
  },

  /** Dark hero with a tilted dashboard that settles into place. */
  tracer: {
    title: "Every agent run, accounted for",
    subtitle: "See what each HeiGin agent did, what it cost and how long it took, from the first message to the approved send.",
    copyPrompt: {
      label: "Copy agent prompt",
      copied: "Copied",
      text: "Connect this project to HeiGin: install @heigin/ui, wrap each agent call with the HeiGin tracer, and set HEIGIN_KEY from your workspace settings.",
    },
    builtFor: "Built for the",
    models: ["claude", "openai", "gemini", "mistral"] as ServiceName[],
    worksWithLabel: "Works with the tools your team already uses",
    worksWith: ["slack", "hubspot", "salesforce", "gmail", "whatsapp", "notion", "stripe"] as ServiceName[],
  },
};

export type HeroesConfig = typeof heroesConfig;

/** Display names for the service marks, used as accessible names and labels. */
export const serviceLabels: Record<ServiceName, string> = {
  slack: "Slack",
  hubspot: "HubSpot",
  salesforce: "Salesforce",
  gmail: "Gmail",
  whatsapp: "WhatsApp",
  googleCalendar: "Google Calendar",
  notion: "Notion",
  linear: "Linear",
  zapier: "Zapier",
  intercom: "Intercom",
  zendesk: "Zendesk",
  stripe: "Stripe",
  claude: "Claude",
  openai: "OpenAI",
  gemini: "Gemini",
  mistral: "Mistral",
  vercelAiSdk: "Vercel AI SDK",
  github: "GitHub",
  figma: "Figma",
  jira: "Jira",
  postgresql: "PostgreSQL",
  aws: "AWS",
};
