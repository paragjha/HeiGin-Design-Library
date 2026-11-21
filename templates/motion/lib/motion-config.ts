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

  /** A statement that rises in line by line the first time it scrolls into view. Strong parts read in full ink, the rest muted. */
  textReveal: {
    segments: [
      { text: "HeiGin keeps every customer conversation in one place,", strong: true },
      { text: "and its agents sort each thread, draft the reply and wait for your yes before anything is sent." },
    ] as { text: string; strong?: boolean }[],
  },

  /** A list of names that brightens around the pointer like a lens, with a photo for the nearest one. */
  hoverIndex: {
    label: "Inside HeiGin",
    ariaLabel: "Product areas",
    /** The photo card is decorative (hidden from screen readers), so images need no alt text. */
    items: [
      { label: "Inbox", href: "#inbox" },
      { label: "Approvals", href: "#approvals" },
      { label: "Deals", href: "#deals" },
      { label: "Contacts", href: "#contacts" },
      { label: "Reports", href: "#reports" },
      { label: "Timeline", href: "#timeline" },
      { label: "Tasks", href: "#tasks" },
      { label: "Workspaces", href: "#workspaces" },
      { label: "Records", href: "#records" },
      { label: "Views", href: "#views" },
      { label: "Onboarding", href: "#onboarding" },
      { label: "Settings", href: "#settings" },
    ] as { label: string; href: string; image?: string }[],
  },

  /** A gallery that holds the screen while you scroll: each photo moves up from a corner to take the centre. */
  diagonal: {
    headline: ["One deal,", "start to finish"],
    photos: [
      { title: "Monday", text: "A question lands on WhatsApp and an agent drafts the answer", emphasis: "in under a minute." },
      { title: "Tuesday", text: "The lead moves to Qualified, with", emphasis: "the whole thread attached." },
      { title: "Wednesday", text: "A quote goes out after", emphasis: "one press of Approve." },
      { title: "Thursday", text: "Follow-ups are booked, so", emphasis: "nobody has to remember them." },
      { title: "Friday", text: "The quote comes back signed and", emphasis: "the deal moves to Won." },
    ] as { title: string; text: string; emphasis?: string; src?: string; alt?: string }[],
  },

  /** A feature tile that opens a detail sheet rising from the bottom of the window. */
  featureDialog: {
    label: "Agents, 01",
    title: "Approvals before anything is sent",
    image: undefined as string | undefined,
    alt: "",
    sheet: {
      title: "Nothing leaves without your yes",
      text: "Every reply an agent drafts waits in one queue. Read it, change it or approve it with a single key, and the thread moves on.",
      cta: { label: "See how approvals work", href: "#approvals" },
      media: [{ alt: "" }, { alt: "" }] as { src?: string; alt: string }[],
      stats: [
        { value: "1 key", label: "To approve a draft" },
        { value: "Every step", label: "Kept in the audit log" },
        { value: "0", label: "Messages sent without approval" },
      ],
      banner: { alt: "" } as { src?: string; alt: string },
      outro: "Built for teams who answer customers all day and still want the last word.",
    },
  },

  /** A conveyor of square photos on one baseline that shrink as they travel; drag it, scroll past it or step with the arrows. */
  scaleSlider: {
    ariaLabel: "Photo slider",
    slides: [{ alt: "" }, { alt: "" }, { alt: "" }, { alt: "" }, { alt: "" }, { alt: "" }, { alt: "" }, { alt: "" }] as { src?: string; alt: string }[],
  },

  /** A menu button that sweeps open a drawer; hovering a category opens a second panel beside it. */
  drawer: {
    menuLabel: "Menu",
    closeLabel: "Close",
    primary: [
      {
        label: "Product",
        href: "#product",
        items: [
          { label: "Inbox", href: "#inbox" },
          { label: "Pipeline", href: "#pipeline" },
          { label: "Agents", href: "#agents" },
          { label: "Approvals", href: "#approvals" },
        ],
      },
      {
        label: "Solutions",
        href: "#solutions",
        items: [
          { label: "Sales teams", href: "#sales" },
          { label: "Support", href: "#support" },
          { label: "Agencies", href: "#agencies" },
          { label: "Clinics", href: "#clinics" },
        ],
      },
      {
        label: "Resources",
        href: "#resources",
        items: [
          { label: "Docs", href: "#docs" },
          { label: "Templates", href: "#templates" },
          { label: "Changelog", href: "#changelog" },
          { label: "Guides", href: "#guides" },
        ],
      },
      {
        label: "Company",
        href: "#company",
        items: [
          { label: "About", href: "#about" },
          { label: "Careers", href: "#careers" },
          { label: "Contact", href: "#contact" },
          { label: "Press", href: "#press" },
        ],
      },
    ],
    explore: { label: "Explore all", href: "#product" },
    cards: [
      { label: "Agents", href: "#agents", alt: "" },
      { label: "Templates", href: "#templates", alt: "" },
    ] as { label: string; href: string; src?: string; alt: string }[],
    footer: [
      { label: "Pricing", href: "#pricing" },
      { label: "Contact", href: "#contact" },
    ],
  },
};

export type MotionConfig = typeof motionConfig;
