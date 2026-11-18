"use client";

import * as React from "react";
import { HeiGinMark } from "@heigin/ui";
import { Brand } from "@/components/heroes/brand";
import { ServiceLogo, type ServiceName } from "@/components/heroes/service-logos";
import { heroesConfig, serviceLabels } from "@/lib/heroes-config";
import { cn } from "@/lib/heroes-utils";

interface Run {
  id: string;
  title: string;
  model: ServiceName;
  modelName: string;
  tags: { label: string; colour: string }[];
  steps: number;
  tokens: string;
  seconds: number;
  cost: number;
  ago: number;
  errors?: number;
}

const RUNS: Run[] = [
  { id: "r1", title: "Asha says the invoice is wrong – can you check the PO number?", model: "claude", modelName: "Claude Opus 5.5", tags: [{ label: "WhatsApp", colour: "#25d366" }, { label: "collections", colour: "#a855f7" }, { label: "Kaveri Textiles", colour: "#14b8a6" }], steps: 8, tokens: "4.2K", seconds: 5.84, cost: 0.0418, ago: 12 },
  { id: "r2", title: "Score this morning’s 42 inbound leads and route the top ten", model: "openai", modelName: "GPT-5", tags: [{ label: "lead-triage", colour: "#f59e0b" }, { label: "HubSpot", colour: "#ff7a59" }], steps: 14, tokens: "12K", seconds: 9.12, cost: 0.124, ago: 48 },
  { id: "r3", title: "Draft renewal reminders for workspaces with no logins in 30 days", model: "gemini", modelName: "Gemini 3 Flash", tags: [{ label: "renewals", colour: "#ec4899" }, { label: "Gmail", colour: "#ea4335" }], steps: 3, tokens: "1.9K", seconds: 1.58, cost: 0.0094, ago: 180 },
  { id: "r4", title: "Which accounts drove the Q3 pipeline dip? Break it down by owner", model: "claude", modelName: "Claude Sonnet 5.5", tags: [{ label: "pipeline-analyst", colour: "#3b82f6" }, { label: "Salesforce", colour: "#00a1e0" }], steps: 17, tokens: "15K", seconds: 12.68, cost: 0.162, ago: 480, errors: 2 },
  { id: "r5", title: "Summarise yesterday’s calls and add next steps to each deal", model: "mistral", modelName: "Mistral Large", tags: [{ label: "meeting-notes", colour: "#22c55e" }, { label: "Google Calendar", colour: "#4285f4" }], steps: 5, tokens: "9.8K", seconds: 2.14, cost: 0.0121, ago: 840 },
  { id: "r6", title: "Match the July payouts against open invoices", model: "openai", modelName: "GPT-5 mini", tags: [{ label: "reconciler", colour: "#0ea5e9" }, { label: "Stripe", colour: "#635bff" }], steps: 4, tokens: "1.4K", seconds: 0.92, cost: 0.0038, ago: 1140 },
];
const LIVE: Run = { id: "r0", title: "Find the churn signals in this week’s support tickets", model: "claude", modelName: "Claude Haiku 5.5", tags: [{ label: "churn-watch", colour: "#a855f7" }, { label: "Zendesk", colour: "#03363d" }], steps: 6, tokens: "3.1K", seconds: 3.42, cost: 0.0207, ago: 0 };

const durColour = (s: number) => (s >= 12 ? "#ef4444" : s >= 8 ? "#f97316" : s >= 2 ? "#f5a524" : "#22c55e");
const costColour = (c: number) => (c >= 0.15 ? "#ef4444" : c >= 0.1 ? "#f97316" : c >= 0.01 ? "#f5a524" : "#22c55e");
const fmtDur = (s: number) => (s < 1 ? `${Math.round(s * 1000)}ms` : `${s.toFixed(2)}s`);
const fmtAgo = (s: number) => (s < 60 ? `${s}s ago` : s < 3600 ? `${Math.floor(s / 60)}m ago` : `${Math.floor(s / 3600)}h ago`);

const NAV = [
  { label: "Overview", colour: "#fb7185" },
  { label: "Agents", colour: "#fb923c" },
  { label: "Runs", colour: "#60a5fa", on: true },
  { label: "Approvals", colour: "#4ade80" },
  { label: "Evals", colour: "#e879f9" },
  { label: "Alerts", colour: "#fbbf24" },
];

/**
 * A dark hero: the headline blurs in while a tilted dashboard of agent runs settles flat, then
 * the table updates live. Real model and integration logos; the main brand is yours.
 */
