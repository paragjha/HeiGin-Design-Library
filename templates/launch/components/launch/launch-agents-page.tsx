"use client";

import * as React from "react";
import { ArrowRight, Check, Copy, ScrollText, ShieldCheck, Undo2, Users } from "lucide-react";
import { ChannelMark, Spinner, StatusBadge, Table, type TableColumn } from "@heigin/ui";
import { launchConfig } from "@/lib/launch-config";
import { cn, prefersReducedMotion, useInView, useTicker } from "@/lib/launch-utils";
import { BrandMark } from "@/components/launch/launch-brand";
import { LaunchPanel, type PanelKind } from "@/components/launch/launch-panels";

const RUN_MS = 2600;
const VISIBLE_RUNS = 5;
const TRUST_ICONS = [ShieldCheck, ScrollText, Users, Undo2];

type Run = (typeof launchConfig.agentsPage.window.runs)[number] & { id: string; running: boolean };

/**
 * A dark agents landing page: a hero, a product window whose agent runs keep arriving, the channels
 * it reads, four jobs with small live demos, feature rows with live HeiGin panels, a trust grid and a
 * closing call to action.
 */
export function LaunchAgentsPage({ className }: { className?: string }) {
  const c = launchConfig.agentsPage;
  return (
    <div className={cn("lag lag-tokens min-h-svh", className)}>
      <header className="lag-head sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-5 md:px-8">
          <a href={launchConfig.brand.href} className="flex items-center gap-2 text-[15px] font-semibold tracking-[0.04em] uppercase">
            <BrandMark size={20} />
            {launchConfig.brand.name}
          </a>
          <nav aria-label="Main" className="hidden md:block">
            <ul className="m-0 flex list-none gap-7 p-0 text-[13px]">
              {c.nav.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="lag-link">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <a href={c.contact.href} className="lag-btn lag-btn-quiet max-sm:hidden">
              {c.contact.label}
            </a>
            <a href={c.cta.href} className="lag-btn lag-btn-solid">
              {c.cta.label}
            </a>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <ProductWindow />
        <Channels />
        <Jobs />
        <div className="mx-auto grid max-w-[1240px] gap-5 px-5 pb-24 md:px-8">
          {c.features.map((f, i) => (
            <FeatureRow key={f.title} feature={f} flip={i % 2 === 1} />
          ))}
        </div>
        <Trust />
        <Final />
      </main>
    </div>
  );
}

function Hero() {
  const h = launchConfig.agentsPage.hero;
  const cta = launchConfig.agentsPage.cta;
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(h.prompt.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // no clipboard access (an insecure page or a denied permission): the button just stays as it is
    }
  };
  return (
    <section className="mx-auto max-w-[1240px] px-5 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
      <h1 className="lag-rise m-0 max-w-[14ch] text-[clamp(44px,7.2vw,104px)] font-medium leading-[0.98] tracking-[-0.035em]">{h.title}</h1>
      <div className="lag-rise mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between" style={{ "--d": "120ms" } as React.CSSProperties}>
        <p className="lag-muted m-0 max-w-[420px] text-[17px] leading-[1.5]">{h.text}</p>
        <div className="flex flex-wrap items-center gap-3">
          <a href={cta.href} className="lag-btn lag-btn-solid lag-btn-lg">
            {cta.label}
          </a>
          <button type="button" className="lag-btn lag-btn-quiet lag-btn-lg" onClick={copy} aria-live="polite">
            <span className="lag-swap" data-on={copied}>
              <span className="flex items-center gap-2">
                <Copy size={15} aria-hidden="true" />
                {h.prompt.label}
              </span>
              <span className="flex items-center gap-2" aria-hidden={!copied}>
                <Check size={15} aria-hidden="true" />
                {h.prompt.copied}
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

/** The product window rises and straightens as it scrolls in; a new agent run arrives every few seconds. */
function ProductWindow() {
  const w = launchConfig.agentsPage.window;
  const image = launchConfig.agentsPage.hero.image;
  const stage = React.useRef<HTMLElement>(null);
  const [ref, inView] = useInView<HTMLDivElement>();
  const k = useTicker(inView, w.runs.length, RUN_MS);

  React.useEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      // 0 when the top of the stage meets the bottom of the window, 1 once it is two thirds up
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight * 0.66)));
      el.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // The newest run sits on top and is still running; the rest have settled.
  const rows: Run[] = Array.from({ length: Math.min(VISIBLE_RUNS, w.runs.length) }, (_, i) => {
    const idx = (k - i + w.runs.length * 2) % w.runs.length;
    return { ...w.runs[idx]!, id: `${idx}`, running: i === 0 };
  });
  const columns: TableColumn<Run>[] = [
    {
      id: "status",
      header: "Status",
      width: "190px",
      cell: (r) =>
        r.running ? (
          <span className="inline-flex items-center gap-2 text-[13px] text-[var(--hg-color-ink-soft)]">
            <Spinner size="sm" label={null} />
            Running
          </span>
        ) : (
          <StatusBadge status={r.status} />
        ),
    },
    { id: "task", header: "Task", cell: (r) => <span className="font-medium">{r.task}</span> },
    { id: "customer", header: "Customer", cell: (r) => r.customer, hideOnMobile: true },
    { id: "channel", header: "Channel", cell: (r) => <ChannelMark channel={r.channel} />, hideOnMobile: true },
    { id: "runtime", header: "Runtime", cell: (r) => (r.running ? "…" : r.runtime), numeric: true, hideOnMobile: true },
  ];

  return (
    <section ref={stage} id="product" className="lag-stage relative overflow-hidden">
      {image ? <img src={image} alt="" className="absolute inset-0 size-full object-cover" draggable={false} /> : <div className="lag-stage-plain absolute inset-0" />}
      <div ref={ref} className="lag-window relative mx-auto max-w-[1180px] px-5 md:px-8">
        <div className="lag-app grid overflow-hidden rounded-[12px] md:grid-cols-[200px_minmax(0,1fr)]">
          <aside className="lag-app-side hidden flex-col gap-1 p-4 md:flex" aria-hidden="true">
            <span className="mb-4 flex items-center gap-2 text-[13px] font-semibold">
              <BrandMark size={16} />
              {w.workspace}
            </span>
            {w.nav.map((item, i) => (
              <span key={item} className={cn("rounded-[6px] px-2.5 py-1.5 text-[13px]", i === 2 ? "lag-app-on" : "lag-muted")}>
                {item}
              </span>
            ))}
          </aside>
          <div className="grid gap-5 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_200px]">
            <div className="min-w-0">
              <h2 className="m-0 text-[20px] font-medium tracking-[-0.01em]">{w.title}</h2>
              <p className="lag-muted m-0 mb-4 mt-1 text-[13px]">{w.text}</p>
              <Table caption="Agent runs" columns={columns} rows={rows} getRowId={(r) => r.id} density="compact" />
            </div>
            <div className="hidden content-start gap-3 lg:grid">
              {w.metrics.map((m) => (
                <div key={m.label} className="lag-app-card rounded-[10px] p-4">
                  <p className="lag-muted m-0 text-[12px]">{m.label}</p>
                  <p className="m-0 mt-1 text-[28px] font-medium tabular-nums tracking-[-0.02em]">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Channels() {
  const ch = launchConfig.agentsPage.channels;
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-20 md:px-8">
      <h2 className="m-0 mb-6 text-[15px] font-medium">{ch.title}</h2>
      <ul className="lag-grid m-0 grid list-none grid-cols-2 p-0 sm:grid-cols-3 lg:grid-cols-6">
        {ch.items.map((channel) => (
          <li key={channel} className="lag-cell grid h-24 place-items-center text-[14px]">
            <ChannelMark channel={channel} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// the small live demo under each job, in the order of jobs.items
const JOB_DEMO: (PanelKind | "qualify")[] = ["inbox", "qualify", "tasks", "pipeline"];

function Jobs() {
  const j = launchConfig.agentsPage.jobs;
  return (
    <section id="agents" className="mx-auto max-w-[1240px] px-5 pb-24 md:px-8">
      <h2 className="m-0 max-w-[16ch] text-[clamp(32px,3.6vw,48px)] font-medium leading-[1.05] tracking-[-0.03em]">{j.title}</h2>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {j.items.map((job, i) => (
          <JobCard key={job.title} job={job} index={i} />
        ))}
      </div>
    </section>
  );
}

function JobCard({ job, index }: { job: (typeof launchConfig.agentsPage.jobs.items)[number]; index: number }) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <article
      ref={ref}
      className="lag-card lag-reveal group flex flex-col rounded-[10px] p-5"
      data-in={inView}
      style={{ "--d": `${index * 80}ms` } as React.CSSProperties}
    >
      <h3 className="m-0 text-[15px] font-medium">{job.title}</h3>
      <p className="lag-muted m-0 mt-2 text-[14px] leading-[1.45]">{job.text}</p>
      <a href={job.link.href} className="lag-accent mt-4 inline-flex items-center gap-1.5 text-[13px]">
        {job.link.label}
        <ArrowRight size={13} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </a>
      <div className="lag-demo mt-6 flex min-h-[210px] items-start overflow-hidden rounded-[8px] p-3" aria-hidden="true">
        {(() => {
          const demo = JOB_DEMO[index % JOB_DEMO.length]!;
          return demo === "qualify" ? <QualifyDemo active={inView} /> : <LaunchPanel kind={demo} active={inView} className="lag-demo-panel" />;
        })()}
      </div>
    </article>
  );
}

/** Three leads move through their statuses one after another. */
function QualifyDemo({ active }: { active: boolean }) {
  const leads = launchConfig.changelog.panels.inbox.map((m) => m.name);
  const order = ["new", "contacted", "qualified"] as const;
  const k = useTicker(active, leads.length * 2 + 2, 1100);
  return (
    <ul className="lag-demo-panel m-0 grid w-full list-none gap-2 p-0">
      {leads.map((name, i) => {
        const at = Math.max(0, Math.min(2, k - i * 2));
        return (
          <li key={name} className="flex items-center justify-between gap-3 rounded-[8px] border border-[var(--hg-color-border)] bg-[var(--hg-color-surface)] px-3 py-2.5 text-[13px]">
            <span className="font-medium text-[var(--hg-color-ink)]">{name}</span>
            <StatusBadge status={order[at]} />
          </li>
        );
      })}
    </ul>
  );
}

function FeatureRow({ feature, flip }: { feature: (typeof launchConfig.agentsPage.features)[number]; flip: boolean }) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <article ref={ref} className="lag-card lag-reveal grid overflow-hidden rounded-[12px] md:grid-cols-2" data-in={inView}>
      <div className={cn("flex flex-col justify-center gap-4 p-8 md:p-12", flip && "md:order-2")}>
        <h3 className="m-0 text-[clamp(28px,3vw,40px)] font-medium leading-[1.05] tracking-[-0.03em]">{feature.title}</h3>
        <p className="lag-muted m-0 max-w-[420px] text-[15px] leading-[1.55]">{feature.text}</p>
        <a href={feature.link.href} className="lag-accent inline-flex items-center gap-1.5 text-[14px]">
          {feature.link.label}
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
      <div className="lag-feature-art relative grid min-h-[340px] place-items-center overflow-hidden p-6 md:p-10">
        {feature.image ? <img src={feature.image} alt="" className="absolute inset-0 size-full object-cover" draggable={false} /> : <div className="lag-stage-plain absolute inset-0" />}
        <div className="lag-float relative w-full max-w-[420px]" aria-hidden="true">
          <LaunchPanel kind={feature.ui} active={inView} />
        </div>
      </div>
    </article>
  );
}

function Trust() {
  const t = launchConfig.agentsPage.trust;
  return (
    <section className="mx-auto max-w-[1240px] px-5 pb-24 md:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="m-0 max-w-[18ch] text-[clamp(32px,3.6vw,48px)] font-medium leading-[1.05] tracking-[-0.03em]">{t.title}</h2>
          <p className="lag-muted m-0 mt-3 text-[15px]">{t.text}</p>
        </div>
        <a href={t.link.href} className="lag-accent inline-flex items-center gap-1.5 text-[14px]">
          {t.link.label}
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
      <ul className="lag-grid m-0 mt-10 grid list-none p-0 sm:grid-cols-2 lg:grid-cols-4">
        {t.items.map((item, i) => {
          const Icon = TRUST_ICONS[i % TRUST_ICONS.length]!;
          return (
            <li key={item.title} className="lag-cell p-6">
              <Icon size={18} aria-hidden="true" className="lag-accent" />
              <h3 className="m-0 mt-8 text-[15px] font-medium">{item.title}</h3>
              <p className="lag-muted m-0 mt-1.5 text-[14px] leading-[1.45]">{item.text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Final() {
  const c = launchConfig.agentsPage;
  return (
    <section className="lag-final px-5 py-28 text-center md:px-8">
      <h2 className="m-0 mx-auto max-w-[18ch] text-[clamp(36px,4.6vw,64px)] font-medium leading-[1.02] tracking-[-0.035em]">{c.final.title}</h2>
      <p className="lag-muted m-0 mt-4 text-[16px]">{c.final.text}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={c.cta.href} className="lag-btn lag-btn-solid lag-btn-lg">
          {c.cta.label}
        </a>
        <a href={c.contact.href} className="lag-btn lag-btn-quiet lag-btn-lg">
          {c.contact.label}
        </a>
      </div>
    </section>
  );
}
