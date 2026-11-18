"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { HeiGinMark } from "./heigin-mark";
import styles from "./type-motion.module.css";

export type TypeMotionEffect = "pop" | "shuffle" | "word" | "lens" | "bubble" | "swell" | "sticker" | "burst";

/** An image (`{ src }`) or any element, such as an icon or a styled span. */
export type TypeMotionArt = { src: string; alt?: string } | React.ReactElement;

export interface TypeMotionProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** The headline. Use "\n" for a line break. */
  text: string;
  /** What hovering does. Default `lens`: letters near the pointer turn into artwork. */
  effect?: TypeMotionEffect;
  /** What letters turn into. Defaults to HeiGin orbs, symbols and the mark. */
  artwork?: TypeMotionArt[];
  as?: "h1" | "h2" | "h3" | "p" | "div";
  /** Reach of `lens` and `swell`, in em. Default 0.85. */
  radius?: number;
  /** How long a letter stays swapped after the pointer leaves, in ms. Default 900. */
  hold?: number;
  /** Artwork size relative to the type. Default 0.84. */
  artScale?: number;
  /** Tilt each piece of artwork a little. */
  tilt?: boolean;
}

const ORB_FILLS = [
  "radial-gradient(circle at 34% 30%, #fff 0 6%, #d4d4d4 22%, #737373 55%, #1f1f1f 88%)",
  "radial-gradient(circle at 32% 28%, #fff 0 6%, #c7dcff 20%, #3b82f6 52%, #1e3a8a 88%)",
  "radial-gradient(circle at 33% 28%, #fff 0 6%, #c9f2d6 20%, #16a34a 52%, #14532d 88%)",
  "radial-gradient(circle at 33% 28%, #fff 0 6%, #fde7b0 20%, #f59e0b 52%, #7c2d12 88%)",
  "radial-gradient(circle at 33% 28%, #fff 0 6%, #fecaca 20%, #dc2626 52%, #7f1d1d 88%)",
  "conic-gradient(from 200deg, #3b82f6, #16a34a, #f59e0b, #dc2626, #3b82f6)",
];
const SYMBOLS = [
  "M12 2.5 14.6 9l6.9.5-5.3 4.4 1.7 6.7L12 16.9l-5.9 3.7 1.7-6.7L2.5 9.5 9.4 9Z",
  "M12 21s-8.5-5.2-8.5-11A4.8 4.8 0 0 1 12 6.8 4.8 4.8 0 0 1 20.5 10c0 5.8-8.5 11-8.5 11Z",
  "M13.5 2 5 13.5h5.5L9.5 22 19 9.5h-5.6Z",
  "M12 2c1.4 4.6 5.4 8.6 10 10-4.6 1.4-8.6 5.4-10 10-1.4-4.6-5.4-8.6-10-10C6.6 10.6 10.6 6.6 12 2Z",
];
const SYMBOL_INK = ["#f59e0b", "#dc2626", "#3b82f6", "#1f1f1f"];

/** HeiGin's built-in artwork: shaded orbs in the brand palette, four symbols and the mark. */
export const typeMotionDefaultArtwork: TypeMotionArt[] = [
  ...ORB_FILLS.map((background, i) => <span key={`o${i}`} className={styles.orb} style={{ background }} />),
  ...SYMBOLS.map((d, i) => (
    <svg key={`s${i}`} viewBox="0 0 24 24" fill={SYMBOL_INK[i]}>
      <path d={d} />
    </svg>
  )),
  <HeiGinMark key="mark" size={64} />,
];

interface CharState {
  art: number;
  scale: number;
  rot: number;
  leaving?: boolean;
  key: number;
}
interface Fx {
  id: number;
  art: number;
  x: number;
  y: number;
  size: number;
  kind: "bubble" | "burst" | "sticker";
  dx: number;
  dy: number;
  rot: number;
  dur: number;
}

function renderArt(a: TypeMotionArt | undefined) {
  if (!a) return null;
  if (React.isValidElement(a)) return a;
  return <img src={a.src} alt="" draggable={false} decoding="async" />;
}

/**
 * A headline whose letters turn into artwork under the pointer: lens, pop, shuffle, word,
 * bubble, swell, sticker or burst. The text stays one accessible heading; the effects are decoration.
 */