export function HeroTracer({ className }: { className?: string }) {
  const { tracer, cta, nav } = heroesConfig;
  const dashRef = React.useRef<HTMLDivElement>(null);
  const [runs, setRuns] = React.useState(RUNS);
  const [fresh, setFresh] = React.useState<string | null>(null);
  const [errorsOnly, setErrorsOnly] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReady(true);
    const dash = dashRef.current;
    if (dash && !reduce) {
      const pose = "rotateX(9deg) rotateZ(-6deg) scale(1.15) translateY(30px)";
      dash.animate([{ transform: pose, opacity: 0 }, { transform: pose, opacity: 1, offset: 0.12 }, { transform: "none", opacity: 1 }], { duration: 1500, easing: "cubic-bezier(.16,1,.3,1)", fill: "both", delay: 100 });
    }
    const tick = window.setInterval(() => setRuns((all) => all.map((r) => ({ ...r, ago: r.ago + 1 }))), 1000);
    const live = window.setTimeout(() => {
      setRuns((all) => [LIVE, ...all].slice(0, 6));
      setFresh(LIVE.id);
    }, 5200);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(live);
    };
  }, []);

  const copy = async () => {
    let ok = true;
    try {
      await navigator.clipboard.writeText(tracer.copyPrompt.text);
    } catch {
      ok = false;
    }
    setCopied(ok ? tracer.copyPrompt.copied : "Copy failed");
    window.setTimeout(() => setCopied(null), 1600);
  };

  const shown = runs.filter((r) => !errorsOnly || r.errors);

  return (
    <div className={cn("hero-dark relative overflow-x-clip", className)}>
      <div aria-hidden="true" className="hero-rays pointer-events-none fixed inset-0" />
      <header className="relative z-10 mx-auto flex h-16 w-[min(1216px,calc(100%-48px))] items-center justify-between">
        <Brand className="text-base" size={20} />
        <nav aria-label="Main" className="flex items-center gap-5 text-sm text-muted">
          {nav.slice(0, 4).map((l) => (
            <a key={l.href} href={l.href} className="hidden hover:text-ink md:inline">
              {l.label}
            </a>
          ))}
          <a href={cta.signIn.href} className="inline-flex h-8 items-center rounded-full bg-[#262626] px-3 font-medium text-ink shadow-[inset_0_0.5px_0_rgb(255_255_255/0.04),0_0_0_0.5px_rgb(255_255_255/0.08)]">
            {cta.signIn.label}
          </a>
          <a href={cta.primary.href} className="inline-flex h-8 items-center rounded-full bg-[#f5f5f5] px-3 font-medium text-[#171717]">
            {cta.primary.label}
          </a>
        </nav>
      </header>

      <main className="relative z-[2] pt-[70px]">
        <div className="mx-auto flex w-[min(1216px,calc(100%-48px))] flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className={cn("m-0 text-[48px] font-[450] leading-[48px] tracking-[-1.2px] max-md:text-[38px] max-md:leading-10", ready && "hero-rise")}>{tracer.title}</h1>
            <p className={cn("mb-7 mt-[22px] max-w-[460px] text-lg leading-7 text-muted", ready && "hero-rise [animation-delay:80ms]")}>{tracer.subtitle}</p>
            <div className={cn("flex flex-wrap gap-2.5", ready && "hero-rise [animation-delay:160ms]")}>
              <button type="button" onClick={copy} className="hero-pill bg-[#f5f5f5] text-[#171717] shadow-[inset_0_0.5px_0_rgb(255_255_255/0.45),0_0_0_0.5px_rgb(255_255_255/0.55),0_0.5px_2px_rgb(0_0_0/0.5)]">
                <span className="inline-flex gap-1" aria-hidden="true">
                  <ServiceLogo name="claude" size={14} />
                  <ServiceLogo name="openai" size={14} />
                </span>
                <span aria-live="polite">{copied ?? tracer.copyPrompt.label}</span>
              </button>
              <a href={cta.primary.href} className="hero-pill bg-[#262626] text-ink">
                {cta.primary.label}
              </a>
            </div>
          </div>
          <div className="mb-2.5 flex items-center gap-2 whitespace-nowrap border-l border-[#262626] pl-3 text-[13px] text-muted max-md:hidden">
            {tracer.builtFor}
            <ServiceLogo name="vercelAiSdk" size={16} title="Vercel AI SDK" className="text-ink" />
          </div>
        </div>

        <div className="mx-auto mt-16 w-[min(1376px,calc(100%-24px))] [perspective:2200px]">
          <div ref={dashRef} className="grid origin-[50%_40%] grid-cols-[184px_1fr] rounded-2xl border border-[#262626] bg-[#141414] p-1.5 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.8)] max-md:grid-cols-1">
            <aside className="flex min-h-[540px] flex-col px-2 pb-2.5 pt-3.5 max-md:hidden">
              <div className="flex items-center gap-2 px-1.5 pb-3.5 text-sm font-semibold">
                <HeiGinMark size={18} /> Northwind
              </div>
              {NAV.map((n) => (
                <div key={n.label} className={cn("flex h-[29px] items-center gap-2.5 rounded-lg px-2 text-[13.5px] font-medium text-[#e5e5e5]", n.on && "bg-[#242424]")}>
                  <span className="size-[15px] rounded" style={{ background: `color-mix(in oklab, ${n.colour} 22%, transparent)`, boxShadow: `inset 0 0 0 4px color-mix(in oklab, ${n.colour} 60%, transparent)` }} />
                  {n.label}
                </div>
              ))}
              <div className="mt-auto flex items-center gap-2 px-2 text-[13px] text-[#d4d4d4]">
                <span className="grid size-5 place-items-center rounded-full bg-[#262626] text-[10px]">RS</span> Riya S
              </div>
            </aside>
            <section aria-label="Agent runs" className="overflow-hidden rounded-xl border border-[#222] bg-[#181818] pb-3.5 pt-5">
              <div className="flex items-center gap-2 px-5 text-[15px] font-medium">
                <HeiGinMark size={16} /> Agent runs
              </div>
              <div className="flex flex-wrap items-center gap-2 px-5 pb-3.5 pt-4">
                {["Any agent", "Any model"].map((f) => (
                  <span key={f} className="inline-flex h-[26px] items-center rounded-full border border-[#2a2a2a] bg-[#1d1d1d] px-2.5 text-[12.5px] text-[#737373]">
                    {f}
                  </span>
                ))}
                <button
                  type="button"
                  aria-pressed={errorsOnly}
                  onClick={() => setErrorsOnly((v) => !v)}
                  className={cn("inline-flex h-[26px] items-center rounded-full border px-2.5 text-[12.5px]", errorsOnly ? "border-[#3a3a3a] bg-[#262626] text-ink" : "border-[#2a2a2a] bg-[#1d1d1d] text-[#737373]")}
                >
                  Errors only
                </button>
                <span className="ml-auto inline-flex h-[26px] items-center rounded-full bg-[#2a2a2a] px-2.5 text-[12.5px] text-ink">24h</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
                  <caption className="sr-only">Recent agent runs</caption>
                  <thead>
                    <tr className="border-b border-[#222] text-[#e5e5e5]">
                      {["Run", "Steps", "Tokens", "Duration", "Cost", "When"].map((h, i) => (
                        <th key={h} scope="col" className={cn("px-5 pb-3 pt-2.5 font-medium", i ? "text-right" : "text-left")}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((r) => (
                      <tr key={r.id} className={cn("border-b border-[#202020] transition-colors hover:bg-[#1c1c1c]", fresh === r.id && "hero-row-in")}>
                        <td className="px-5 py-2.5 text-left">
                          <div className="flex max-w-[440px] items-center gap-1.5 truncate font-medium text-[#f5f5f5]">
                            <span className="truncate">{r.title}</span>
                            {r.errors && <span className="flex-none text-xs text-[#ef4444]">▲ {r.errors}</span>}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
                            <span className="inline-flex items-center gap-1.5">
                              <ServiceLogo name={r.model} size={11} />
                              {r.modelName}
                            </span>
                            {r.tags.map((t) => (
                              <span key={t.label} className="inline-flex items-center gap-1.5">
                                <i className="inline-block size-2 rounded-[2px]" style={{ background: t.colour }} />
                                {t.label}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-2.5 text-right tabular-nums text-[#d4d4d4]">{r.steps}</td>
                        <td className="px-5 py-2.5 text-right font-semibold tabular-nums">{r.tokens}</td>
                        <td className="px-5 py-2.5 text-right tabular-nums" style={{ color: durColour(r.seconds) }}>
                          {fmtDur(r.seconds)}
                        </td>
                        <td className="px-5 py-2.5 text-right tabular-nums" style={{ color: costColour(r.cost) }}>
                          ${r.cost.toFixed(4)}
                        </td>
                        <td className="px-5 py-2.5 text-right tabular-nums text-[#d4d4d4]">{fmtAgo(r.ago)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="px-5 pt-4 text-right text-xs text-[#737373]">
                {shown.length} runs · sample data
              </p>
            </section>
          </div>
        </div>

        <section id="integrations" aria-label={tracer.worksWithLabel} className="mx-auto w-[min(1216px,calc(100%-48px))] pb-24 pt-16">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.1em] text-[#737373]">{tracer.worksWithLabel}</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {tracer.worksWith.map((n) => (
              <li key={n} className="opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0">
                <ServiceLogo name={n} size={26} title={serviceLabels[n]} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
