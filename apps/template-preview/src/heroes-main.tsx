import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HeroArchive } from "@/components/heroes/hero-archive";
import { HeroTracer } from "@/components/heroes/hero-tracer";
import { HeroWall } from "@/components/heroes/hero-wall";
import "./heroes.css";

// ?section=wall | archive | tracer renders that hero; no parameter renders the wall.
const HEROES = { wall: HeroWall, archive: HeroArchive, tracer: HeroTracer };

function Preview() {
  const section = new URLSearchParams(window.location.search).get("section") as keyof typeof HEROES | null;
  const Hero = (section && HEROES[section]) || HeroWall;
  return <Hero />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
