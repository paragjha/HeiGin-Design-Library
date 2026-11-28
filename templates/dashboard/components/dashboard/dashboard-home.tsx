"use client";

import * as React from "react";
import { ArrowRight, Clock, CircleDashed, CircleDot, FileText, ListChecks, MoreVertical, Plus, Search, Sparkles, WandSparkles } from "lucide-react";
import { Avatar, HeiGinMark } from "@heigin/ui";
import { DashboardShell, type DashboardShellProps } from "@/components/dashboard/dashboard-shell";
import { ServiceLogo } from "@/components/dashboard/service-logos";
import { dashboardConfig, type TaskTagKind } from "@/lib/dashboard-config";
import { cn, fill, visibleTasks } from "@/lib/dashboard-utils";

export interface DashboardHomeProps {
  /** Called with the question when someone sends the ask bar. */
  onAsk?: (question: string) => void;
  renderLink?: DashboardShellProps["renderLink"];
}

const TAG_ICON: Partial<Record<TaskTagKind, React.ReactNode>> = {
  time: <Clock aria-hidden="true" />,
  join: <Plus aria-hidden="true" />,
  urgent: <CircleDot aria-hidden="true" />,
  "due-today": <Clock aria-hidden="true" />,
  "in-progress": <CircleDashed aria-hidden="true" />,
  todo: <CircleDashed aria-hidden="true" />,
  "due-soon": <Clock aria-hidden="true" />,
};

/**
 * The assistant's home: a greeting, recently viewed files, the last meeting to summarize, two
 * suggested tasks, a searchable task list that can sort itself by priority, and an ask bar pinned
 * to the foot of the page. Sits inside the DashboardShell.
 */
export function DashboardHome({ onAsk, renderLink }: DashboardHomeProps) {
  const { user, home } = dashboardConfig;
  const [query, setQuery] = React.useState("");
  const [prioritized, setPrioritized] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const tasks = visibleTasks(home.tasks.items, query, prioritized);
  const searchId = React.useId();

  return (
    <DashboardShell renderLink={renderLink}>
      <main className="db-home">
        <div className="db-home__inner">
          <h1 className="db-greeting">
            <span className="db-greeting__hi">
              {fill(home.greeting, { firstName: user.firstName })} <span aria-hidden="true">{home.wave}</span>
            </span>
            <span className="db-greeting__ask">{home.question}</span>
          </h1>

          <div className="db-grid">
            <section className="db-card db-card--recent" aria-labelledby={`${searchId}-recent`}>
              <div className="db-card__head">
                <FileText aria-hidden="true" />
                <h2 id={`${searchId}-recent`}>{home.recent.title}</h2>
                <button type="button" className="db-icon-btn ml-auto" aria-label={`More for ${home.recent.title}`}>
                  <MoreVertical aria-hidden="true" />
                </button>
              </div>
              <ul className="db-files">
                {home.recent.files.map((f) => (
                  <li key={f.href}>
                    <a href={f.href}>
                      <span className="db-files__mark" aria-hidden="true">
                        {f.service === "pdf" ? <span className="db-pdf">PDF</span> : <ServiceLogo name={f.service} size={18} />}
                      </span>
                      {f.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <a className="db-card db-card--link" href={home.meeting.href}>
              <span className="db-card__label">
                <Sparkles aria-hidden="true" /> {home.meeting.label}
              </span>
              <span className="db-meeting">
                <span className="db-meeting__people" aria-hidden="true">
                  {home.meeting.people.map((p) => (
                    <Avatar key={p.name} name={p.name} src={p.photo} size="lg" shape="square" decorative />
                  ))}
                </span>
                <span className="min-w-0">
                  <span className="db-meeting__title">
                    <ServiceLogo name={home.meeting.service} size={16} title="Google Meet" /> {home.meeting.title}
                  </span>
                  <span className="db-meeting__when">{home.meeting.when}</span>
                </span>
              </span>
            </a>

            {home.suggestions.map((s) => (
              <a key={s.href} className="db-card db-card--link" href={s.href}>
                <span className="db-card__label">
                  <HeiGinMark size={16} tile={false} /> {s.label}
                </span>
                <span className="db-suggest">{s.title}</span>
              </a>
            ))}

            <section className="db-card db-card--tasks" aria-labelledby={`${searchId}-tasks`}>
              <div className="db-tasks__head">
                <h2 id={`${searchId}-tasks`} className="db-tasks__title">
                  <ListChecks aria-hidden="true" /> {home.tasks.title} <span className="db-tasks__count">{home.tasks.items.length}</span>
                </h2>
                <label className="db-search">
                  <Search aria-hidden="true" />
                  <span className="sr-only">{home.tasks.search}</span>
                  <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={home.tasks.search} />
                </label>
                <button type="button" className="db-prioritize" aria-pressed={prioritized} onClick={() => setPrioritized((p) => !p)}>
                  <WandSparkles aria-hidden="true" /> {home.tasks.prioritize}
                </button>
              </div>
              <ul className="db-tasks">
                {tasks.map((t) => (
                  <li key={t.id} className="db-task">
                    <span className={cn("db-dot", `db-dot--${t.dot}`)} aria-hidden="true" />
                    <span className="db-task__title">{t.title}</span>
                    <span className="db-task__tags">
                      {t.tags.map((tag) =>
                        tag.href ? (
                          <a key={tag.label} href={tag.href} className={cn("db-tag", `db-tag--${tag.kind}`)}>
                            {TAG_ICON[tag.kind]} {tag.label}
                          </a>
                        ) : (
                          <span key={tag.label} className={cn("db-tag", `db-tag--${tag.kind}`)}>
                            {TAG_ICON[tag.kind]} {tag.label}
                          </span>
                        ),
                      )}
                    </span>
                  </li>
                ))}
                {tasks.length === 0 && <li className="db-task db-task--empty">{home.tasks.empty}</li>}
              </ul>
            </section>
          </div>
        </div>

        <form
          className="db-ask"
          onSubmit={(e) => {
            e.preventDefault();
            if (!question.trim()) return;
            onAsk?.(question.trim());
            setQuestion("");
          }}
        >
          <Sparkles aria-hidden="true" className="db-ask__spark" />
          <input aria-label={home.ask.label} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={home.ask.placeholder} />
          <button type="submit" className="db-ask__send" aria-label={home.ask.send} disabled={!question.trim()}>
            <ArrowRight aria-hidden="true" />
          </button>
        </form>
      </main>
    </DashboardShell>
  );
}

