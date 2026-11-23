"use client";

import * as React from "react";
import { ArrowRightLeft, Bot, MessageCircle, Phone } from "lucide-react";
import { ActivityItem, ActivityTimeline, ApprovalCard, ConversationListItem, MetricCard, MetricGroup } from "@heigin/ui";
import { launchConfig, type ChangelogFigure } from "@/lib/launch-config";
import { cn, parseInline, prefersReducedMotion } from "@/lib/launch-utils";
import { BrandMark } from "@/components/launch/launch-brand";

/**
 * A changelog page: each release has its date pinned at the left while its notes scroll past,
 * with figures that put a live HeiGin panel over a photo. Entries rise in as they reach the window.
 */
export function LaunchChangelog({ className }: { className?: string }) {
  const c = launchConfig.changelog;
  return (
    <div className={cn("lcl min-h-svh", className)}>
      <header className="lcl-head sticky top-0 z-20">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
          <a href={launchConfig.brand.href} className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[0.06em]">
            <BrandMark size={18} />
            {launchConfig.brand.name}
          </a>
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="m-0 flex list-none gap-7 p-0 text-[13px]">
              {c.nav.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="lcl-link">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2 text-[13px]">
            <a href={c.signIn.href} className="lcl-link px-2 max-sm:hidden">
              {c.signIn.label}
            </a>
            <a href={c.contact.href} className="lcl-pill lcl-pill-line max-sm:hidden">
              {c.contact.label}
            </a>
            <a href={c.cta.href} className="lcl-pill lcl-pill-solid">
              {c.cta.label}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-32 md:px-8">
        {c.entries.map((entry, i) => (
          <Entry key={entry.dateTime + entry.title} entry={entry} first={i === 0} />
        ))}
      </main>
    </div>
  );
}

function Entry({ entry, first }: { entry: (typeof launchConfig.changelog.entries)[number]; first: boolean }) {
  const ref = React.useRef<HTMLElement>(null);
  const [shown, setShown] = React.useState(first);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  const id = `cl-${entry.dateTime}`;
  return (
    <article ref={ref} aria-labelledby={id} data-shown={shown} className="lcl-entry grid gap-x-10 pt-[clamp(56px,9vh,96px)] md:grid-cols-[180px_minmax(0,640px)]">
      <div>
        <time dateTime={entry.dateTime} className="lcl-date block text-[13px] md:sticky md:top-[88px]">
          {entry.date}
        </time>
      </div>
      <div className="lcl-body min-w-0">
        {first && <h1 className="lcl-eyebrow m-0 mb-1 mt-4 text-[13px] font-normal md:mt-0">{launchConfig.changelog.eyebrow}</h1>}
        <h2 id={id} className={cn("lcl-title m-0 text-[clamp(24px,2.6vw,30px)] font-medium leading-[1.2] tracking-[-0.015em]", !first && "mt-3 md:mt-0")}>
          {entry.title}
        </h2>
        <Paragraphs body={entry.body} />
        {entry.figure && <Figure figure={entry.figure} />}
        {entry.sections?.map((s) => (
          <section key={s.title}>
            <h3 className="lcl-title m-0 mt-10 text-[19px] font-semibold tracking-[-0.01em]">{s.title}</h3>
            <Paragraphs body={s.body} />
            {s.figure && <Figure figure={s.figure} />}
          </section>
        ))}
      </div>
    </article>
  );
}

function Paragraphs({ body }: { body: string[] }) {
  return body.map((p, i) => (
    <p key={i} className="lcl-text m-0 mt-4 text-[15px] leading-[1.6]">
      <Rich text={p} />
    </p>
  ));
}

function Rich({ text }: { text: string }) {
  return parseInline(text).map((seg, i) =>
    seg.kind === "bold" ? (
      <strong key={i} className="font-semibold text-[var(--lcl-ink)]">
        {seg.value}
      </strong>
    ) : (
      <React.Fragment key={i}>{seg.value}</React.Fragment>
    ),
  );
}

/** A live HeiGin panel over a backdrop photo, or over plain grey when the figure has no photo. */
function Figure({ figure }: { figure: ChangelogFigure }) {
  return (
    <figure className={cn("lcl-figure relative m-0 mt-7 grid min-h-[clamp(240px,34vw,380px)] place-items-center overflow-hidden rounded-[6px] px-[6%] py-[8%]", !figure.image && "lcl-figure-plain")}>
      {figure.image && <img src={figure.image} alt="" className="absolute inset-0 size-full object-cover" draggable={false} />}
      <div className={cn("lcl-panel relative w-full", figure.ui === "metrics" ? "max-w-[560px]" : "max-w-[440px]")}>
        <Panel ui={figure.ui} />
      </div>
    </figure>
  );
}

const TIMELINE_ICON = { agent: Bot, stage: ArrowRightLeft, call: Phone, message: MessageCircle };

function Panel({ ui }: { ui: ChangelogFigure["ui"] }) {
  const p = launchConfig.changelog.panels;
  if (ui === "approval")
    return <ApprovalCard {...p.approval} rung={1} onApprove={() => undefined} onReject={() => undefined} />;
  if (ui === "inbox")
    return (
      <ul className="m-0 list-none overflow-hidden rounded-[10px] border border-[var(--hg-color-border)] bg-[var(--hg-color-surface)] p-1">
        {p.inbox.map((m, i) => (
          <ConversationListItem key={m.name} {...m} href="#inbox" selected={i === 0} />
        ))}
      </ul>
    );
  if (ui === "metrics")
    return (
      <MetricGroup columns={3} label="Pipeline">
        {p.metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </MetricGroup>
    );
  return (
    <div className="rounded-[10px] border border-[var(--hg-color-border)] bg-[var(--hg-color-surface)] p-4">
      <ActivityTimeline label="Activity for Asha Rao">
        {p.timeline.map((t) => {
          const Icon = TIMELINE_ICON[t.kind];
          return (
            <ActivityItem key={t.dateTime} icon={<Icon size={14} />} dateTime={t.dateTime} timeLabel={t.timeLabel}>
              <Rich text={t.text} />
            </ActivityItem>
          );
        })}
      </ActivityTimeline>
    </div>
  );
}