export function TypeMotion({
  text,
  effect = "lens",
  artwork = typeMotionDefaultArtwork,
  as = "h1",
  radius = 0.85,
  hold = 900,
  artScale = 0.84,
  tilt = false,
  className,
  style,
  ...props
}: TypeMotionProps) {
  const Tag = as as "h1";
  const rootRef = React.useRef<HTMLElement>(null);
  const charRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const rects = React.useRef<{ cx: number; cy: number; l: number; t: number; w: number; h: number }[]>([]);
  const [swapped, setSwapped] = React.useState<Record<number, CharState>>({});
  const [swell, setSwell] = React.useState<Record<number, number>>({});
  const [fx, setFx] = React.useState<Fx[]>([]);
  const timers = React.useRef<Map<number, number>>(new Map());
  const hot = React.useRef<number | null>(null);
  const lastSticker = React.useRef({ x: -999, y: -999 });
  const seq = React.useRef(0);
  const reduce = React.useRef(false);

  // Words and characters, with each character's word index.
  const lines = React.useMemo(() => {
    let i = 0;
    let w = 0;
    return text.split("\n").map((line) =>
      line.split(/( +)/).filter(Boolean).map((tok) => {
        if (/^ +$/.test(tok)) return { space: true as const, chars: [] as { c: string; i: number; w: number }[] };
        const chars = Array.from(tok).map((c) => ({ c, i: i++, w }));
        w++;
        return { space: false as const, chars };
      }),
    );
  }, [text]);
  const wordOf = React.useMemo(() => lines.flat().flatMap((t) => t.chars.map((c) => c.w)), [lines]);
  const count = wordOf.length;

  React.useEffect(() => {
    reduce.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);

  const measure = React.useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const rb = root.getBoundingClientRect();
    rects.current = charRefs.current.slice(0, count).map((el) => {
      const r = el?.getBoundingClientRect() ?? { left: 0, top: 0, width: 0, height: 0 };
      return { cx: r.left - rb.left + r.width / 2, cy: r.top - rb.top + r.height * 0.55, l: r.left - rb.left, t: r.top - rb.top, w: r.width, h: r.height };
    });
  }, [count]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [measure]);

  // Changing the text or the effect starts clean.
  React.useEffect(() => {
    const t = timers.current;
    setSwapped({});
    setSwell({});
    setFx([]);
    t.forEach((id) => window.clearTimeout(id));
    t.clear();
    return () => t.forEach((id) => window.clearTimeout(id));
  }, [text, effect]);

  const pick = (avoid?: number) => {
    let a = Math.floor(Math.random() * artwork.length);
    if (artwork.length > 1 && a === avoid) a = (a + 1) % artwork.length;
    return a;
  };
  const swapIn = (i: number, scale = 1, art?: number) =>
    setSwapped((s) => {
      const cur = s[i];
      if (cur && !cur.leaving && art === undefined) return Math.abs(cur.scale - scale) < 0.02 ? s : { ...s, [i]: { ...cur, scale } };
      return { ...s, [i]: { art: art ?? pick(cur?.art), scale, rot: tilt ? Math.random() * 24 - 12 : 0, key: seq.current++ } };
    });
  const swapOut = (i: number) =>
    setSwapped((s) => {
      const cur = s[i];
      if (!cur || cur.leaving) return s;
      if (reduce.current) {
        const next = { ...s };
        delete next[i];
        return next;
      }
      return { ...s, [i]: { ...cur, leaving: true } };
    });
  const dropChar = (i: number) =>
    setSwapped((s) => {
      if (!s[i]?.leaving) return s;
      const next = { ...s };
      delete next[i];
      return next;
    });
  const later = (i: number, ms: number, fn: () => void) => {
    window.clearTimeout(timers.current.get(i));
    timers.current.set(i, window.setTimeout(fn, ms));
  };
  const cancel = (i: number) => {
    window.clearTimeout(timers.current.get(i));
    timers.current.delete(i);
  };
  const spawn = (f: Omit<Fx, "id">) => {
    if (reduce.current) return;
    setFx((all) => [...all.slice(f.kind === "sticker" ? -48 : -40), { ...f, id: seq.current++ }]);
  };

  const em = () => parseFloat(getComputedStyle(rootRef.current!).fontSize) || 16;

  const enter = (i: number) => {
    const r = rects.current[i];
    if (!r) return;
    const size = em();
    switch (effect) {
      case "pop":
        cancel(i);
        swapIn(i);
        break;
      case "shuffle": {
        cancel(i);
        let n = 0;
        const spin = () => {
          swapIn(i, 1, pick());
          if (++n < 6) timers.current.set(i, window.setTimeout(spin, 70));
        };
        spin();
        break;
      }
      case "word":
        wordOf.forEach((w, j) => {
          if (w !== wordOf[i]) return;
          cancel(j);
          window.setTimeout(() => swapIn(j), Math.abs(j - i) * 45);
        });
        break;
      case "bubble": {
        const wob = Math.random() * 30 - 15;
        spawn({ kind: "bubble", art: pick(), x: r.cx, y: r.cy, size: size * 0.8 * artScale, dx: wob, dy: -size * 1.4, rot: wob / 2, dur: 1500 });
        break;
      }
      case "burst":
        for (let k = 0; k < 7; k++) {
          const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6;
          const dist = size * (0.6 + Math.random() * 0.9);
          spawn({ kind: "burst", art: pick(), x: r.cx, y: r.cy, size: size * (0.3 + Math.random() * 0.25) * artScale, dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist + size * 0.4, rot: Math.random() * 180 - 90, dur: 900 + Math.random() * 300 });
        }
        break;
    }
  };
  const leave = (i: number) => {
    if (effect === "pop" || effect === "shuffle") later(i, hold, () => swapOut(i));
    if (effect === "word") {
      const w = wordOf[i];
      wordOf.forEach((ww, j) => {
        if (ww === w) later(j, hold, () => (hot.current !== null && wordOf[hot.current] === w ? undefined : swapOut(j)));
      });
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!rects.current.length) measure();
    const rb = rootRef.current!.getBoundingClientRect();
    const x = e.clientX - rb.left;
    const y = e.clientY - rb.top;
    const size = em();
    const R = radius * size;
    const hit = rects.current.findIndex((r) => x >= r.l - 2 && x <= r.l + r.w + 2 && y >= r.t && y <= r.t + r.h);
    const now = hit >= 0 ? hit : null;
    if (now !== hot.current) {
      if (hot.current !== null) leave(hot.current);
      if (now !== null) enter(now);
      hot.current = now;
    }
    if (effect === "lens") {
      rects.current.forEach((r, i) => {
        const d = Math.hypot(x - r.cx, y - r.cy);
        if (d < R) {
          cancel(i);
          swapIn(i, 0.65 + 0.35 * (1 - d / R));
        } else later(i, Math.min(hold, 160), () => swapOut(i));
      });
    }
    if (effect === "swell") {
      let best = -1;
      let bd = Infinity;
      const next: Record<number, number> = {};
      rects.current.forEach((r, i) => {
        const d = Math.hypot(x - r.cx, y - r.cy);
        const k = Math.max(0, 1 - d / (R * 1.4));
        if (k > 0) next[i] = k;
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      setSwell(next);
      rects.current.forEach((_, i) => {
        if (i === best && bd < R * 0.45) {
          cancel(i);
          swapIn(i, 1.05);
        } else later(i, Math.min(hold, 160), () => swapOut(i));
      });
    }
    if (effect === "sticker" && now !== null && Math.hypot(x - lastSticker.current.x, y - lastSticker.current.y) > size * 0.55) {
      lastSticker.current = { x, y };
      spawn({ kind: "sticker", art: pick(), x, y, size: size * 0.7 * artScale, dx: 0, dy: 0, rot: Math.random() * 36 - 18, dur: 420 });
    }
  };
  const onPointerLeave = () => {
    if (hot.current !== null) leave(hot.current);
    hot.current = null;
    if (effect === "lens" || effect === "swell") {
      setSwell({});
      rects.current.forEach((_, i) => later(i, Math.min(hold, 160), () => swapOut(i)));
    }
  };

  let index = 0;
  return (
    <Tag
      ref={rootRef as React.Ref<HTMLHeadingElement>}
      className={cn(styles.root, className)}
      style={{ ...style, ["--tm-art" as string]: artScale }}
      aria-label={text.replace(/\n/g, " ")}
      onPointerEnter={measure}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...props}
    >
      {lines.map((line, li) => (
        <React.Fragment key={li}>
          {li > 0 && <br />}
          {line.map((tok, ti) =>
            tok.space ? (
              " "
            ) : (
              <span key={ti} className={styles.word} aria-hidden="true">
                {tok.chars.map(({ c }) => {
                  const i = index++;
                  const s = swapped[i];
                  const k = swell[i] ?? 0;
                  return (
                    <span key={i} ref={(el) => void (charRefs.current[i] = el)} className={styles.char} data-swapped={!!s && !s.leaving}>
                      <span className={styles.glyph} style={k ? { transform: `scale(${1 + 0.42 * k * k}) translateY(${-0.05 * k}em)` } : undefined}>
                        {c}
                      </span>
                      {s && (
                        <span
                          key={s.key}
                          className={styles.art}
                          data-leaving={s.leaving}
                          style={{ ["--tm-scale" as string]: s.scale, ["--tm-rot" as string]: `${s.rot}deg` }}
                          onAnimationEnd={() => s.leaving && dropChar(i)}
                        >
                          {renderArt(artwork[s.art])}
                        </span>
                      )}
                    </span>
                  );
                })}
              </span>
            ),
          )}
        </React.Fragment>
      ))}
      <span className={styles.fxLayer} aria-hidden="true">
        {fx.map((f) => (
          <span
            key={f.id}
            className={styles.fx}
            data-kind={f.kind}
            style={{
              left: f.x - f.size / 2,
              top: f.y - f.size / 2,
              width: f.size,
              height: f.size,
              animationDuration: `${f.dur}ms`,
              ["--dx" as string]: `${f.dx}px`,
              ["--dy" as string]: `${f.dy}px`,
              ["--rot" as string]: `${f.rot}deg`,
            }}
            onAnimationEnd={() => f.kind !== "sticker" && setFx((all) => all.filter((x) => x.id !== f.id))}
          >
            {renderArt(artwork[f.art])}
          </span>
        ))}
      </span>
    </Tag>
  );
}
