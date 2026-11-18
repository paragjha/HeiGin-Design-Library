"use client";

import * as React from "react";
import { ArrowRight, ArrowUpRight, Check, GitFork, TriangleAlert } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../ui/button";
import { HeiGinMark } from "../ui/heigin-mark";
import { Kbd } from "../ui/kbd";
import { Loader, type LoaderVariant } from "../ui/loader";
import { VisuallyHidden } from "../ui/visually-hidden";
import styles from "./agent-decision-tree.module.css";

export interface DecisionOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Quiet second line: cost, timing, scope. */
  detail?: React.ReactNode;
  /** A consequence worth flagging; shown in the warning tone instead of `detail`. */
  warning?: React.ReactNode;
  /** Small marks for the services this option touches. */
  apps?: React.ReactNode[];
  /** Context the agent wants you to see before choosing (a policy, a limit). */
  note?: { text: React.ReactNode; source?: React.ReactNode };
}

export interface DecisionBranch {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Follow-up question; pair it with `options`. */
  question?: string;
  options?: DecisionOption[];
  /** The option the agent would pick. */
  recommendedOption?: string;
  /** For a branch with no follow-up: what happens if you pick it. */
  outcome?: React.ReactNode;
  apps?: React.ReactNode[];
}

export interface AgentDecision {
  id: string;
  agent: { name: string; model?: string; icon?: React.ReactNode };
  risk?: "high" | "medium" | "low";
  question: string;
  context?: React.ReactNode;
  branches: DecisionBranch[];
  /** The branch the agent would pick. */
  recommended?: string;
  /** Offer an "Other…" branch with a free-text instruction. Default true. */
  allowOther?: boolean;
}

export type DecisionChoice =
  | { kind: "option"; branch: DecisionBranch; option: DecisionOption }
  | { kind: "outcome"; branch: DecisionBranch }
  | { kind: "other"; text: string };

export interface AgentDecisionTreeProps {
  /** The queue, oldest first. Decided items move on by themselves. */
  decisions: AgentDecision[];
  /**
   * Called when a person commits a choice. Return a Promise to show the loader until it settles.
   * For an "Other…" instruction, resolve with the agent's reply to show it.
   */
  onDecide: (decision: AgentDecision, choice: DecisionChoice) => void | string | Promise<void | string>;
  /** Indicator while a decision is being sent: the thinking orb (default) or a spinner. */
  loader?: LoaderVariant;
  title?: string;
  /** Number keys pick a branch or option while focus is inside the tree. Default true. */
  hotkeys?: boolean;
  /** Shown once every decision is made. */
  empty?: React.ReactNode;
  className?: string;
}

const RISK_LABEL = { high: "High risk", medium: "Medium risk", low: "Low risk" } as const;

function Apps({ items }: { items?: React.ReactNode[] }) {
  if (!items?.length) return null;
  return (
    <span className={styles.dtApps} aria-hidden="true">
      {items.map((a, i) => (
        <span key={i}>{a}</span>
      ))}
    </span>
  );
}

/**
 * A queue of decisions an agent needs from a person, drawn as a tree: the question, the branches it
 * considered, follow-up options with their consequences, and the agent's own pick. One click (or a
 * number key) commits; the next decision slides in.
 */
