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

  /** Tilted wall of work, in the style of a studio portfolio. */
  wall: {
    cursorLabel: "Book a demo",
    cardLabel: "Open",
    hint: "Move to look around, scroll to open",
    pauseLabel: "Pause motion",
    resumeLabel: "Play motion",
    sheetTitle: "What HeiGin agents handle",
    integrations: ["slack", "hubspot", "salesforce", "gmail", "whatsapp", "googleCalendar", "notion", "linear", "zapier", "intercom", "zendesk", "stripe"] as ServiceName[],
    work: [
      { title: "Renewal reminders", detail: "Drafted, approved, sent on WhatsApp" },
      { title: "Lead triage", detail: "Scored and routed in 40 seconds" },
      { title: "Quote approvals", detail: "Discounts checked against policy" },
      { title: "Meeting follow-ups", detail: "Notes to tasks before you hang up" },
      { title: "Pipeline health", detail: "Stalled deals flagged every morning" },
      { title: "Invoice chasers", detail: "Polite, then firm, then a person" },
    ],
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
