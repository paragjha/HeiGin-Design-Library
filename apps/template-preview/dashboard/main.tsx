import { StrictMode, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { dashboardConfig } from "@/lib/dashboard-config";
import "./dashboard.css";

// The preview shows portraits. They are set here, not in the template's config, so the download
// ships with no photos of its own (Pexels stock models, see public/people/NOTICE.txt).
const photo = (name: string) => `${import.meta.env.BASE_URL}people/${name}.webp`;
dashboardConfig.user.photo = photo("asha");
dashboardConfig.home.meeting.people[0]!.photo = photo("ravi");
dashboardConfig.home.meeting.people[1]!.photo = photo("grace");

// ?section=<name> (a key below) renders that piece; no parameter renders the home page.
const SECTIONS: Record<string, () => ReactElement> = {
  home: () => <DashboardHome />,
  shell: () => (
    <DashboardShell>
      <main style={{ padding: 40, color: "var(--hg-color-muted)" }}>Your page goes here.</main>
    </DashboardShell>
  ),
};

function Preview() {
  const One = SECTIONS[new URLSearchParams(window.location.search).get("section") ?? "home"] ?? SECTIONS.home!;
  return <One />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
