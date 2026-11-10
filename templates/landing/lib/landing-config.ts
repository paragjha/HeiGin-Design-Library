import { Calendar, FileText, Mail, MessageCircle, Table, Video, Zap, type LucideIcon } from "lucide-react";

/**
 * Everything a buyer edits lives in this file: brand, copy, links, logos,
 * data and which sections render. Components read from `landingConfig` by
 * default and also accept the same slice as a `content` prop, so a single
 * section can be dropped into another page with its own content.
 *
 * Every logo, quote and company below is a placeholder. Replace them with
 * assets and wording you have the right to publish.
 */

export interface LinkItem {
  label: string;
  href: string;
}

export interface NavItem extends LinkItem {
  description?: string;
}

export interface NavFeature {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
  /** Optional featured tile on the left of the dropdown panel. */
  feature?: NavFeature;
}

export interface LogoItem {
  name: string;
  /** Image URL. Omit to render a monogram tile. */
  logo?: string;
}

export interface IntegrationItem {
  name: string;
  /** Image URL for a brand mark you are licensed to show. */
  logo?: string;
  /** Generic icon used when no logo is supplied. */
  icon?: LucideIcon;
}

export type WorkflowScene = "meeting-context" | "follow-up-draft" | "deal-brief" | "stalled-account";
export type DeepDiveScene = "sales-context" | "follow-ups" | "early-signals";
export type PostThumb = "proposal" | "queue" | "approval";

export interface WorkflowCardContent {
  eyebrow: string;
  title: string;
  description: string;
  scene: WorkflowScene;
}

export interface DeepDiveContent {
  number: string;
  title: string;
  description: string;
  scene: DeepDiveScene;
  tone?: "white" | "tint";
}

export interface PostContent {
  tag: string;
  title: string;
  summary: string;
  /** Free text under the summary: a date, a read time. */
  meta: string;
  href: string;
  /** Coded animated thumbnail. Omit to show the backdrop with the title over it. */
  thumb?: PostThumb;
}

