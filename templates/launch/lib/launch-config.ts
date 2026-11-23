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
    languages: ["EN", "ES"],
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
