/**
 * Everything the launch templates say, link to and show. Edit this file to make them yours:
 * components read from here and hold no copy. Image slots ship empty, so the download contains
 * no artwork; an empty slot draws a soft gradient until you add your own photo.
 */
export const launchConfig = {
  brand: {
    name: "HeiGin",
    /** Leave unset to use the HeiGin mark from @heigin/ui; set a path to use your own logo. */
    logoSrc: undefined as string | undefined,
    href: "/",
  },

  /**
   * A cream waitlist page: a row of app tiles around "yours", a headline whose highlighted words
   * swap when tapped, and an email form.
   */
  waitlist: {
    /** The two lines of the logotype; the first one sits on the highlighter. */
    logoLines: ["HeiGin", "Agents"] as [string, string],
    nav: [
      { label: "The agents", href: "#agents" },
      { label: "How it works", href: "#how" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    /** The button at the top right. "#join" scrolls to the form and puts the cursor in the email field. */
    cta: { label: "Join the waitlist", href: "#join" },
    /** Tile photos around the centre tile: three on the left, then three on the right. */
    tiles: [] as string[],
    tileLabel: "yours",
    /**
     * The headline, line by line. A string is plain text; a slot is a highlighted word that swaps
     * to its next option on a tap. Icons are lucide names from the set in launch-waitlist.tsx.
     * `mark` draws the brand mark and name inline.
     */
    headline: [
      ["Hire your first ", { slot: 0 }, " agent."],
      ["Trained on your own ", { slot: 1 }, ","],
      ["run with ", { mark: true }, " as your ", { slot: 2 }, "."],
    ] as ({ slot: number } | { mark: true } | string)[][],
    slots: [
      [
        { word: "sales", icon: "badge-dollar" },
        { word: "support", icon: "life-buoy" },
        { word: "follow-up", icon: "mail" },
        { word: "billing", icon: "receipt" },
      ],
      [
        { word: "playbook", icon: "pencil" },
        { word: "inbox", icon: "inbox" },
        { word: "pipeline", icon: "kanban" },
        { word: "tone", icon: "message" },
      ],
      [
        { word: "copilot", icon: "terminal" },
        { word: "closer", icon: "handshake" },
        { word: "night shift", icon: "moon" },
        { word: "second brain", icon: "lightbulb" },
      ],
    ] as { word: string; icon: WaitlistIcon }[][],
    hint: "Tap a highlighted word to swap it.",
    hintAfter: "Every combination still works. Keep going.",
    /** The paragraph under the headline. **Bold** marks emphasis; {mail} drops in the mail tile. */
    intro:
      "An early-access programme from the **HeiGin** team for putting your first CRM agent to work, the kind that drafts the reply and waits for your yes. Connect {mail} **Gmail**, WhatsApp or your helpdesk, then watch the queue clear.",
    placeholder: "name@company.com",
    submitLabel: "Join the waitlist",
    pendingLabel: "Joining…",
    successMessage: "You're on the list. We'll write when your seat opens.",
    errorMessage: "That didn't go through. Try again in a moment.",
    note: "The first three seats are free, and founding pricing holds for the first 30 teams.",
  },

  /** A changelog page: a date that sticks at the left while each release scrolls past. */
  changelog: {
    nav: [
      { label: "Product", href: "#product" },
      { label: "Agents", href: "#agents" },
      { label: "Enterprise", href: "#enterprise" },
      { label: "Pricing", href: "#pricing" },
      { label: "Resources", href: "#resources" },
    ],
    signIn: { label: "Sign in", href: "#signin" },
    contact: { label: "Contact sales", href: "#sales" },
    cta: { label: "Get started", href: "#start" },
    eyebrow: "Changelog",
    /** Sample records the live HeiGin panels in the figures show. */
    panels: {
      approval: {
        title: "Send the renewal quote to Northwind",
        reason: "The quote is 8% above last year's, and price changes need a person's approval.",
        requestedBy: "Billing agent",
        changes: [
          { field: "Stage", from: "Proposal", to: "Negotiation" },
          { field: "Amount", from: "$42,000", to: "$45,360" },
        ],
      },
      inbox: [
        { name: "Asha Rao", preview: "Can we move the demo to Thursday? The team is out tomorrow.", channel: "whatsapp", timeLabel: "2m", dateTime: "2026-11-12T09:58", unreadCount: 2 },
        { name: "Daniel Okafor", preview: "Draft ready: thanks for the order, here's your tracking link.", channel: "email", timeLabel: "14m", dateTime: "2026-11-12T09:46" },
        { name: "Lena Fischer", preview: "Missed call. The agent booked a callback for 3 pm.", channel: "missed_call", timeLabel: "1h", dateTime: "2026-11-12T09:00" },
      ],
      metrics: [
        { label: "Open pipeline", value: "$1.24M", trend: { direction: "up", label: "+12% this month", good: true } },
        { label: "Win rate", value: "31%", trend: { direction: "up", label: "+3 pts", good: true } },
        { label: "Days to close", value: "18", trend: { direction: "down", label: "-4 days", good: true } },
      ],
      timeline: [
        { kind: "agent", text: "**Follow-up agent** drafted a reply to Asha Rao", timeLabel: "9:58 am", dateTime: "2026-10-30T09:58" },
        { kind: "stage", text: "Deal moved from **Proposal** to **Negotiation**", timeLabel: "9:40 am", dateTime: "2026-10-30T09:40" },
        { kind: "call", text: "**Meera S** called Asha Rao for 12 minutes", timeLabel: "Yesterday", dateTime: "2026-10-29T16:20" },
      ],
    } as ChangelogPanels,
    /**
     * Newest first. Body paragraphs take **bold**. A figure shows a live HeiGin panel (`ui`) over
     * a backdrop photo (`image`); leave `image` empty for a plain grey backdrop.
     */
    entries: [
      {
        date: "Nov 24, 2026",
        dateTime: "2026-11-24",
        title: "Approvals inbox",
        body: [
          "HeiGin agents now send every outgoing change to one **approvals inbox**, so nothing leaves your workspace until a person says yes.",
          "Each request shows what the agent wants to change, why, and how far you already trust it. Approve, reject or undo from the same card.",
        ],
        figure: { ui: "approval", image: undefined as string | undefined },
        sections: [
          {
            title: "Trust rungs",
            body: [
              "**Rungs** set how much an agent may do alone. Rung 0 asks about everything; rung 3 only asks before money moves or a message reaches a customer.",
              "Rungs are per agent and per team, so a new support agent can start careful while your billing agent keeps its history.",
            ],
          },
        ],
      },
      {
        date: "Nov 12, 2026",
        dateTime: "2026-11-12",
        title: "A shared inbox for every channel",
        body: [
          "Email, WhatsApp, SMS and missed calls now land in **one list**, sorted by how long the customer has waited.",
          "Agents draft a reply for each thread as it arrives. Open one to edit the draft, or send it as it is.",
        ],
        figure: { ui: "inbox", image: undefined as string | undefined },
        sections: [
          {
            title: "Reply timers",
            body: ["Every thread carries its own clock. Threads close to your reply target rise to the top, and the agent tells you which ones it can't answer alone."],
          },
        ],
      },
      {
        date: "Oct 30, 2026",
        dateTime: "2026-10-30",
        title: "Pipeline numbers you can trust",
        body: [
          "The pipeline header now shows **open value, win rate and time to close**, recalculated each time a deal moves.",
          "Every number links to the deals behind it, so a surprise on Monday takes one click to explain.",
        ],
        figure: { ui: "metrics", image: undefined as string | undefined },
        sections: [
          {
            title: "Activity on every record",
            body: ["Calls, messages, stage changes and agent actions share one timeline per contact, newest first."],
            figure: { ui: "timeline", image: undefined as string | undefined },
          },
        ],
      },
    ] as ChangelogEntry[],
  },

  /** A blue closing call to action with a photo strip at its foot and hearts and messages rising from it. */
  cta: {
    title: "Follow-ups are now the cheapest sales channel you own",
    subtitle: "Start with your inbox. Connect the channels your customers already use, and see which conversations HeiGin can take off your plate.",
    primary: { label: "Get started", href: "#start" },
    secondary: { label: "Book a demo", href: "#demo" },
    /** Sample people for the avatar row; replace with real customers who agreed to be shown. */
    people: ["Priya Nair", "Tomás Ruiz", "Ama Owusu", "Jonas Berg", "Mei Lin", "Sam Carter"],
    proof: "Priya, Tomás and 1,200+ teams already reply with HeiGin",
    /** The photo along the foot of the section, toned to the blue. Leave empty for a darker band. */
    image: undefined as string | undefined,
    imageAlt: "",
  },

  /** A clean hero: a serif headline, two calls to action and a photo panel with a prompt that types itself. */
  hero: {
    nav: [
      { label: "Product", href: "#product", menu: true },
      { label: "Agents", href: "#agents" },
      { label: "Pricing", href: "#pricing" },
      { label: "Docs", href: "#docs", external: true },
      { label: "Blog", href: "#blog" },
    ],
    signIn: { label: "Log in", href: "#login" },
    signUp: { label: "Sign up", href: "#signup" },
    demo: { label: "Book a demo", href: "#demo" },
    announcement: { tag: "New", text: "Approvals inbox: HeiGin agents now wait for your yes.", href: "#changelog" },
    /** Words wrapped in *asterisks* are set in italic. */
    title: "The CRM for *teams* who\nsell with *agents*",
    subtitle: "Inbox, pipeline & follow-ups in one workspace.\nPriced by the seats you use, not your contacts.",
    /** The panel photo behind the prompt. Leave empty for a gradient. */
    image: undefined as string | undefined,
    imageAlt: "",
    /** The prompt types each of these in turn, then clears and starts the next. */
    prompts: [
      "Draft a follow-up for every deal that went quiet this week",
      "Move the Northwind renewal to negotiation and tell its owner",
      "Summarise yesterday's WhatsApp threads that still need a reply",
    ],
    features: [
      { title: "Agents", body: "Agents that read the inbox, update the pipeline and draft each reply.", link: { label: "Docs", href: "#docs-agents" } },
      { title: "MCP", body: "Give your coding agent HeiGin's components, tokens and setup guide.", link: { label: "Docs", href: "#docs-mcp" } },
      { title: "approvals.md", body: "Write down what agents may do alone. HeiGin asks before the rest.", link: { label: "Docs", href: "#docs-approvals" } },
    ],
  },

  /**
   * A dark open-roles list: open roles bright with an apply link, closed ones dimmed, and a hatch
   * that fades in behind the row under the pointer. The roles below are sample content.
   */
  careers: {
    nav: [
      { label: "Home", href: "#home" },
      { label: "Product", href: "#product" },
      { label: "Customers", href: "#customers" },
      { label: "People", href: "#people", current: true },
      { label: "Blog", href: "#blog" },
    ],
    contactLink: { label: "Contact us", href: "#contact" },
    /** Shown in the header with the number of open roles, e.g. "Hiring (3)". */
    hiringLabel: "Hiring",
    /**
     * The full-bleed banner at the top: the image redrawn as a grid of flickering pixels. Leave the
     * image unset for a grey grid; set banner to null to leave it out.
     */
    banner: { image: undefined as string | undefined } as { image?: string } | null,
    intro: {
      title: "People",
      paragraphs: [
        "We're building a CRM where the busywork belongs to agents and the judgement stays with people. A small team in Bengaluru and across time zones, making something we'd want to use ourselves.",
        "We keep it calm, curious and honest about what isn't working yet. Clear writing, careful craft, and a team that checks its own work before anyone else has to.",
      ],
    },
    /** Each value sticks while the next one slides over it. Add an image per value; photos show in black and white. */
    values: {
      eyebrow: "Our values",
      items: [
        {
          title: "Earn the yes",
          body: "Our agents wait for a person's approval before anything leaves the building, and so do we. We say what we want to change and why, and we take no for an answer when the reasons are good.",
        },
        {
          title: "Ship it, then sharpen it",
          body: "A small thing in a customer's hands teaches more than a big thing in a doc. We release early, watch what happens, and come back the next week to make it better.",
        },
        {
          title: "Leave it clearer",
          body: "Every handover, pull request and support reply should leave the next person with less to figure out. Plain words, real numbers, and notes written for whoever reads them at 2 am.",
        },
      ] as { title: string; body: string; image?: string }[],
    },
    /** Sample people: replace them with your team, with each person's permission, and add a photo per person. */
    crew: {
      title: "The crew",
      listLabel: "A–Z",
      joinLabel: "Join the crew",
      groups: [
        {
          name: "Leadership",
          people: [
            { name: "Asha Raman", role: "Co-founder, CEO", links: [{ label: "LinkedIn", href: "#" }, { label: "X", href: "#" }] },
            { name: "Dev Malhotra", role: "Co-founder, CTO", links: [{ label: "LinkedIn", href: "#" }, { label: "GitHub", href: "#" }] },
            { name: "Lena Fischer", role: "Head of Operations", links: [{ label: "LinkedIn", href: "#" }] },
          ],
        },
        {
          name: "Product and design",
          people: [
            { name: "Ines Duarte", role: "Design Lead", links: [{ label: "Dribbble", href: "#" }, { label: "LinkedIn", href: "#" }] },
            { name: "Kenji Watanabe", role: "Product Designer", links: [{ label: "LinkedIn", href: "#" }] },
            { name: "Maya Okafor", role: "Design Engineer", links: [{ label: "GitHub", href: "#" }, { label: "X", href: "#" }] },
            { name: "Rohan Iyer", role: "Product Manager", links: [{ label: "LinkedIn", href: "#" }] },
          ],
        },
        {
          name: "Engineering",
          people: [
            { name: "Sofia Marchetti", role: "Agent Engineer", links: [{ label: "GitHub", href: "#" }] },
            { name: "Arjun Nair", role: "Frontend Engineer", links: [{ label: "GitHub", href: "#" }, { label: "LinkedIn", href: "#" }] },
            { name: "Tom Becker", role: "Platform Engineer", links: [{ label: "GitHub", href: "#" }] },
            { name: "Nadia Haddad", role: "Data Engineer", links: [{ label: "LinkedIn", href: "#" }] },
          ],
        },
        {
          name: "Go-to-market",
          people: [
            { name: "Daniel Osei", role: "Solutions Engineer", links: [{ label: "LinkedIn", href: "#" }] },
            { name: "Chloé Martin", role: "Customer Success", links: [{ label: "LinkedIn", href: "#" }] },
            { name: "Ravi Shah", role: "Partnerships", links: [{ label: "LinkedIn", href: "#" }, { label: "X", href: "#" }] },
          ],
        },
      ] as { name: string; people: { name: string; role: string; links: { label: string; href: string }[]; photo?: string }[] }[],
    },
    /** A line break in the title sets where it wraps. */
    title: "Open\nroles",
    columns: { role: "Role", team: "Team", location: "Location" },
    applyLabel: "Apply now",
    closedLabel: "(closed)",
    /** Leave closed roles in the list, dimmed, or hide them. */
    showClosed: true,
    roles: [
      { title: "Founding Account Executive", team: "Go-to-market", location: "Remote", open: false },
      { title: "Solutions Engineer", team: "Go-to-market", location: "Bengaluru / Remote", href: "#careers/solutions-engineer", open: true },
      { title: "Customer Success Lead", team: "Go-to-market", location: "Remote (India)", open: false },
      { title: "Product Designer", team: "Design", location: "Remote", href: "#careers/product-designer", open: true },
      { title: "Brand Designer", team: "Design", location: "Remote", open: false },
      { title: "Design Engineer", team: "Design", location: "Bengaluru / Remote", open: false },
      { title: "Agent Engineer", team: "Engineering", location: "Remote", href: "#careers/agent-engineer", open: true },
      { title: "Frontend Engineer", team: "Engineering", location: "Remote (EU hours)", open: false },
      { title: "Data Engineer", team: "Engineering", location: "Remote", open: false },
      { title: "Developer Advocate", team: "Engineering", location: "Remote", open: false },
    ] as { title: string; team: string; location: string; href?: string; open: boolean }[],
    /** The band under the list. Set to null to leave it out. */
    contact: { eyebrow: "Contact", title: "Don't see your role?", email: "careers@heigin.com" } as { eyebrow: string; title: string; email: string } | null,
  },

  /**
   * A single-plan pricing page: add-on switches change the price, and a pile of 3D icons around
   * the card grows as they turn on. Prices are sample numbers; set your own before you publish.
   */
  pricing: {
    nav: [
      { label: "Docs", href: "#docs" },
      { label: "Blog", href: "#blog" },
      { label: "Company", href: "#company" },
      { label: "Community", href: "#community", external: true },
      { label: "Pricing", href: "#pricing", current: true },
    ],
    cta: { label: "Get started", href: "#start" },
    /** A line break in the title sets where it wraps. */
    title: "Pay for the work,\nnot the seats",
    /** **Bold** marks emphasis. */
    intro: "HeiGin doesn't charge per seat. A shared inbox for the whole team shouldn't cost more each time someone joins it. **Take 50% off your first year.**",
    currency: "$",
    period: "/month",
    /** List price per month before add-ons; the card shows it struck through, next to the discounted price. */
    base: 98,
    /** Share taken off the list price, 0–1. Set 0 to show one price. */
    discount: 0.5,
    addOns: [
      { id: "runs", label: "Unlimited agent runs", price: 96 },
      { id: "channels", label: "WhatsApp and phone channels", price: 58 },
      { id: "seats", label: "15+ workspace members", price: 78 },
    ],
    button: { label: "Try it free", href: "#start" },
    footnote: "*An agent run is each time an agent is asked to act: it reads a message, drafts a reply or updates a deal.",
    /**
     * The pile around the card. x and y place each icon's centre as a percentage of the stage,
     * size is in px at full width, and an icon with an addOn id appears only while that add-on is
     * on. Add a src per icon; icons without one draw a soft gradient tile.
     */
    icons: [
      { x: 22, y: 34, size: 150, rotate: -14 },
      { x: 31, y: 12, size: 120, rotate: 10 },
      { x: 45, y: 9, size: 110, rotate: -6 },
      { x: 63, y: 11, size: 130, rotate: 12 },
      { x: 78, y: 30, size: 140, rotate: -10 },
      { x: 20, y: 66, size: 150, rotate: 8 },
      { x: 80, y: 64, size: 130, rotate: 14 },
      { x: 30, y: 90, size: 120, rotate: -12 },
      { x: 72, y: 90, size: 130, rotate: 9 },
      { x: 36, y: 3, size: 104, rotate: 16, addOn: "runs" },
      { x: 15, y: 50, size: 110, rotate: -18, addOn: "runs" },
      { x: 52, y: 96, size: 116, rotate: 6, addOn: "runs" },
      { x: 71, y: 2, size: 104, rotate: -16, addOn: "channels" },
      { x: 86, y: 47, size: 120, rotate: 10, addOn: "channels" },
      { x: 23, y: 83, size: 110, rotate: 20, addOn: "channels" },
      { x: 54, y: 1, size: 98, rotate: -12, addOn: "seats" },
      { x: 84, y: 81, size: 110, rotate: -8, addOn: "seats" },
      { x: 14, y: 21, size: 96, rotate: 12, addOn: "seats" },
    ] as { src?: string; x: number; y: number; size: number; rotate: number; addOn?: string }[],
    faqTitle: "Pricing questions",
    faq: [
      { q: "How do the add-ons work?", a: "Turn on what you need and the monthly price includes it from your next invoice. Turn one off and it stops at the end of the month." },
      { q: "What counts as an agent run?", a: "Each time an agent is asked to act: it reads a new message, drafts a reply, updates a deal or follows a schedule. Approving a draft doesn't count as another run." },
      { q: "How long is a subscription?", a: "Monthly, with no minimum term. The first-year discount applies to each of the first twelve months." },
      { q: "Is there a plan for large teams?", a: "Yes. Larger teams get SSO, roles, an audit export and a named contact. Write to us and we'll price it with you." },
      { q: "How does HeiGin keep customer data safe?", a: "Data is encrypted in transit and at rest, agents only see the channels you connect, and every change an agent proposes waits for a person's approval." },
      { q: "Can someone help us set it up?", a: "Book a call and we'll connect your inbox, import your pipeline and set up your first agent with you." },
    ],
  },
};

export type WaitlistIcon =
  | "badge-dollar"
  | "life-buoy"
  | "mail"
  | "receipt"
  | "pencil"
  | "inbox"
  | "kanban"
  | "message"
  | "terminal"
  | "handshake"
  | "moon"
  | "lightbulb";

/** The live HeiGin panels a changelog figure can show. */
export type ChangelogUi = "approval" | "inbox" | "metrics" | "timeline";
export type ChangelogPanels = {
  approval: { title: string; reason: string; requestedBy: string; changes: { field: string; from?: string; to: string }[] };
  inbox: { name: string; preview: string; channel: "whatsapp" | "email" | "sms" | "missed_call"; timeLabel: string; dateTime: string; unreadCount?: number }[];
  metrics: { label: string; value: string; trend?: { direction: "up" | "down"; label: string; good?: boolean } }[];
  timeline: { kind: "agent" | "stage" | "call" | "message"; text: string; timeLabel: string; dateTime: string }[];
};
export type ChangelogFigure = { ui: ChangelogUi; image?: string };
export type ChangelogEntry = {
  date: string;
  dateTime: string;
  title: string;
  body: string[];
  figure?: ChangelogFigure;
  sections?: { title: string; body: string[]; figure?: ChangelogFigure }[];
};
