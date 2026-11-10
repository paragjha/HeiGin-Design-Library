import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnnouncementBar } from "@/components/landing/announcement-bar";
import { LandingPage } from "@/components/landing/landing-page";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { landingConfig, type SectionId } from "@/lib/landing-config";
import "./app.css";

// The demo shows the heigin.com landscape. It is set here, not in the template's config, so the
// template itself still ships with no artwork.
landingConfig.theme.backdropImage = `${import.meta.env.BASE_URL}images/hero-landscape.webp`;

// ?section=<id> renders one section on its own; no parameter renders the full page.
function Preview() {
  const section = new URLSearchParams(window.location.search).get("section");
  if (!section) return <LandingPage />;
  if (section === "header") {
    return (
      <div className="min-h-[420px]">
        <AnnouncementBar />
        <SiteHeader />
      </div>
    );
  }
  if (section === "footer") return <SiteFooter />;
  const ids = section.split(",").filter((id): id is SectionId => landingConfig.sections.includes(id as SectionId));
  return <LandingPage only={ids} chrome={false} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
