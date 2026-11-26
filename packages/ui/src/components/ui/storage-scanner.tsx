"use client";

import * as React from "react";
import { Check, RefreshCw } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "./button";
import { Spinner } from "./spinner";
import { VisuallyHidden } from "./visually-hidden";
import styles from "./storage-scanner.module.css";

export interface StorageCategory {
  id: string;
  label: string;
  /** Bytes the category uses now. Update it as a scan or a clean-up runs; the bar eases to each new value. */
  size: number;
  /** Any CSS colour, `var()` included. Tints the bar segment, its dots and the icon. */
  color: string;
  /** Decorative icon beside the label, tinted with `color`. Without one a colour square stands in. */
  icon?: React.ReactNode;
  /** One line about what's inside, shown under the total while the category is hovered, focused or picked. */
  detail?: React.ReactNode;
}

export interface StorageSuggestion {
  /** Shown before the message; the category's own icon fits. */
  icon?: React.ReactNode;
  message: React.ReactNode;
  /** The button's label, such as "Clear caches". */
  actionLabel: string;
  onAction: () => void;
}

export type StorageScannerStatus = "scanning" | "clearing" | "ready";

export interface StorageScannerProps {
  /** In bar order. */
  categories: StorageCategory[];
  /** Total space in bytes. */
  capacity: number;
  /** `scanning` while sizes are still being counted, `clearing` while a suggestion runs, `ready` otherwise. */
  status: StorageScannerStatus;
  /** What is running, beside the path. Default "Calculating" while scanning and "Clearing" while clearing. */
  activity?: string;
  /** The file or folder being read right now, shown in mono beside the activity. */
  path?: string;
  /** The line under the total when ready and no category is picked. Default "{free} available". */
  note?: React.ReactNode;
  /** Something worth clearing, with its button. Unset, the footer says there is nothing to clear. */
  suggestion?: StorageSuggestion;
  /** Shows a Rescan button, disabled while scanning or clearing. */
  onRescan?: () => void;
  /** Formats a byte count. Default gigabytes with one decimal, "12.4 GB". */
  formatSize?: (bytes: number) => string;
  /** Accessible name for the whole card. Default "Storage". */
  label?: string;
  className?: string;
}

// Whole sizes, which are usually capacities, drop the decimal: "512 GB", "52.6 GB", "0.0 GB".
const gigabytes = (bytes: number) => {
  const n = bytes / 1e9;
  return `${Number.isInteger(n) && n !== 0 ? n : n.toFixed(1)} GB`;
};

/* ------------------------------------------------------------------ dot bar */

const PITCH = 5; // px between dot centres
const DOT = 3; // dot size, px
const RADIUS = 10; // bar corners
const EDGE = 40; // px of dots that run hot behind a moving edge
// The canvas spills past the bar so the scan glow and the sparks of a clean-up aren't cut off.
const BLEED_X = 16;
const BLEED_TOP = 56;
const BLEED_BOTTOM = 16;

type RGB = [number, number, number];

interface Seg {
  id: string;
  target: number;
  shown: number;
  rgb: RGB;
  emphasis: number;
}

interface BarModel {
  segs: Seg[];
  capacity: number;
  status: StorageScannerStatus;
  active: string | null;
  wake: () => void;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  rgb: RGB;
}

