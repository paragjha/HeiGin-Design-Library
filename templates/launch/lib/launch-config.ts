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

  /**
   * Sample records for the live panels on the agents and platform pages (they also use
   * changelog.panels for the inbox, approval, metrics and timeline).
   */
  samples: {
    trail: {
      title: "Follow up with Asha Rao",
      agent: "Follow-up agent",
      steps: ["Read the WhatsApp thread", "Check the open quote", "Draft the reply", "Book the demo for Thursday"],
      approval: "Send the reply to Asha Rao on WhatsApp and book Thursday 11 am.",
    },
    pipeline: {
      stages: ["New", "Qualified", "Proposal", "Negotiation", "Won"],
      deals: [
        { name: "Northwind renewal", amount: 4536000, stage: "Negotiation" },
        { name: "Asha Rao, 12 seats", amount: 1150000, stage: "Proposal" },
        { name: "Kabir Mehta", amount: 480000, stage: "Qualified" },
      ],
    },
    tasks: [
      { title: "Call back Lena Fischer", due: "3 pm" },
      { title: "Send the renewal quote", due: "Today" },
      { title: "Demo with Asha Rao", due: "Thu" },
    ],
  },

  /**
   * A dark agents landing page: a product window of live agent runs over a photo, the channels it
   * reads, four jobs with small live demos, feature rows with live HeiGin panels, a trust grid and a
   * closing call to action. Every record shown is sample data.
   */
  agentsPage: {
    nav: [
      { label: "Product", href: "#product" },
      { label: "Agents", href: "#agents" },
      { label: "Pricing", href: "#pricing" },
      { label: "Docs", href: "#docs" },
    ],
    contact: { label: "Talk to us", href: "mailto:sales@heigin.com" },
    cta: { label: "Get started", href: "#start" },
    hero: {
      title: "Agents that work the inbox while you sell",
      text: "HeiGin's agents sort every thread, draft the reply and update the deal, then wait for your yes before anything goes out.",
      /** A prompt visitors can copy, for setting HeiGin up from their own AI tools. */
      prompt: { label: "Copy prompt", copied: "Copied", text: "Set up HeiGin for my sales team: connect our shared inbox, import the pipeline and turn on the follow-up agent with approvals." },
      /** The photo behind the product window. */
      image: undefined as string | undefined,
    },
    window: {
      workspace: "Northwind",
      title: "Follow-ups",
      text: "Replies, callbacks and quotes the agents are working on.",
      nav: ["Inbox", "Pipeline", "Agents", "Approvals", "Reports"],
      /** Runs that cycle through the table: the newest is always running, the rest settle. */
      runs: [
        { task: "Draft reply", customer: "Asha Rao", channel: "whatsapp", runtime: "38s", status: "sent" },
        { task: "Book callback", customer: "Lena Fischer", channel: "missed_call", runtime: "52s", status: "approved" },
        { task: "Send quote", customer: "Northwind", channel: "email", runtime: "1m 14s", status: "awaiting_approval" },
        { task: "Draft reply", customer: "Daniel Okafor", channel: "email", runtime: "21s", status: "sent" },
        { task: "Qualify lead", customer: "Priya Nair", channel: "web_form", runtime: "33s", status: "qualified" },
        { task: "Draft reply", customer: "Kabir Mehta", channel: "indiamart", runtime: "48s", status: "approved" },
      ] as { task: string; customer: string; channel: "whatsapp" | "email" | "sms" | "missed_call" | "web_form" | "indiamart"; runtime: string; status: "sent" | "approved" | "awaiting_approval" | "qualified" }[],
      metrics: [
        { label: "Replies drafted", value: "1,284" },
        { label: "Waiting for you", value: "6" },
      ],
    },
    channels: {
      title: "Reads the channels your customers already use",
      items: ["whatsapp", "email", "sms", "call", "web_form", "indiamart"] as ("whatsapp" | "email" | "sms" | "call" | "web_form" | "indiamart")[],
    },
    jobs: {
      title: "One inbox, built for every follow-up",
      items: [
        { title: "Reply", text: "Drafts an answer to every new message, in the customer's own channel.", link: { label: "Explore replies", href: "#inbox" } },
        { title: "Qualify", text: "Reads each lead and moves it along, so nobody sorts by hand.", link: { label: "Explore leads", href: "#leads" } },
        { title: "Follow up", text: "Books the callback and the reminder, and ticks them off when done.", link: { label: "Explore tasks", href: "#tasks" } },
        { title: "Close", text: "Moves the deal stage by stage as the conversation does.", link: { label: "Explore pipeline", href: "#pipeline" } },
      ],
    },
    features: [
      {
        title: "Every channel, one thread",
        text: "WhatsApp, email and missed calls land on the customer's record, sorted before anyone opens them.",
        link: { label: "See the inbox", href: "#inbox" },
        ui: "inbox" as const,
        image: undefined as string | undefined,
      },
      {
        title: "Agents that ask first",
        text: "Anything that reaches a customer or moves money waits as a card. Approve, change or reject it with one key.",
        link: { label: "See approvals", href: "#approvals" },
        ui: "approval" as const,
        image: undefined as string | undefined,
      },
      {
        title: "The same steps, every run",
        text: "Each task follows its steps in order and shows where it is, so you know what the agent is doing right now.",
        link: { label: "See agents", href: "#agents" },
        ui: "trail" as const,
        image: undefined as string | undefined,
      },
      {
        title: "Nothing happens in the dark",
        text: "Every draft, call and stage change is kept on the timeline, for a handover, a dispute or a review.",
        link: { label: "See the timeline", href: "#timeline" },
        ui: "timeline" as const,
        image: undefined as string | undefined,
      },
    ],
    trust: {
      title: "Built to be trusted with your customers",
      text: "Agents act for your team, so your team stays in charge.",
      link: { label: "How approvals work", href: "#approvals" },
      items: [
        { title: "Approvals first", text: "Nothing reaches a customer until a person says yes." },
        { title: "Audit log", text: "Every step an agent takes is kept and searchable." },
        { title: "Roles", text: "Decide who can approve, per team and per agent." },
        { title: "Undo", text: "Take back an approved change from the same card." },
      ],
    },
    final: {
      title: "Put agents to work in your inbox.",
      text: "Start with one agent, or talk to us about your team.",
    },
  },

  /**
   * A light platform page on hairline grid lines: a large headline, a tabbed product tour that
   * advances on its own, a grid of agents that reveal a line on hover, a feature slider, a
   * testimonial switcher and a closing call to action. Quotes are placeholders.
   */
  platformPage: {
    banner: { text: "New: approvals for every agent", href: "#changelog" },
    nav: [
      { label: "Product", href: "#product" },
      { label: "Agents", href: "#agents" },
      { label: "Pricing", href: "#pricing" },
      { label: "Docs", href: "#docs" },
    ],
    contact: { label: "Talk to us", href: "mailto:sales@heigin.com" },
    cta: { label: "Start free", href: "#start" },
    hero: {
      eyebrow: "The CRM for teams that sell on chat",
      title: ["Run your sales", "with agents that ask first"],
      text: "Inbox, pipeline and agents in one place, built for how your team actually talks to customers.",
    },
    tour: {
      /** Seconds each tab stays before the next one opens. */
      seconds: 6,
      tabs: [
        { label: "Inbox", text: "Every channel in one thread per customer.", ui: "inbox" as const },
        { label: "Pipeline", text: "Deals that move with the conversation.", ui: "pipeline" as const },
        { label: "Agents", text: "Tasks that run step by step.", ui: "trail" as const },
        { label: "Approvals", text: "One queue for everything that needs a yes.", ui: "approval" as const },
        { label: "Reports", text: "The numbers your week runs on.", ui: "metrics" as const },
      ],
    },
    agents: {
      title: "Seven agents, one workspace",
      text: "Each one has its own job. Hover one to see it.",
      items: [
        { name: "Copilot", text: "Answers questions about any record and confirms every change before it makes it." },
        { name: "Sales agent", text: "Works your open conversations and suggests the next step." },
        { name: "Intent scoring", text: "Scores each lead on what the customer said." },
        { name: "Deal brief", text: "A brief of any deal, whenever you ask for one." },
        { name: "Hinglish support", text: "Understands how India actually talks, follows the sale, then updates the CRM." },
        { name: "Documents Q&A", text: "Answers questions from the documents you add." },
        { name: "Call agent", text: "Handles calls and logs them on the record." },
      ],
      more: { label: "See all agents", href: "#agents" },
    },
    slides: {
      title: "Handle every conversation at scale",
      text: "Built for teams answering customers all day.",
      items: [
        { title: "A shared inbox", text: "Mail, chat and calls on one record, with the whole history.", ui: "inbox" as const },
        { title: "Approvals", text: "Drafts wait in one queue until someone says yes.", ui: "approval" as const },
        { title: "A pipeline that moves itself", text: "Stages change as the conversation does.", ui: "pipeline" as const },
        { title: "Follow-ups that happen", text: "Callbacks and reminders booked and ticked off.", ui: "tasks" as const },
        { title: "Reports", text: "Pipeline, win rate and days to close, live.", ui: "metrics" as const },
      ],
    },
    testimonials: {
      items: [
        { company: "Customer One", person: "Name, role", quote: "Placeholder quote. Replace it with wording your customer has approved in writing." },
        { company: "Customer Two", person: "Name, role", quote: "A second placeholder. Keep quotes short, specific and signed off by the person quoted." },
        { company: "Customer Three", person: "Name, role", quote: "A third placeholder, for a customer who has agreed to be named." },
      ],
    },
    final: {
      eyebrow: "Per seat, billed monthly or yearly.",
      title: "Ready to run your sales on HeiGin?",
      text: "Connect your inbox, import your pipeline and turn on your first agent.",
    },
    footer: [
      { label: "Product", links: [{ label: "Inbox", href: "#inbox" }, { label: "Pipeline", href: "#pipeline" }, { label: "Agents", href: "#agents" }] },
      { label: "Company", links: [{ label: "About", href: "#about" }, { label: "Careers", href: "#careers" }, { label: "Contact", href: "mailto:office@heigin.com" }] },
      { label: "Resources", links: [{ label: "Docs", href: "#docs" }, { label: "Changelog", href: "#changelog" }, { label: "Templates", href: "#templates" }] },
    ],
    legal: "HeiGin 2026",
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
