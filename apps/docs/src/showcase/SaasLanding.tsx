import * as React from "react";
import "./saas-landing.css";

const ArrowRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const Menu = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const Close = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export interface SaasLandingProps {
  /** Brand name shown in the nav. */
  brand?: string;
  /** Nav section links shown in the center. */
  navLinks?: { label: string; href: string }[];
  /** Headline shown as the hero title (supports a <br/> to split). */
  title?: React.ReactNode;
  /** Supporting paragraph under the title. */
  subtitle?: React.ReactNode;
  /** Announcement pill label. */
  announcement?: { text: string; linkText: string; linkHref: string };
  /** Call-to-action button text. */
  ctaText?: string;
  /** Callback for the CTA. If omitted the button is still rendered but does nothing. */
  onCtaClick?: () => void;
}

const defaultLinks = [
  { label: "Getting started", href: "#getting-started" },
  { label: "Components", href: "#components" },
  { label: "Documentation", href: "#documentation" },
];

export function SaasLanding({
  brand = "HeiGin UI",
  navLinks = defaultLinks,
  title = (
    <>
      Give your big idea
      <br />
      the website it deserves
    </>
  ),
  subtitle = (
    <>
      A React + TypeScript design system built on real production
      <br />
      patterns — copy-source friendly, tokens included.
    </>
  ),
  announcement = {
    text: "New version of HeiGin UI is out!",
    linkText: "Read more",
    linkHref: "#changelog",
  },
  ctaText = "Get started",
  onCtaClick,
}: SaasLandingProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="hg-saas-landing">
      <header className="hg-saas-nav">
        <nav className="hg-saas-nav__inner" aria-label="Primary">
          <a className="hg-saas-nav__brand" href="#top">
            <span className="hg-saas-nav__brand-mark" aria-hidden="true" />
            {brand}
          </a>
          <div className="hg-saas-nav__links">
            {navLinks.map((link) => (
              <a key={link.href} className="hg-saas-nav__link" href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="hg-saas-nav__actions">
            <button type="button" className="hg-saas-nav__btn">Sign in</button>
            <button type="button" className="hg-saas-nav__btn-primary">Sign up</button>
          </div>
          <button
            type="button"
            className="hg-saas-nav__toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </nav>
        {open && (
          <div className="hg-saas-nav__drawer">
            {navLinks.map((link) => (
              <a
                key={link.href}
                className="hg-saas-nav__link"
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="hg-saas-nav__drawer-actions">
              <button type="button" className="hg-saas-nav__btn" onClick={() => setOpen(false)}>Sign in</button>
              <button type="button" className="hg-saas-nav__btn-primary" onClick={() => setOpen(false)}>Sign up</button>
            </div>
          </div>
        )}
      </header>

      <section className="hg-saas-hero" aria-labelledby="hg-saas-title">
        <aside className="hg-saas-hero__pill">
          <span className="hg-saas-hero__pill-label">{announcement.text}</span>
          <a href={announcement.linkHref} aria-label={`${announcement.linkText}: ${announcement.text}`}>
            {announcement.linkText}
            <ArrowRight size={12} />
          </a>
        </aside>

        <h1 id="hg-saas-title" className="hg-saas-hero__title">{title}</h1>
        <p className="hg-saas-hero__sub">{subtitle}</p>

        <button
          type="button"
          className="hg-saas-hero__cta"
          onClick={onCtaClick}
          aria-label={`${ctaText} — primary call to action`}
        >
          {ctaText}
          <ArrowRight size={16} />
        </button>

        <div className="hg-saas-preview">
          <div className="hg-saas-preview__glow" aria-hidden="true" />
          <div className="hg-saas-preview__frame">
            <DashboardMock />
          </div>
        </div>
      </section>
    </div>
  );
}

/* A compact dashboard preview, built from scratch so the hero needs no external image. */
function DashboardMock() {
  const metrics = [
    { label: "Total contacts", value: "2,847", delta: "+12% vs last month", tone: "up" as const },
    { label: "Active deals", value: "127", delta: "+8% vs last month", tone: "up" as const },
    { label: "Revenue", value: "$847K", delta: "−3% vs last month", tone: "down" as const },
    { label: "Conversion", value: "24.3%", delta: "+5% vs last month", tone: "up" as const },
  ];
  const nav = ["Dashboard", "Contacts", "Companies", "Deals", "Tasks", "Reports", "Settings"];
  // Simple sparkline points.
  const sparkPoints = [12, 18, 15, 22, 20, 28, 32, 30, 36, 42, 40, 48];
  const spark = sparkPoints
    .map((v, i) => `${(i / (sparkPoints.length - 1)) * 100},${100 - (v / 48) * 90}`)
    .join(" ");
  return (
    <div className="hg-saas-dash" role="img" aria-label="HeiGin CRM dashboard preview">
      <aside className="hg-saas-dash__side">
        <div className="hg-saas-dash__brand">
          <span className="hg-saas-dash__brand-mark" aria-hidden="true" />
          CRM Studio
        </div>
        <ul className="hg-saas-dash__nav">
          {nav.map((item, i) => (
            <li key={item} className="hg-saas-dash__nav-item" data-active={i === 0 || undefined}>
              {item}
            </li>
          ))}
        </ul>
      </aside>
      <div className="hg-saas-dash__main">
        <div className="hg-saas-dash__topbar">
          <div>
            <h3>Dashboard</h3>
            <p>Welcome back. Here's what's happening today.</p>
          </div>
          <span className="hg-saas-dash__pill">Last 30 days</span>
        </div>
        <div className="hg-saas-dash__metrics">
          {metrics.map((m) => (
            <div key={m.label} className="hg-saas-dash__metric">
              <div className="hg-saas-dash__metric-label">{m.label}</div>
              <div className="hg-saas-dash__metric-value">{m.value}</div>
              <div className="hg-saas-dash__metric-delta" data-tone={m.tone}>
                {m.delta}
              </div>
            </div>
          ))}
        </div>
        <div className="hg-saas-dash__panels">
          <div className="hg-saas-dash__panel">
            <div className="hg-saas-dash__panel-head">
              <span>Revenue overview</span>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>Last 6 months</span>
            </div>
            <svg className="hg-saas-dash__sparkline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="hg-saas-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(99,102,241,0.45)" />
                  <stop offset="100%" stopColor="rgba(99,102,241,0)" />
                </linearGradient>
              </defs>
              <polyline fill="none" stroke="rgb(165, 180, 252)" strokeWidth="1.5" points={spark} />
              <polygon fill="url(#hg-saas-fill)" points={`0,100 ${spark} 100,100`} />
            </svg>
          </div>
          <div className="hg-saas-dash__panel">
            <div className="hg-saas-dash__panel-head">
              <span>Deal pipeline</span>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>View all</span>
            </div>
            <svg viewBox="0 0 100 100" aria-hidden="true" style={{ width: "80%", margin: "0 auto" }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="12" strokeDasharray="25 251" strokeDashoffset="0" transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(34, 211, 238)" strokeWidth="12" strokeDasharray="50 251" strokeDashoffset="-25" transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(168, 85, 247)" strokeWidth="12" strokeDasharray="113 251" strokeDashoffset="-75" transform="rotate(-90 50 50)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
