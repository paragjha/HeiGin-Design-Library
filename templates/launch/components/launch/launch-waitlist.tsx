"use client";

import * as React from "react";
import {
  BadgeDollarSign,
  Handshake,
  Inbox,
  Kanban,
  LifeBuoy,
  Lightbulb,
  Mail,
  MessageCircle,
  Moon,
  Pencil,
  Receipt,
  SquareTerminal,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { HeiGinMark } from "@heigin/ui";
import { launchConfig, type WaitlistIcon } from "@/lib/launch-config";
import { cn, fillFor, parseInline, prefersReducedMotion } from "@/lib/launch-utils";
import { BrandMark } from "@/components/launch/launch-brand";

const ICONS: Record<WaitlistIcon, LucideIcon> = {
  "badge-dollar": BadgeDollarSign,
  "life-buoy": LifeBuoy,
  mail: Mail,
  receipt: Receipt,
  pencil: Pencil,
  inbox: Inbox,
  kanban: Kanban,
  message: MessageCircle,
  terminal: SquareTerminal,
  handshake: Handshake,
  moon: Moon,
  lightbulb: Lightbulb,
};

// Where each of the six photo tiles sits on the arc around the centre tile: lift (px) and tilt (deg).
const TILE_POSE = [
  [10, -8],
  [3, 5],
  [-2, -3],
  [-2, 4],
  [3, -6],
  [10, 7],
] as const;

/**
 * A cream waitlist page: app tiles pop in around a sketched "yours" tile, the headline's
 * highlighted words blur into their next option on a tap, and an email form joins the list.
 * Pass `onJoin` to send the address to your list; without it the form only shows its success state.
 */
export function LaunchWaitlist({ className, onJoin }: { className?: string; onJoin?: (email: string) => Promise<void> }) {
  const c = launchConfig.waitlist;
  const [lang, setLang] = React.useState(c.languages[0]);
  const [picks, setPicks] = React.useState(() => c.slots.map(() => 0));
  const [swapped, setSwapped] = React.useState(() => new Set<number>());
  const hintId = React.useId();
  const intro = parseInline(c.intro);

  const swap = (slot: number) => {
    setPicks((p) => p.map((v, i) => (i === slot ? (v + 1) % c.slots[slot]!.length : v)));
    setSwapped((s) => new Set(s).add(slot));
  };

  return (
    <section className={cn("lw relative min-h-svh overflow-hidden", className)}>
      <header className="lw-rise mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 pt-5 md:px-8">
        <a href={launchConfig.brand.href} className="flex items-center gap-2 text-[12px] font-extrabold leading-[1.05] text-[var(--lw-ink)]">
          <BrandMark size={24} />
          <span className="flex flex-col">
            <span className="lw-marker w-fit px-[3px]">{c.logoLines[0]}</span>
            <span>{c.logoLines[1]}</span>
          </span>
        </a>
        <div className="flex items-center gap-4">
          <nav aria-label="Main" className="hidden md:block">
            <ul className="m-0 flex list-none gap-5 p-0 text-[12.5px] text-[var(--lw-soft)]">
              {c.nav.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="lw-link">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div role="group" aria-label="Language" className="flex rounded-full bg-[var(--lw-chip)] p-[3px]">
            {c.languages.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className="lw-toggle rounded-full px-2.5 py-1 text-[11px] font-bold text-[var(--lw-soft)] aria-pressed:bg-white aria-pressed:text-[var(--lw-ink)] aria-pressed:shadow-sm"
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-4xl flex-col items-center px-5 pb-20 pt-[clamp(64px,14vh,150px)] text-center">
        <TileRow />

        <h1 className="lw-title lw-rise m-0 mt-9 text-[clamp(28px,5vw,52px)] font-bold leading-[1.16] tracking-[-0.025em]">
          {c.headline.map((line, li) => (
            <span key={li} className={cn("block", li === 0 ? "text-[var(--lw-ink)]" : "text-[var(--lw-grey)]")}>
              {line.map((part, pi) =>
                typeof part === "string" ? (
                  <React.Fragment key={pi}>{part}</React.Fragment>
                ) : "mark" in part ? (
                  <span key={pi} className="whitespace-nowrap text-[var(--lw-ink)]">
                    <BrandMark size={16} className="lw-pop mr-[0.12em] inline-block h-[0.82em] w-[0.82em] align-[-0.08em]" style={{ animationDelay: "720ms" }} />
                    {launchConfig.brand.name}
                  </span>
                ) : (
                  <SwapWord key={pi} slot={part.slot} pick={picks[part.slot]!} onSwap={swap} hintId={hintId} />
                ),
              )}
            </span>
          ))}
        </h1>

        <p id={hintId} className="lw-rise m-0 mt-5 text-[12px] text-[var(--lw-soft)]" aria-live="polite" style={{ animationDelay: "160ms" }}>
          {swapped.size === c.slots.length ? c.hintAfter : c.hint}
          <svg viewBox="0 0 20 16" width="18" height="14" aria-hidden="true" className="ml-1 inline-block align-[-2px] text-[var(--lw-blue)]">
            <path d="M2 14c5-1 10-5 13-11M10 3h5.5v5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </p>

        <p className="lw-rise m-0 mt-7 max-w-[440px] text-[14.5px] leading-[1.7] text-[var(--lw-soft)]" style={{ animationDelay: "220ms" }}>
          {intro.map((seg, i) =>
            seg.kind === "bold" ? (
              <strong key={i} className="font-bold text-[var(--lw-ink)]">
                {seg.value}
              </strong>
            ) : seg.kind === "token" && seg.value === "mail" ? (
              <span key={i} className="lw-pop mx-[2px] inline-grid h-[18px] w-[18px] place-items-center rounded-[5px] bg-[var(--lw-blue)] align-[-3px] text-white" style={{ animationDelay: "900ms" }}>
                <Mail size={11} strokeWidth={2.6} aria-hidden="true" />
              </span>
            ) : (
              <React.Fragment key={i}>{seg.value}</React.Fragment>
            ),
          )}
        </p>

        <JoinForm onJoin={onJoin} />

        <p className="lw-rise m-0 mt-4 flex items-center justify-center gap-1.5 text-[11.5px] text-[var(--lw-soft)]" style={{ animationDelay: "340ms" }}>
          <Tag size={12} aria-hidden="true" className="shrink-0 fill-[#f0614b] text-[#c2412f]" />
          {c.note}
        </p>
      </div>
    </section>
  );
}

/** The six photo tiles on an arc, with the sketched brand tile in the middle. */
function TileRow() {
  const { tiles, tileLabel } = launchConfig.waitlist;
  const tile = (i: number) => {
    const [lift, tilt] = TILE_POSE[i]!;
    const src = tiles[i];
    return (
      <span
        key={i}
        className="lw-tile lw-pop block size-[clamp(34px,7vw,50px)] shrink-0 overflow-hidden rounded-[28%] border-[2.5px] border-white"
        style={{
          transform: `translateY(${lift}px) rotate(${tilt}deg)`,
          background: src ? undefined : fillFor(i),
          animationDelay: `${80 + (i < 3 ? i : i + 1) * 70}ms`,
        }}
      >
        {src && <img src={src} alt="" className="size-full object-cover" draggable={false} />}
      </span>
    );
  };
  return (
    <div className="flex items-end justify-center gap-[clamp(6px,1.6vw,14px)]" aria-hidden="true">
      {[0, 1, 2].map(tile)}
      <span className="relative mx-[clamp(2px,0.8vw,8px)] block">
        <span className="lw-label absolute -left-[40px] -top-[24px] whitespace-nowrap text-[15px] font-semibold text-[var(--lw-ink)]">
          {tileLabel}
          <svg viewBox="0 0 30 22" width="26" height="20" className="absolute left-[36px] top-[6px] text-[var(--lw-blue)]">
            <path className="lw-draw" pathLength={1} style={{ animationDelay: "1.5s", animationDuration: "0.5s" }} d="M2 3c9-2 18 1 22 11M19 12l5 3 2-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <SketchTile />
      </span>
      {[3, 4, 5].map(tile)}
    </div>
  );
}

// Hatching strokes across the centre tile, drawn one after another.
const HATCH = ["M12 20 22 10", "M11 32 34 9", "M12 44 46 10", "M16 52 54 14", "M28 54 55 27", "M40 55 56 40"];

/** The centre tile, drawn in like a marker sketch: yellow fill, hatching, a heavy outline, then the brand mark. */
function SketchTile() {
  return (
    <svg viewBox="0 0 64 64" className="lw-sketch block size-[clamp(48px,9.5vw,68px)] -translate-y-[14px] overflow-visible">
      <path className="lw-sketch-fill" d="M14 7c12-2 26-2 37 0 6 2 7 7 7 14 1 9 1 19-1 28-2 6-7 8-14 8-10 1-21 1-30-1-6-2-7-7-7-14-1-10-1-20 1-28 1-4 3-6 7-7Z" />
      {HATCH.map((d, i) => (
        <path key={d} className="lw-draw lw-hatch" pathLength={1} d={d} style={{ animationDelay: `${0.8 + i * 0.07}s`, animationDuration: "0.35s" }} />
      ))}
      <path
        className="lw-draw lw-outline"
        pathLength={1}
        style={{ animationDelay: "1.05s" }}
        d="M15 7.5c11-1.8 25-2 36 .4 5.5 1.6 6.8 6.6 7 13.2.6 9.4.6 18.8-.8 27.8-1.6 6-6.4 8.2-13.6 8.4-10.4.8-21 .6-30.4-1.2C7.6 54.6 6.6 49.6 6.2 43 5.6 33.4 5.6 23.6 7.4 15c1-4.6 3.6-6.6 7.6-7.5"
      />
      <g className="lw-sketch-mark">
        {launchConfig.brand.logoSrc ? (
          <image href={launchConfig.brand.logoSrc} x={20} y={20} width={24} height={24} />
        ) : (
          <HeiGinMark tile={false} size={26} x={19} y={19} />
        )}
      </g>
    </svg>
  );
}

/** A highlighted word that blurs out and its next option blurs in on a tap, while the highlight stretches to fit. */
function SwapWord({ slot, pick, onSwap, hintId }: { slot: number; pick: number; onSwap: (slot: number) => void; hintId: string }) {
  const options = launchConfig.waitlist.slots[slot]!;
  const [shown, setShown] = React.useState(pick);
  const [leaving, setLeaving] = React.useState(false);
  const pill = React.useRef<HTMLButtonElement>(null);
  const width = React.useRef(0);
  const [tapped, setTapped] = React.useState(false); // after the first swap, icons swap in with the word instead of popping in late
  const opt = options[shown]!;
  const Icon = ICONS[opt.icon];

  // A tap first blurs the old word out, then swaps it in.
  React.useEffect(() => {
    if (pick === shown) return;
    setTapped(true);
    if (prefersReducedMotion()) {
      setShown(pick);
      return;
    }
    setLeaving(true);
    const id = window.setTimeout(() => {
      setLeaving(false);
      setShown(pick);
    }, 170);
    return () => window.clearTimeout(id);
  }, [pick, shown]);

  // The highlight eases from the old word's width to the new one's.
  React.useLayoutEffect(() => {
    const el = pill.current;
    if (!el) return;
    const to = el.getBoundingClientRect().width;
    const from = width.current;
    width.current = to;
    if (!from || from === to || prefersReducedMotion()) return;
    el.animate([{ width: `${from}px` }, { width: `${to}px` }], { duration: 260, easing: "cubic-bezier(0.3, 0.9, 0.1, 1)" });
  }, [shown]);

  return (
    <button
      ref={pill}
      type="button"
      onClick={() => onSwap(slot)}
      aria-describedby={hintId}
      className="lw-swap lw-marker ml-[0.04em] inline-flex items-baseline gap-[0.16em] whitespace-nowrap px-[0.16em] text-[var(--lw-ink)]"
    >
      <span key={shown} className={cn("lw-word inline-flex items-baseline gap-[0.16em]", leaving && "lw-word-out")}>
        <Icon
          aria-hidden="true"
          className={cn("h-[0.72em] w-[0.72em] shrink-0 self-center", !tapped && "lw-pop")}
          strokeWidth={2.6}
          style={tapped ? undefined : { animationDelay: `${480 + slot * 130}ms` }}
        />
        {opt.word}
      </span>
    </button>
  );
}

function JoinForm({ onJoin }: { onJoin?: (email: string) => Promise<void> }) {
  const c = launchConfig.waitlist;
  const [state, setState] = React.useState<"idle" | "pending" | "done" | "error">("idle");
  const inputId = React.useId();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!email) return;
    setState("pending");
    try {
      await onJoin?.(email);
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="lw-rise mt-8 w-full max-w-[400px]" style={{ animationDelay: "280ms" }}>
      {state === "done" ? (
        <p role="status" className="m-0 rounded-full border border-[var(--lw-line)] bg-white px-5 py-3 text-[13.5px] font-semibold text-[var(--lw-ink)]">
          {c.successMessage}
        </p>
      ) : (
        <form onSubmit={submit} className="lw-form flex items-center gap-1 rounded-full border border-[var(--lw-line)] bg-white p-[5px] pl-5">
          <label className="sr-only" htmlFor={inputId}>
            Email
          </label>
          <input
            id={inputId}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={c.placeholder}
            className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--lw-ink)] outline-none placeholder:text-[#b3aea5]"
          />
          <button type="submit" disabled={state === "pending"} className="lw-submit shrink-0 rounded-full bg-[var(--lw-ink)] px-4 py-2.5 text-[13px] font-bold text-white">
            {state === "pending" ? c.pendingLabel : c.submitLabel}
          </button>
        </form>
      )}
      {state === "error" && (
        <p role="alert" className="m-0 mt-2 text-[12px] text-[#b42318]">
          {c.errorMessage}
        </p>
      )}
    </div>
  );
}
