/**
 * Everything the motion sections say, link to and show. Edit this file to make them yours:
 * components read from here and hold no copy. Image lists ship empty, so the download contains
 * no artwork; empty slots draw a soft gradient until you add your own photos or screenshots.
 */
export const motionConfig = {
  brand: {
    name: "HeiGin",
    /** Leave unset to use the HeiGin mark from @heigin/ui; set a path to use your own logo. */
    logoSrc: undefined as string | undefined,
    href: "/",
  },

  /** A header that sits wide over the hero and folds into a floating pill once the page scrolls. */
  navbar: {
    links: [
      { label: "Product", href: "#product" },
      { label: "Agents", href: "#agents" },
      { label: "Pricing", href: "#pricing" },
      { label: "Docs", href: "#docs" },
    ],
    cta: { label: "Get started", href: "#start" },
    /** Pixels of scroll before the header folds; it opens again a little above this. */
    threshold: 80,
    /** Gap between the folded pill and the top of the window, in pixels. */
    offset: 12,
  },

  /** Plan cards with a monthly/yearly switch: prices roll digit by digit, a savings chip pops in. */
  pricing: {
    eyebrow: "Pricing",
    title: "Plans that grow with your team",
    currency: "$",
    monthlyLabel: "Monthly",
    yearlyLabel: "Yearly",
    savingsLabel: "Save 17%",
    defaultPeriod: "monthly" as "monthly" | "yearly",
    plans: [
      {
        name: "Starter",
        monthly: 29,
        yearly: 290,
        popular: false,
        features: ["Shared inbox for email and WhatsApp", "Pipeline and deal stages", "Up to 3 seats", "Community support"],
        cta: { label: "Start with Starter", href: "#start" },
      },
      {
        name: "Growth",
        monthly: 79,
        yearly: 790,
        popular: true,
        features: ["Everything in Starter", "Agents that draft replies", "Approvals and audit log", "Up to 15 seats", "Priority support"],
        cta: { label: "Start with Growth", href: "#start" },
      },
      {
        name: "Scale",
        monthly: 199,
        yearly: 1990,
        popular: false,
        features: ["Everything in Growth", "Custom agent workflows", "SSO and roles", "Unlimited seats", "A named success manager"],
        cta: { label: "Talk to sales", href: "#sales" },
      },
    ],
  },

  /** A stack of cards that holds the screen while you scroll; each new card covers the last. */
  stack: {
    ariaLabel: "Product areas",
    cards: [
      { label: "Inbox", alt: "" },
      { label: "Pipeline", alt: "" },
      { label: "Agents", alt: "" },
      { label: "Approvals", alt: "" },
      { label: "Reports", alt: "" },
    ] as { label: string; alt: string; src?: string }[],
  },

  /** Cards fly in from deep inside the page around a clear centre that holds the headline. */
  flyIn: {
    /** Line breaks set the lines that rise in one by one. */
    headline: "Every customer.\nOne calm inbox.",
    support: "WhatsApp, email and calls in one place, with agents that draft the replies for you to approve.",
    /** Decorative cards (hidden from screen readers), so they need no alt text. */
    items: [] as { src: string; size: "sm" | "md" | "lg"; hideMobile?: boolean }[],
    /** Cards drawn when `items` is empty: a size per slot. */
    placeholders: ["lg", "md", "sm", "lg", "md", "sm", "md", "lg", "sm", "md", "lg", "sm"] as ("sm" | "md" | "lg")[],
  },

  /** A how-it-works row: a bead draws the line as you scroll and each step lights up as it is reached. */
  process: {
    ariaLabel: "How it works",
    steps: [
      { title: "Connect", text: "Bring WhatsApp, email and calls into one shared inbox.", image: undefined as string | undefined, alt: "" },
      { title: "Triage", text: "Agents sort every thread and draft the next reply.", image: undefined as string | undefined, alt: "" },
      { title: "Decide", text: "Pick a branch with a number key, or write your own answer.", image: undefined as string | undefined, alt: "" },
      { title: "Close", text: "Follow every deal from the first message to the signed quote.", image: undefined as string | undefined, alt: "" },
    ],
  },
};

export type MotionConfig = typeof motionConfig;