export function AgentDecisionTree({
  decisions,
  onDecide,
  loader = "orb",
  title = "Decisions",
  hotkeys = true,
  empty,
  className,
}: AgentDecisionTreeProps) {
  const headingId = React.useId();
  const uid = React.useId();
  const [decided, setDecided] = React.useState<Set<string>>(() => new Set());
  const [cursor, setCursor] = React.useState(0);
  const [chosen, setChosen] = React.useState<string | null>(null);
  const [hover, setHover] = React.useState<string | null>(null);
  const [phase, setPhase] = React.useState<"choosing" | "sending" | "sent" | "leaving">("choosing");
  const [picked, setPicked] = React.useState<string | null>(null);
  const [reply, setReply] = React.useState<string | null>(null);
  const [otherText, setOtherText] = React.useState("");
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wiresRef = React.useRef<SVGSVGElement>(null);
  const otherRef = React.useRef<HTMLInputElement>(null);

  const open = decisions.filter((d) => !decided.has(d.id));
  const current = open.length ? open[Math.min(cursor, open.length - 1)] : undefined;
  const branches: DecisionBranch[] = current
    ? [...current.branches, ...(current.allowOther === false ? [] : [{ id: "__other", label: "Other…" }])]
    : [];
  const chosenBranch = branches.find((b) => b.id === chosen);
  const focusBranch = chosen ?? hover ?? current?.recommended ?? null;

  const reset = React.useCallback(() => {
    setChosen(null);
    setHover(null);
    setPhase("choosing");
    setPicked(null);
    setReply(null);
    setOtherText("");
  }, []);

  // A new decision starts fresh.
  React.useEffect(() => reset(), [current?.id, reset]);

  const commit = async (choice: DecisionChoice, pickedId: string) => {
    if (!current || phase !== "choosing") return;
    setPicked(pickedId);
    setPhase("sending");
    const result = await onDecide(current, choice);
    if (typeof result === "string") setReply(result);
    setPhase("sent");
    window.setTimeout(() => {
      setPhase("leaving");
      // The decided item drops out of the queue, so the cursor now points at the next one.
      window.setTimeout(() => setDecided((d) => new Set(d).add(current.id)), 320);
    }, typeof result === "string" ? 2200 : 1100);
  };

  const choose = (branch: DecisionBranch) => {
    if (phase !== "choosing") return;
    setChosen(branch.id);
    setHover(null);
    if (branch.id === "__other") window.setTimeout(() => otherRef.current?.focus(), 30);
  };

  const skip = () => {
    if (open.length < 2 || phase !== "choosing") return;
    setCursor((c) => (Math.min(c, open.length - 1) + 1) % open.length);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!hotkeys || !current || e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.target as HTMLElement).tagName === "INPUT") {
      if (e.key === "Escape") reset();
      return;
    }
    const n = Number.parseInt(e.key, 10);
    if (!Number.isNaN(n) && n > 0) {
      if (!chosenBranch) {
        const b = branches[n - 1];
        if (b) {
          e.preventDefault();
          choose(b);
        }
      } else if (chosenBranch.options) {
        const o = chosenBranch.options[n - 1];
        if (o) {
          e.preventDefault();
          commit({ kind: "option", branch: chosenBranch, option: o }, o.id);
        }
      }
    } else if (e.key === "Escape" && chosen && phase === "choosing") {
      e.preventDefault();
      reset();
    } else if (e.key === "ArrowRight" && !chosen) {
      e.preventDefault();
      skip();
    }
  };

  /* ---- wires, measured from the DOM ---- */
  const draw = React.useCallback(() => {
    const stage = stageRef.current;
    const svg = wiresRef.current;
    if (!stage || !svg) return;
    if (getComputedStyle(svg).display === "none") return;
    const sb = stage.getBoundingClientRect();
    const rel = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { l: r.left - sb.left, r: r.right - sb.left, t: r.top - sb.top, b: r.bottom - sb.top, cy: r.top - sb.top + r.height / 2, h: r.height };
    };
    const root = stage.querySelector("[data-dt-root]");
    if (!root) return;
    const rr = rel(root);
    const R = 8;
    const elbow = (x1: number, y1: number, xm: number, x2: number, y2: number) => {
      if (Math.abs(y2 - y1) < 1) return `M${x1} ${y1} H${x2}`;
      const s = y2 > y1 ? 1 : -1;
      const r = Math.min(R, Math.abs(y2 - y1) / 2, Math.abs(xm - x1), Math.abs(x2 - xm));
      return `M${x1} ${y1} H${xm - r} Q${xm} ${y1} ${xm} ${y1 + s * r} V${y2 - s * r} Q${xm} ${y2} ${xm + r} ${y2} H${x2}`;
    };
    let out = "";
    stage.querySelectorAll<HTMLElement>("[data-dt-lane]").forEach((lane) => {
      if (lane.getBoundingClientRect().height < 4) return;
      const id = lane.dataset.dtLane;
      const hot = id === lane.closest("[data-focus]")?.getAttribute("data-focus");
      const dim = lane.dataset.dim === "true";
      const cls = cn(hot ? styles.dtWireHot : styles.dtWire, dim && styles.dtWireDim);
      const br = lane.querySelector("[data-dt-branch]");
      if (!br) return;
      const b = rel(br);
      out += `<path class="${cls}" d="${elbow(rr.r, rr.cy, rr.r + 22, b.l, b.cy)}"/>`;
      const ask = lane.querySelector("[data-dt-ask]");
      if (ask) {
        const a = rel(ask);
        out += `<path class="${cls}" d="${elbow(b.r, b.cy, b.r + 18, a.l, a.cy)}"/>`;
        const x = a.l + 13;
        lane.querySelectorAll("[data-dt-opt], [data-dt-pill]").forEach((o) => {
          const r = rel(o);
          const y = r.t + Math.min(19, r.h / 2);
          out += `<path class="${o.hasAttribute("data-dt-pill") ? styles.dtWireHot : cls}" d="M${x} ${a.b} V${y - R} Q${x} ${y} ${x + R} ${y} H${r.l}"/>`;
        });
      }
      const oc = lane.querySelector("[data-dt-outcome]");
      if (oc) out += `<path class="${cls}" d="M${b.r} ${b.cy} H${rel(oc).l}"/>`;
      const pill = !ask ? lane.querySelector("[data-dt-pill]") : null;
      if (pill) {
        const p = rel(pill);
        out += `<path class="${styles.dtWireHot}" d="${elbow(b.r, b.cy, b.r + 18, p.l, p.cy)}"/>`;
      }
    });
    svg.innerHTML = out;
  }, []);

  React.useLayoutEffect(() => {
    let raf = 0;
    const until = performance.now() + 700;
    const loop = () => {
      draw();
      if (performance.now() < until) raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [draw, current?.id, chosen, hover, phase, reply]);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(stage);
    return () => ro.disconnect();
  }, [draw, current?.id]);

  const pill =
    phase === "sending" || phase === "sent" || phase === "leaving" ? (
      reply ? (
        <div className={styles.dtReply} data-dt-pill role="status">
          <b>
            <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
            Sent to the {current?.agent.name.toLowerCase()}
          </b>
          <p>{reply}</p>
        </div>
      ) : (
        <div className={styles.dtPill} data-dt-pill role="status">
          {phase === "sending" ? <Loader variant={loader} size="sm" label={null} /> : <Check aria-hidden="true" strokeWidth={2} />}
          <b>{phase === "sending" ? "Sending" : "Approved"}</b>
          <span>· {phase === "sending" ? "telling the agent" : "running"}</span>
        </div>
      )
    ) : null;

  const waiting = open.length;

  return (
    <section className={cn(styles.dt, className)} aria-labelledby={headingId} onKeyDown={onKeyDown}>
      <header className={styles.dtTop}>
        <GitFork className={styles.dtLogo} aria-hidden="true" strokeWidth={1.8} />
        <h3 id={headingId} className={styles.dtTitle}>
          {title}
        </h3>
        <span className={styles.dtWaiting}>{waiting ? `${waiting} waiting for you` : `${decisions.length} of ${decisions.length} decided`}</span>
        {waiting > 0 && (
          <span className={styles.dtPager}>
            <span className={styles.dtDots} aria-hidden="true">
              {open.map((d) => (
                <i key={d.id} data-on={d.id === current?.id} />
              ))}
            </span>
            {Math.min(cursor, open.length - 1) + 1} of {open.length}
          </span>
        )}
      </header>

      {!current ? (
        <div className={styles.dtEmpty} role="status">
          {empty ?? (
            <>
              <span className={styles.dtEmptyIcon} aria-hidden="true">
                <Check strokeWidth={2} />
              </span>
              <b>All decided</b>
              <p>New decisions from your agents show up here.</p>
            </>
          )}
        </div>
      ) : (
        <div className={styles.dtScroll}>
          <article
            key={current.id}
            ref={stageRef}
            className={styles.dtStage}
            data-phase={phase}
            data-focus={focusBranch ?? undefined}
            aria-labelledby={`${uid}-q`}
          >
            <svg ref={wiresRef} className={styles.dtWires} aria-hidden="true" />
            <div className={styles.dtRoot}>
              {current.risk && (
                <span className={styles.dtRisk} data-risk={current.risk}>
                  {RISK_LABEL[current.risk]}
                </span>
              )}
              <div className={styles.dtRootCard} data-dt-root>
                <div className={styles.dtAgent}>
                  <span className={styles.dtMark}>{current.agent.icon ?? <HeiGinMark size={16} />}</span>
                  <span>
                    <b>{current.agent.name}</b>
                    {current.agent.model && <small>{current.agent.model}</small>}
                  </span>
                </div>
                <p id={`${uid}-q`} className={styles.dtQuestion}>
                  {current.question}
                </p>
                {current.context && <p className={styles.dtContext}>{current.context}</p>}
              </div>
            </div>

            <ol className={styles.dtLanes} aria-label="Options">
              {branches.map((b, i) => {
                const isChosen = chosen === b.id;
                const gone = chosen !== null && !isChosen;
                const dim = chosen === null && hover !== null && hover !== b.id;
                const isOther = b.id === "__other";
                const recommended = current.recommended === b.id;
                return (
                  <li key={b.id} className={styles.dtLane} data-dt-lane={b.id} data-gone={gone} data-dim={dim} aria-hidden={gone || undefined}>
                    <div className={styles.dtLaneInner}>
                      {isOther && isChosen ? (
                        <form
                          className={styles.dtBranch}
                          data-dt-branch
                          data-hot="true"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const text = otherText.trim();
                            if (text) commit({ kind: "other", text }, "__other");
                          }}
                        >
                          <label htmlFor={`${uid}-other`} className={styles.srOnly}>
                            Tell the {current.agent.name.toLowerCase()} what to do instead
                          </label>
                          <input
                            ref={otherRef}
                            id={`${uid}-other`}
                            className={styles.dtOtherInput}
                            value={otherText}
                            disabled={phase !== "choosing"}
                            placeholder="Tell the agent what to do instead…"
                            onChange={(e) => setOtherText(e.target.value)}
                          />
                          <button type="submit" className={styles.dtSend} disabled={!otherText.trim() || phase !== "choosing"} aria-label="Send instruction">
                            <ArrowRight aria-hidden="true" strokeWidth={1.8} />
                          </button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          className={cn(styles.dtBranch, isOther && styles.dtBranchOther)}
                          data-dt-branch
                          data-hot={focusBranch === b.id}
                          aria-expanded={b.options || isOther ? isChosen : undefined}
                          aria-pressed={!b.options && !isOther ? isChosen : undefined}
                          tabIndex={gone ? -1 : undefined}
                          onMouseEnter={() => chosen === null && setHover(b.id)}
                          onMouseLeave={() => chosen === null && setHover(null)}
                          onFocus={() => chosen === null && setHover(b.id)}
                          onBlur={() => chosen === null && setHover(null)}
                          onClick={() => (isChosen ? undefined : choose(b))}
                        >
                          <span className={styles.dtNum} aria-hidden="true">
                            {i + 1}
                          </span>
                          {b.icon && (
                            <span className={styles.dtIco} aria-hidden="true">
                              {b.icon}
                            </span>
                          )}
                          <span className={styles.dtLbl}>{b.label}</span>
                          {recommended && <span className={styles.dtPick}>Agent’s pick</span>}
                        </button>
                      )}

                      {b.question && b.options && (
                        <div className={styles.dtSub}>
                          <div className={styles.dtAsk} data-dt-ask>
                            {b.question}
                          </div>
                          <ul className={styles.dtOpts}>
                            {b.options.map((o, k) => {
                              const noteId = o.note ? `${uid}-${b.id}-${o.id}-note` : undefined;
                              return (
                                <React.Fragment key={o.id}>
                                  <li className={styles.dtOptItem}>
                                    <button
                                      type="button"
                                      className={styles.dtOpt}
                                      data-dt-opt
                                      data-faded={picked !== null && picked !== o.id}
                                      aria-describedby={noteId}
                                      tabIndex={isChosen ? undefined : -1}
                                      disabled={phase !== "choosing"}
                                      onClick={() => {
                                        if (!isChosen) choose(b);
                                        commit({ kind: "option", branch: b, option: o }, o.id);
                                      }}
                                    >
                                      <span className={styles.dtNum} aria-hidden="true" data-show={isChosen}>
                                        {k + 1}
                                      </span>
                                      <span className={styles.dtOptTitle}>
                                        {o.icon && (
                                          <span className={styles.dtIco} aria-hidden="true">
                                            {o.icon}
                                          </span>
                                        )}
                                        {o.label}
                                        {b.recommendedOption === o.id && <em>Agent’s pick</em>}
                                      </span>
                                      <span className={styles.dtOptMeta}>
                                        {o.warning ? <span className={styles.dtWarn}>{o.warning}</span> : o.detail}
                                        <Apps items={o.apps} />
                                      </span>
                                    </button>
                                    {o.note && (
                                      <span className={styles.dtNote} id={noteId} role="note">
                                        <small>
                                          <TriangleAlert aria-hidden="true" strokeWidth={2} />
                                          Agent’s note
                                        </small>
                                        <span className={styles.dtNoteText}>{o.note.text}</span>
                                        {o.note.source && <span className={styles.dtNoteSrc}>{o.note.source}</span>}
                                      </span>
                                    )}
                                  </li>
                                  {isChosen && picked === o.id && pill && <li className={styles.dtOptItem}>{pill}</li>}
                                </React.Fragment>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {b.outcome !== undefined && (
                        <div className={styles.dtOutcome} data-dt-outcome>
                          <span>{b.outcome}</span>
                          <Apps items={b.apps} />
                        </div>
                      )}
                      {isChosen && b.outcome !== undefined && phase === "choosing" && (
                        <Button size="sm" touch={false} onClick={() => commit({ kind: "outcome", branch: b }, b.id)}>
                          Confirm
                        </Button>
                      )}
                      {isChosen && !b.options && pill}
                    </div>
                  </li>
                );
              })}
            </ol>
          </article>
        </div>
      )}

      {current && (
        <footer className={styles.dtFoot}>
          {!chosenBranch ? (
            <>
              <span>
                Pick a branch <Kbd>1</Kbd> – <Kbd>{branches.length}</Kbd>
              </span>
              {open.length > 1 && (
                <>
                  <span aria-hidden="true">·</span>
                  <button type="button" className={styles.dtLink} onClick={skip}>
                    Next <Kbd aria-hidden="true">→</Kbd>
                  </button>
                </>
              )}
            </>
          ) : phase === "choosing" ? (
            <>
              <span>
                {chosenBranch.options ? (
                  <>
                    Then <Kbd>1</Kbd> – <Kbd>{chosenBranch.options.length}</Kbd>
                  </>
                ) : chosenBranch.id === "__other" ? (
                  "Type your instruction, then press Enter"
                ) : (
                  "Confirm to send it"
                )}
              </span>
              <span aria-hidden="true">·</span>
              <button type="button" className={styles.dtLink} onClick={reset}>
                Back <Kbd aria-hidden="true">esc</Kbd>
              </button>
            </>
          ) : (
            <VisuallyHidden>Sending your decision</VisuallyHidden>
          )}
        </footer>
      )}
    </section>
  );
}
