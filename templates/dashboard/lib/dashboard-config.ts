import type { ServiceName } from "@/components/dashboard/service-logos";

/**
 * Everything the dashboard templates say and show. Edit this file to make them yours: components
 * read from here and hold no copy. Photo slots ship empty, so the download contains no artwork;
 * an empty avatar shows initials.
 *
 * The workspaces, people, files, meetings and tasks below are sample content.
 */
export const dashboardConfig = {
  brand: {
    name: "HeiGin",
    /** Leave unset to use the HeiGin mark from @heigin/ui; set a path to use your own logo. */
    logoSrc: undefined as string | undefined,
  },

  user: {
    name: "Asha Rao",
    firstName: "Asha",
    role: "Account executive",
    /** Avatar photo. Unset shows initials. */
    photo: "/people/asha.webp",
  },

  /** The workspace switcher at the top of the panel. The first one is current. */
  workspaces: [
    { id: "northwind", name: "Northwind", caption: "northwind.heigin.com", accent: "#1f1f1f" },
    { id: "kaveri", name: "Kaveri Textiles", caption: "kaveri.heigin.com", accent: "#b45309" },
    { id: "meridian", name: "Meridian Labs", caption: "meridian.heigin.com", accent: "#2563eb" },
  ],

  /**
   * The rail: the app's areas. Icons are lucide names from the set in dashboard-shell.tsx.
   * `current` is the area these pages belong to.
   */
  rail: {
    current: "#area-assistant",
    groups: [
      [
        { label: "Assistant", href: "#area-assistant", icon: "sparkles" },
        { label: "Pipeline", href: "#area-pipeline", icon: "kanban" },
        { label: "Inbox", href: "#area-inbox", icon: "inbox" },
      ],
      [
        { label: "Contacts", href: "#area-contacts", icon: "users" },
        { label: "Companies", href: "#area-companies", icon: "building" },
      ],
      [
        { label: "Reports", href: "#area-reports", icon: "gauge" },
        { label: "Files", href: "#area-files", icon: "folder" },
      ],
    ],
    footer: [
      { label: "Help", href: "#help", icon: "help" },
      { label: "Settings", href: "#settings", icon: "settings" },
    ],
  },

  /** The panel: the assistant's pages, then recent chats by day. */
  nav: {
    current: "#home",
    groups: [
      {
        items: [
          { label: "Home", href: "#home", icon: "home" },
          { label: "New chat", href: "#new-chat", icon: "chat" },
          { label: "My tasks", href: "#tasks", icon: "tasks", count: 5 },
          { label: "My meetings", href: "#meetings", icon: "video" },
          { label: "Saved files", href: "#files", icon: "file" },
          { label: "Shared with me", href: "#shared", icon: "share" },
        ],
      },
      {
        label: "Today",
        items: [
          { label: "Kaveri renewal research", href: "#chat-kaveri" },
          { label: "Summary of the Asha Foods call", href: "#chat-asha-foods" },
          { label: "This week's priorities", href: "#chat-priorities" },
        ],
      },
      {
        label: "Yesterday",
        items: [{ label: "Meridian proposal review", href: "#chat-meridian" }],
      },
    ],
  },

  /** The card at the foot of the panel. Set to null to hide it. */
  upgrade: {
    title: "5 agent reports left",
    body: "Get deeper account insights with Pro.",
    cta: { label: "Upgrade now", href: "#upgrade" },
  } as { title: string; body: string; cta: { label: string; href: string } } | null,

  home: {
    /** "{firstName}" is replaced with user.firstName. */
    greeting: "Welcome, {firstName}!",
    wave: "👋",
    question: "How can I help you today?",

    recent: {
      title: "Recently viewed",
      files: [
        { label: "Northwind onboarding flow", href: "#file-onboarding", service: "figma" as ServiceName | "pdf" },
        { label: "Q4 account plan", href: "#file-account-plan", service: "notion" as ServiceName | "pdf" },
        { label: "Kaveri Textiles MSA.pdf", href: "#file-msa", service: "pdf" as ServiceName | "pdf" },
      ],
    },

    meeting: {
      label: "Summarize your last meeting",
      title: "Renewal call with Kaveri Textiles",
      when: "26 Nov 2026, 14:00",
      service: "googleMeet" as ServiceName,
      href: "#meeting-kaveri",
      /** People on the call; photos are optional. */
      people: [
        { name: "Ravi Menon", photo: "/people/ravi.webp" },
        { name: "Grace Okafor", photo: "/people/grace.webp" },
      ],
    },

    suggestions: [
      { label: "Suggested task", title: "Follow up with Meridian Labs", href: "#suggest-meridian" },
      { label: "Suggested task", title: "Draft the Asha Foods renewal email", href: "#suggest-asha-foods" },
    ],

    tasks: {
      title: "My tasks",
      search: "Search tasks…",
      prioritize: "Prioritize tasks",
      /**
       * `priority` orders the list when "Prioritize tasks" is pressed (1 first). Tags: time and
       * join render a meeting time and a join link; the rest are status chips.
       */
      items: [
        { id: "t1", title: "Pipeline review with the sales team", dot: "orange", priority: 2, tags: [{ kind: "time", label: "2 pm" }, { kind: "join", label: "Join now", href: "#join" }] },
        { id: "t2", title: "Send Kaveri Textiles the revised quote", dot: "red", priority: 1, tags: [{ kind: "urgent", label: "Urgent" }, { kind: "due-today", label: "By today" }] },
        { id: "t3", title: "Prepare the Meridian Labs proposal", dot: "blue", priority: 3, tags: [{ kind: "in-progress", label: "In progress" }, { kind: "due-soon", label: "By tomorrow" }] },
        { id: "t4", title: "Check Asha Foods usage before the renewal call", dot: "blue", priority: 4, tags: [{ kind: "todo", label: "To do" }, { kind: "due-soon", label: "By tomorrow" }] },
        { id: "t5", title: "Update the Northwind contact roles", dot: "gray", priority: 5, tags: [{ kind: "todo", label: "To do" }] },
      ] as DashboardTask[],
      empty: "No tasks match.",
    },

    ask: {
      placeholder: "Ask or search for anything. Use @ to tag a record or file.",
      label: "Ask the assistant",
      send: "Send",
    },
  },
};

export type TaskTagKind = "time" | "join" | "urgent" | "due-today" | "in-progress" | "todo" | "due-soon";
export interface DashboardTask {
  id: string;
  title: string;
  dot: "orange" | "red" | "blue" | "gray";
  priority: number;
  tags: { kind: TaskTagKind; label: string; href?: string }[];
}