export interface TestimonialContent {
  company: string;
  role: string;
  logo?: string;
  year: string;
  quote: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export type SectionId =
  | "hero"
  | "logoStrip"
  | "workflows"
  | "integrations"
  | "deepDives"
  | "newsroom"
  | "testimonials"
  | "faq"
  | "finalCta";

export interface LandingConfig {
  brand: {
    name: string;
    /** Image URL for your mark. Omit to render a monogram tile. */
    logoSrc?: string;
    homeHref: string;
  };
  theme: {
    /** Artwork behind the hero, cards and CTA banner. Omit for the built-in gradient. */
    backdropImage?: string;
  };
  /** Sections render in this order. Remove an id to hide that section. */
  sections: SectionId[];
  announcement: LinkItem | null;
  header: {
    nav: (NavGroup | NavItem)[];
    signIn: LinkItem | null;
    cta: LinkItem;
  };
  hero: {
    title: string;
    description: string;
    primaryCta: LinkItem;
    secondaryCta?: LinkItem;
  };
  logoStrip: {
    label: string;
    logos: LogoItem[];
  };
  workflows: {
    eyebrow: string;
    title: string;
    description: string;
    cards: WorkflowCardContent[];
  };
  integrations: {
    eyebrow: string;
    title: string;
    description: string;
    link?: LinkItem;
    note?: string;
    items: IntegrationItem[];
  };
  deepDives: DeepDiveContent[];
  newsroom: {
    eyebrow: string;
    title: string;
    link?: LinkItem;
    posts: PostContent[];
  };
  testimonials: {
    badge: string;
    title: string;
    titleMuted?: string;
    cta?: LinkItem;
    items: TestimonialContent[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: FaqItem[];
  };
  finalCta: {
    title: string;
    description: string;
    primary: LinkItem;
    secondary?: LinkItem;
  };
  footer: {
    tagline: string;
    cta?: LinkItem;
    groups: { label: string; items: LinkItem[] }[];
    legalNote?: string;
    /** Optional badge image under the tagline (an award, a launch badge). */
    badge?: { href: string; src: string; alt: string };
  };
}

export const landingConfig: LandingConfig = {
  brand: {
    name: "Acme",
    homeHref: "/",
  },
  theme: {},
  sections: [
    "hero",
    "logoStrip",
    "workflows",
    "integrations",
    "deepDives",
    "newsroom",
    "testimonials",
    "faq",
    "finalCta",
  ],
  announcement: { label: "Sign up for the pilot program", href: "/contact" },
  header: {
    nav: [
      {
        label: "Product",
        feature: {
          eyebrow: "Acme",
          title: "The connected customer workspace.",
          body: "Pipeline, inbox, quotes and tasks on one record, so every proposal becomes work your team can finish.",
          href: "/product",
          cta: "Explore the product",
        },
        items: [
          { label: "Overview", href: "/product", description: "The connected customer workspace" },
          { label: "Agents", href: "/agents", description: "Specialised agents, each with one job" },
          { label: "Integrations", href: "/integrations", description: "Connect the tools you already use" },
        ],
      },
      {
        label: "Solutions",
        items: [
          { label: "Use cases", href: "/use-cases", description: "The problems the product is built around" },
          { label: "Teams", href: "/solutions", description: "Team shapes we serve today" },
        ],
      },
      {
        label: "Resources",
        items: [
          { label: "Blog", href: "/blog", description: "Writing from the team" },
          { label: "About", href: "/about", description: "Why we are building this" },
        ],
      },
      { label: "Pricing", href: "/pricing" },
    ],
    signIn: { label: "Sign in", href: "/login" },
    cta: { label: "Book a call", href: "/contact" },
  },
  hero: {
    title: "Stop losing deals to missed follow-ups.",
    description:
      "Acme brings every customer signal to one timeline, drafts the next step, and keeps your team in control.",
    primaryCta: { label: "Start free", href: "/signup" },
    secondaryCta: { label: "See pricing", href: "/pricing" },
  },
  logoStrip: {
    label: "Built with pilot teams",
    logos: [{ name: "Customer One" }, { name: "Customer Two" }, { name: "Customer Three" }],
  },
  workflows: {
    eyebrow: "Specialized workflows",
    title: "Workflows Acme runs today.",
    description: "Each one picks up where a rep would have run out of hours in the week.",
    cards: [
      {
        eyebrow: "01 · Context",
        title: "Meeting context, on the record",
        description: "Calls and notes attach themselves to the customer timeline, with their source visible.",
        scene: "meeting-context",
      },
      {
        eyebrow: "02 · Follow-ups",
        title: "Drafts, ready for a human",
        description: "The agent writes the reply from the discussed context. Customer-facing actions wait for approval.",
        scene: "follow-up-draft",
      },
      {
        eyebrow: "03 · Briefs",
        title: "A brief for the next conversation",
        description: "Before a meeting, see what matters: last touch, open asks, the suggested next step.",
        scene: "deal-brief",
      },
      {
        eyebrow: "04 · Early signals",
        title: "Quiet accounts, surfaced in time",
        description: "Stalled deals and silent customers are flagged while the week can still move them.",
        scene: "stalled-account",
      },
    ],
  },
  integrations: {
    eyebrow: "Integrations",
    title: "Works with the tools your team already uses.",
    description: "Conversations, calendars and docs feed context in.",
    link: { label: "See every integration", href: "/integrations" },
    note: "Replace these with the integrations you support. Add a logo only where you have the right to show the mark.",
    items: [
      { name: "Email", icon: Mail },
      { name: "Meetings", icon: Video },
      { name: "Chat", icon: MessageCircle },
      { name: "Calendar", icon: Calendar },
      { name: "Docs", icon: FileText },
      { name: "CSV import", icon: Table },
      { name: "Automation", icon: Zap },
    ],
  },
  deepDives: [
    {
      number: "01",
      title: "Sales context in one place",
      description:
        "Bring conversations, meetings and customer details together so the team sees the full relationship at a glance, not scattered across six tabs.",
      scene: "sales-context",
      tone: "white",
    },
    {
      number: "02",
      title: "Follow-ups that keep moving",
      description:
        "Surface the open loops across your accounts and prepare timely, context-aware next steps. Customer-facing actions are reviewed before they go out.",
      scene: "follow-ups",
      tone: "tint",
    },
    {
      number: "03",
      title: "Early signals on deals and customers",
      description:
        "Stalled deals and quiet accounts are brought to the team's attention while there is still time to act, with the reason attached.",
      scene: "early-signals",
      tone: "white",
    },
  ],
  newsroom: {
    eyebrow: "Newsroom",
    title: "Writing from the Acme team.",
    link: { label: "View all", href: "/blog" },
    posts: [
      {
        tag: "Primer",
        title: "What is an agentic CRM?",
        summary: "Why systems of record need a second job: moving work forward.",
        meta: "7 min read",
        href: "/blog/what-is-an-agentic-crm",
        thumb: "proposal",
      },
      {
        tag: "Sales workflows",
        title: "Why follow-ups slip, and how to stop it.",
        summary: "Open loops hide in the week. Surface them before they cool.",
        meta: "7 min read",
        href: "/blog/why-follow-ups-slip",
        thumb: "queue",
      },
      {
        tag: "Design",
        title: "How we think about agent trust.",
        summary: "Permissions, approvals and an audit log: the real guardrails.",
        meta: "8 min read",
        href: "/blog/agent-trust",
        thumb: "approval",
      },
    ],
  },
  testimonials: {
    badge: "Testimonials",
    title: "Early teams, real pipelines.",
    titleMuted: "Here's what they say.",
    cta: { label: "Talk to us", href: "/contact" },
    items: [
      {
        company: "Customer One",
        role: "Pilot team",
        year: "2026",
        quote: "Placeholder quote. Replace it with wording your customer has approved in writing.",
      },
      {
        company: "Customer Two",
        role: "Pilot team",
        year: "2026",
        quote: "A second placeholder. Keep quotes short, specific and signed off by the person quoted.",
      },
    ],
  },
  faq: {
    eyebrow: "Good to know",
    title: "Frequently asked questions.",
    items: [
      {
        q: "What does Acme do?",
        a: "Answer in two or three sentences. Say what the product does, who it is for, and what changes for them.",
      },
      {
        q: "How is it different from what we use today?",
        a: "Name the one difference that matters most to your buyer and back it with something they can check.",
      },
      {
        q: "Which tools does it connect to?",
        a: "List what is live today separately from what is planned, so nobody is surprised after signing up.",
      },
      {
        q: "Can agents take actions automatically?",
        a: "Describe the approval model plainly: what runs on its own, what waits for a person, and where it is logged.",
      },
      {
        q: "Can we import our existing data?",
        a: "Explain the import path and how long it usually takes.",
      },
      {
        q: "How do we get access?",
        a: "Tell people the next step and what happens after they take it.",
      },
    ],
  },
  finalCta: {
    title: "Give every customer relationship a clear next step.",
    description: "Book a 30-minute walkthrough on your own workflow, or apply for the pilot.",
    primary: { label: "Book a call", href: "/contact" },
    secondary: { label: "Apply for the pilot", href: "/contact" },
  },
  footer: {
    tagline: "Customer relationships that never slip through the cracks.",
    cta: { label: "Talk to us", href: "/contact" },
    groups: [
      {
        label: "Product",
        items: [
          { label: "Overview", href: "/product" },
          { label: "Integrations", href: "/integrations" },
          { label: "Pricing", href: "/pricing" },
          { label: "Security", href: "/security" },
        ],
      },
      {
        label: "Solutions",
        items: [
          { label: "Use cases", href: "/use-cases" },
          { label: "Teams", href: "/solutions" },
        ],
      },
      {
        label: "Company",
        items: [
          { label: "About", href: "/about" },
          { label: "Blog", href: "/blog" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        label: "Legal",
        items: [
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
        ],
      },
    ],
  },
};

/**
 * Called when a primary call-to-action is clicked, with where on the page it
 * sits ("hero", "header", "final-cta"). A no-op until you send it somewhere.
 */
export function trackCta(location: string): void {
  void location;
}