/** Stable 0–1 noise per dot (and per time step, for the twinkle). */
function noise(a: number, b: number, c = 0) {
  let h = Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const mix = (a: RGB, b: RGB, k: number): RGB => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const css = (c: RGB, a = 1) => `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;
const WHITE: RGB = [255, 255, 255];

let pixel: CanvasRenderingContext2D | null | undefined;
const rgbCache = new Map<string, RGB>();
/** Any computed CSS colour (rgb, oklch, color()…) to sRGB, by painting one pixel. */
function toRgb(colour: string): RGB {
  const hit = rgbCache.get(colour);
  if (hit) return hit;
  if (pixel === undefined) {
    const px = document.createElement("canvas");
    px.width = px.height = 1;
    pixel = px.getContext?.("2d", { willReadFrequently: true }) ?? null;
  }
  if (!pixel) return [128, 128, 128];
  pixel.clearRect(0, 0, 1, 1);
  pixel.fillStyle = colour;
  pixel.fillRect(0, 0, 1, 1);
  const d = pixel.getImageData(0, 0, 1, 1).data;
  const rgb: RGB = [d[0]!, d[1]!, d[2]!];
  rgbCache.set(colour, rgb);
  return rgb;
}

function useDotBar(canvasRef: React.RefObject<HTMLCanvasElement | null>, modelRef: React.RefObject<BarModel>) {
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const bar = canvas?.parentElement;
    const ctx = canvas?.getContext?.("2d");
    if (!canvas || !bar || !ctx) return;
    const model = modelRef.current; // one object for the component's life; the component updates its fields
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rnd = seeded(29);
    const sparks: Spark[] = [];
    const t0 = performance.now();
    let w = 0;
    let h = 0;
    let ink: RGB = [236, 236, 239];
    let dark = true;
    let raf = 0;
    let last = 0;
    let drawnAt = 0;
    let visible = true;

    const readTheme = () => {
      ink = toRgb(getComputedStyle(canvas).color);
      dark = ink[0] * 0.299 + ink[1] * 0.587 + ink[2] * 0.114 > 128;
    };

    const draw = (t: number) => {
      const m = model;
      const cap = Math.max(1, m.capacity);
      ctx.setTransform(dpr, 0, 0, dpr, BLEED_X * dpr, BLEED_TOP * dpr);
      ctx.clearRect(-BLEED_X, -BLEED_TOP, w + BLEED_X * 2, h + BLEED_TOP + BLEED_BOTTOM);

      // The empty track.
      ctx.beginPath();
      ctx.roundRect?.(0.5, 0.5, w - 1, h - 1, RADIUS);
      ctx.strokeStyle = css(ink, dark ? 0.07 : 0.1);
      ctx.stroke();

      let x = 0;
      const spans = m.segs.map((s) => {
        const span = { s, x0: x, x1: x + (s.shown / cap) * w };
        x = span.x1;
        return span;
      });
      const end = Math.min(w, x);
      const shown = spans.filter((sp) => sp.x1 - sp.x0 >= 0.5);
      const scanning = m.status === "scanning";
      // Only a clean-up counts as clearing; a rescan resetting sizes to zero shouldn't throw sparks.
      const clearing = (s: Seg) => m.status === "clearing" && s.target < s.shown - cap * 0.0005;
      const pulse = reduce ? 1 : 0.8 + 0.2 * Math.sin(t * 5);

      // Segment tint and outline, under the dots.
      shown.forEach((sp, i) => {
        const e = Math.min(1, sp.s.emphasis);
        const left = i === 0 ? RADIUS : 2;
        const right = i === shown.length - 1 ? (sp.x1 >= w - 1 ? RADIUS : 6) : 2;
        const x1 = Math.min(w, sp.x1);
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(sp.x0 + 0.5, 0.5, Math.max(0, x1 - sp.x0 - 1), h - 1, [left, right, right, left]);
        else ctx.rect(sp.x0 + 0.5, 0.5, Math.max(0, x1 - sp.x0 - 1), h - 1);
        ctx.fillStyle = css(sp.s.rgb, (dark ? 0.08 : 0.07) * e);
        ctx.fill();
        if (sp.s.emphasis > 1.05) {
          ctx.save();
          ctx.shadowColor = css(sp.s.rgb, 0.5);
          ctx.shadowBlur = 18 * dpr; // shadows ignore the transform
          ctx.strokeStyle = css(sp.s.rgb, 1);
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.strokeStyle = css(sp.s.rgb, 0.25 + 0.65 * e);
          ctx.stroke();
        }
      });

      // The glow at the scan's leading edge.
      if (scanning && end > 0) {
        const glow = dark ? WHITE : (shown[shown.length - 1]?.s.rgb ?? ink);
        const from = Math.max(0, end - EDGE);
        const wash = ctx.createLinearGradient(from, 0, end, 0);
        wash.addColorStop(0, css(glow, 0));
        wash.addColorStop(1, css(glow, (dark ? 0.22 : 0.16) * pulse));
        ctx.fillStyle = wash;
        ctx.fillRect(from, 1, end - from, h - 2);
        ctx.save();
        ctx.shadowColor = css(glow, 0.9 * pulse);
        ctx.shadowBlur = 22 * dpr;
        ctx.fillStyle = css(glow, 0.75 * pulse);
        ctx.fillRect(Math.max(0, end - 2.5), 2, 2, h - 4);
        ctx.restore();
      }

      // Dots.
      const cols = Math.floor((w - 4) / PITCH);
      const rows = Math.floor((h - 4) / PITCH);
      const gx = (w - cols * PITCH) / 2 + (PITCH - DOT) / 2;
      const gy = (h - rows * PITCH) / 2 + (PITCH - DOT) / 2;
      const step = reduce ? 0 : Math.floor(t * 1.4);
      let si = 0;
      for (let c = 0; c < cols; c++) {
        const cx = gx + c * PITCH + DOT / 2;
        while (si < spans.length && cx > spans[si]!.x1) si++;
        const sp = cx < end ? spans[si] : undefined;
        if (!sp) {
          ctx.fillStyle = css(ink, 1);
          ctx.globalAlpha = dark ? 0.08 : 0.1;
          for (let r = 0; r < rows; r++) ctx.fillRect(gx + c * PITCH, gy + r * PITCH, DOT, DOT);
          ctx.globalAlpha = 1;
          continue;
        }
        const e = sp.s.emphasis;
        // Dots near a moving edge (the scan, or a segment being cleared) run hot.
        const edge = scanning ? end : clearing(sp.s) ? sp.x1 : -1;
        const heat = edge > 0 ? Math.max(0, 1 - (edge - cx) / EDGE) * pulse : 0;
        const base = dark ? mix(sp.s.rgb, WHITE, heat * 0.85) : sp.s.rgb;
        const spark = dark ? mix(sp.s.rgb, WHITE, 0.18 + heat * 0.7) : sp.s.rgb;
        for (let r = 0; r < rows; r++) {
          const n = noise(c, r);
          let a = n < 0.45 ? 0.2 : n < 0.84 ? 0.5 : 0.85;
          const lit = n >= 0.84 || noise(c, r, step + ((n * 9) | 0)) > 0.93;
          if (lit) a = 1;
          a = e > 1 ? a + (1 - a) * (e - 1) * 0.7 : a * e;
          a += (1 - a) * heat * 0.8;
          ctx.fillStyle = css(lit ? spark : base, 1);
          ctx.globalAlpha = Math.min(1, a);
          ctx.fillRect(gx + c * PITCH, gy + r * PITCH, DOT, DOT);
        }
        ctx.globalAlpha = 1;
      }

      // A halo over the scan's leading edge, spilling past the bar like the reference light bloom.
      if (scanning && end > 0) {
        const glow = dark ? WHITE : (shown[shown.length - 1]?.s.rgb ?? ink);
        const halo = ctx.createRadialGradient(end, h / 2, 0, end, h / 2, h * 0.62);
        halo.addColorStop(0, css(glow, (dark ? 0.28 : 0.2) * pulse));
        halo.addColorStop(1, css(glow, 0));
        ctx.save();
        if (dark) ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = halo;
        ctx.fillRect(end - h * 0.62, h / 2 - h * 0.62, h * 1.24, h * 1.24);
        ctx.restore();
      }

      // Sparks fly off a segment as it is cleared.
      for (const sp of spans) {
        if (reduce || !clearing(sp.s)) continue;
        for (let k = 0; k < 3; k++) {
          const max = 0.5 + rnd() * 0.7;
          sparks.push({
            x: sp.x1 - rnd() * 8,
            y: rnd() * h,
            vx: (rnd() - 0.3) * 50,
            vy: -(40 + rnd() * 130),
            life: max,
            max,
            size: rnd() < 0.3 ? 2.5 : 1.5,
            rgb: dark ? mix(sp.s.rgb, WHITE, 0.3 + rnd() * 0.6) : sp.s.rgb,
          });
        }
      }
      for (const p of sparks) {
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = css(p.rgb, 1);
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const m = model;
      const cap = Math.max(1, m.capacity);
      const ease = reduce ? 1 : 1 - Math.exp(-dt * 7);
      const fade = reduce ? 1 : 1 - Math.exp(-dt * 12);
      let moving = false;
      for (const s of m.segs) {
        s.shown += (s.target - s.shown) * ease;
        if (Math.abs(s.target - s.shown) < cap * 1e-4) s.shown = s.target;
        else moving = true;
        const goal = !m.active ? 1 : m.active === s.id ? 1.9 : 0.3;
        s.emphasis += (goal - s.emphasis) * fade;
        if (Math.abs(goal - s.emphasis) < 0.01) s.emphasis = goal;
        else moving = true;
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]!;
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy -= 60 * dt;
        if (p.life <= 0) sparks.splice(i, 1);
      }
      const busy = m.status !== "ready" || moving || sparks.length > 0;
      // Idle, only the twinkle changes, so a few frames a second do.
      if (busy || now - drawnAt > 90) {
        draw((now - t0) / 1000);
        drawnAt = now;
      }
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    model.wake = wake;

    const resize = () => {
      w = bar.clientWidth;
      h = bar.clientHeight;
      // Setting the size clears the canvas, so draw again straight after.
      canvas.width = Math.round((w + BLEED_X * 2) * dpr);
      canvas.height = Math.round((h + BLEED_TOP + BLEED_BOTTOM) * dpr);
      drawnAt = 0;
      wake();
    };
    readTheme();
    resize();

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            visible = entry?.isIntersecting ?? true;
            if (visible) wake();
          })
        : null;
    io?.observe(canvas);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(bar);
    const onVis = () => !document.hidden && wake();
    document.addEventListener("visibilitychange", onVis);
    // Pick up theme changes: empty dots are drawn in the canvas's own text colour.
    const themeTimer = window.setInterval(() => {
      const before = ink.join();
      readTheme();
      if (ink.join() !== before) {
        drawnAt = 0;
        wake();
      }
    }, 1000);
    return () => {
      cancelAnimationFrame(raf);
      model.wake = () => {};
      io?.disconnect();
      ro?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(themeTimer);
    };
  }, [canvasRef, modelRef]);
}

/* ------------------------------------------------------------------ component */

/**
 * A storage meter for a disk or a workspace: the total used, a bar of colourful dot-matrix segments,
 * one per category, and a footer that suggests what to clear. While scanning the bar grows with a
 * glowing edge; while clearing, sparks fly off the segment as it shrinks. Hover, focus or pick a
 * category to light up its segment and read what's inside.
 */
export function StorageScanner({
  categories,
  capacity,
  status,
  activity,
  path,
  note,
  suggestion,
  onRescan,
  formatSize = gigabytes,
  label = "Storage",
  className,
}: StorageScannerProps) {
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [picked, setPicked] = React.useState<string | null>(null);
  const rootRef = React.useRef<HTMLElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const messageRef = React.useRef<HTMLParagraphElement>(null);
  const modelRef = React.useRef<BarModel>({ segs: [], capacity: 1, status, active: null, wake: () => {} });
  const ids = React.useId();
  useDotBar(canvasRef, modelRef);

  const busy = status !== "ready";
  const used = categories.reduce((n, c) => n + Math.max(0, c.size), 0);
  const active = hovered ?? picked;
  const current = categories.find((c) => c.id === active);

  // Hand the latest sizes, colours and highlight to the canvas loop.
  React.useEffect(() => {
    const m = modelRef.current;
    const swatches = rootRef.current?.querySelectorAll<HTMLElement>("[data-swatch]");
    m.segs = categories.map((c, i) => {
      const old = m.segs.find((s) => s.id === c.id);
      const colour = swatches?.[i] ? getComputedStyle(swatches[i]!).color : c.color;
      const size = Math.max(0, c.size);
      return { id: c.id, target: size, shown: old?.shown ?? size, emphasis: old?.emphasis ?? 1, rgb: toRgb(colour) };
    });
    m.capacity = capacity;
    m.status = status;
    m.active = active;
    m.wake();
  });

  const onBarMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return; // touch picks from the list instead
    const rect = e.currentTarget.getBoundingClientRect();
    const at = ((e.clientX - rect.left) / rect.width) * Math.max(1, capacity);
    let sum = 0;
    let hit: string | null = null;
    for (const s of modelRef.current.segs) {
      sum += s.shown;
      if (at <= sum) {
        hit = s.shown > 0 ? s.id : null;
        break;
      }
    }
    if (hit !== hovered) setHovered(hit);
  };

  let line: React.ReactNode;
  if (current) {
    line = (
      <>
        <span className={styles.icon} style={{ color: current.color }} aria-hidden="true">
          {current.icon}
        </span>
        <strong>{current.label}</strong>
        <span className={styles.lineSize}>{formatSize(current.size)}</span>
        {current.detail && <span className={styles.detail}>{current.detail}</span>}
      </>
    );
  } else if (busy) {
    line = (
      <>
        <strong>{activity ?? (status === "scanning" ? "Calculating" : "Clearing")}</strong>
        {path && <span className={styles.path}>{path}</span>}
      </>
    );
  } else {
    line = note ?? <span className={styles.detail}>{formatSize(Math.max(0, capacity - used))} available</span>;
  }

  const announce = busy ? (activity ?? (status === "scanning" ? "Calculating" : "Clearing")) : `${formatSize(used)} of ${formatSize(capacity)} used`;

  return (
    <section ref={rootRef} aria-label={label} className={cn(styles.root, className)} data-status={status}>
      <div className={styles.body}>
        <div className={styles.head}>
          <p className={styles.total}>
            <span className={styles.used}>{formatSize(used)}</span>
            <span className={styles.of}>of {formatSize(capacity)} used</span>
          </p>
          {onRescan && (
            <Button
              variant="ghost"
              size="sm"
              className={styles.rescan}
              leadingIcon={<RefreshCw aria-hidden="true" />}
              // aria-disabled, not disabled: Rescan starts a scan, and a disabled button would drop its focus.
              aria-disabled={busy || undefined}
              onClick={() => !busy && onRescan()}
            >
              Rescan
            </Button>
          )}
        </div>
        {/* Hover and focus change this line, so it is not a live region; the status below is. */}
        <p className={styles.line}>{line}</p>
        <VisuallyHidden role="status">{announce}</VisuallyHidden>

        <div
          className={styles.bar}
          role="meter"
          aria-label={`${label} used`}
          aria-valuemin={0}
          aria-valuemax={capacity}
          aria-valuenow={Math.min(used, capacity)}
          aria-valuetext={`${formatSize(used)} of ${formatSize(capacity)} used`}
          aria-busy={busy || undefined}
          onPointerMove={onBarMove}
          onPointerLeave={() => setHovered(null)}
        >
          <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" data-storage-bar="" />
        </div>

        <ul className={styles.legend} aria-label="By category">
          {categories.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={styles.item}
                aria-pressed={picked === c.id}
                aria-describedby={c.detail ? `${ids}-${c.id}` : undefined}
                data-active={active === c.id || undefined}
                data-dim={(active && active !== c.id) || undefined}
                onClick={() => setPicked((p) => (p === c.id ? null : c.id))}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(c.id)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(null)}
                onFocus={() => setHovered(c.id)}
                onBlur={() => setHovered(null)}
              >
                <span className={styles.icon} style={{ color: c.color }} data-swatch="" aria-hidden="true">
                  {c.icon}
                </span>
                <span className={styles.name}>{c.label}</span>{" "}
                <span className={styles.size}>{formatSize(c.size)}</span>
              </button>
              {c.detail && <VisuallyHidden id={`${ids}-${c.id}`}>{c.detail}</VisuallyHidden>}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.foot}>
        <p ref={messageRef} tabIndex={-1} className={styles.message} aria-live="polite" data-tone={suggestion ? "suggestion" : busy ? "busy" : "clear"}>
          {suggestion ? (
            <>
              {suggestion.icon && (
                <span className={styles.icon} aria-hidden="true">
                  {suggestion.icon}
                </span>
              )}
              <span>{suggestion.message}</span>
            </>
          ) : busy ? (
            <>
              <Spinner size="sm" label={null} className={styles.spinner} />
              <span>Looking for things you can clear</span>
            </>
          ) : (
            <>
              <Check aria-hidden="true" className={styles.ok} />
              <span>Nothing worth clearing right now.</span>
            </>
          )}
        </p>
        {suggestion && (
          <FooterAction suggestion={suggestion} status={status} onFocusLost={() => messageRef.current?.focus()} />
        )}
      </div>
    </section>
  );
}

/** The footer button. If it has focus when the last suggestion goes, focus moves to the message instead of the page. */
function FooterAction({ suggestion, status, onFocusLost }: { suggestion: StorageSuggestion; status: StorageScannerStatus; onFocusLost: () => void }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const lost = React.useRef(onFocusLost);
  React.useEffect(() => {
    lost.current = onFocusLost;
  });
  React.useLayoutEffect(() => {
    const node = ref.current;
    // Runs before React removes the button, while it can still hold focus.
    return () => {
      if (node && node === document.activeElement) lost.current();
    };
  }, []);
  const ready = status === "ready";
  return (
    <Button
      ref={ref}
      variant="secondary"
      size="sm"
      className={styles.action}
      loading={status === "clearing"}
      // aria-disabled, not disabled, so a focused button keeps focus when a scan starts.
      aria-disabled={!ready || undefined}
      onClick={() => ready && suggestion.onAction()}
    >
      {suggestion.actionLabel}
    </Button>
  );
}
