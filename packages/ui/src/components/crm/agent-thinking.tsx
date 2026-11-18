"use client";

import * as React from "react";
import { ChevronRight, Square } from "lucide-react";
import { cn } from "../../lib/cn";
import { Loader, type LoaderVariant } from "../ui/loader";
import styles from "./agent-thinking.module.css";

/** Silhouettes the dotted visual can take while a step runs. */
export type ThinkingShape = "tree" | "lens" | "globe" | "cube" | "ring";

export interface ThinkingStep {
  id: string;
  label: React.ReactNode;
  /** The shape the visual morphs into when this step starts. Steps without one keep the last shape. */
  shape?: ThinkingShape;
}

export interface AgentThinkingProps {
  /** The request being worked on, shown above the thinking. */
  prompt?: React.ReactNode;
  /** What the agent has done so far, oldest first. The newest line is the current one. */
  steps: ThinkingStep[];
  status: "thinking" | "done";
  /** When thinking started (ms since epoch). The timer then ticks on its own. */
  startedAt?: number;
  /** Elapsed or total seconds, when you track time yourself. */
  seconds?: number;
  /** Indicator beside "Thinking": the thinking orb (default) or a spinner. */
  loader?: LoaderVariant;
  /** Draw the dithered dot visual beside the steps. Default true. */
  visual?: boolean;
  /** Shows a stop button while thinking. */
  onStop?: () => void;
  /** The answer, shown once status is `done`. */
  children?: React.ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ dithered visual */

const N = 84; // grid cells per side
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const len3 = (x: number, y: number, z: number) => Math.sqrt(x * x + y * y + z * z);
function sdCappedCone(px: number, py: number, pz: number, h: number, r1: number, r2: number) {
  const qx = Math.hypot(px, pz);
  const qy = py;
  const k2x = r2 - r1;
  const k2y = 2 * h;
  const cax = qx - Math.min(qx, qy < 0 ? r1 : r2);
  const cay = Math.abs(qy) - h;
  const t = clamp(((r2 - qx) * k2x + (h - qy) * k2y) / (k2x * k2x + k2y * k2y), 0, 1);
  const cbx = qx - r2 + k2x * t;
  const cby = qy - h + k2y * t;
  const s = cbx < 0 && cay < 0 ? -1 : 1;
  return s * Math.sqrt(Math.min(cax * cax + cay * cay, cbx * cbx + cby * cby));
}
const sdTorus = (x: number, y: number, z: number, R: number, r: number) => Math.hypot(Math.hypot(x, y) - R, z) - r;
function sdCapsule(px: number, py: number, pz: number, ax: number, ay: number, bx: number, by: number, r: number) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = clamp((pax * bax + pay * bay) / (bax * bax + bay * bay), 0, 1);
  return len3(pax - bax * h, pay - bay * h, pz) - r;
}
function sdBox(x: number, y: number, z: number, b: number, r: number) {
  const qx = Math.abs(x) - b;
  const qy = Math.abs(y) - b;
  const qz = Math.abs(z) - b;
  return len3(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
}
const SHAPES: Record<ThinkingShape, (x: number, y: number, z: number) => number> = {
  tree: (x, y, z) =>
    Math.min(
      sdCappedCone(x, y - 0.66, z, 0.3, 0.36, 0),
      sdCappedCone(x, y - 0.16, z, 0.34, 0.5, 0.1),
      sdCappedCone(x, y + 0.38, z, 0.36, 0.64, 0.16),
      sdCapsule(x, y, z, 0, -0.72, 0, -0.98, 0.11),
    ),
  lens: (x, y, z) => Math.min(sdTorus(x + 0.18, y - 0.18, z, 0.5, 0.13), sdCapsule(x, y, z, 0.2, -0.2, 0.82, -0.82, 0.13)),
  globe: (x, y, z) => len3(x, y, z) - 0.78,
  cube: (x, y, z) => sdBox(x, y, z, 0.48, 0.08),
  ring: (x, y, z) => sdTorus(x, y, z, 0.58, 0.2),
};
const TILT: Record<ThinkingShape, number> = { tree: -0.22, lens: 0.18, globe: -0.38, cube: -0.5, ring: -0.9 };

function field(shape: ThinkingShape, t: number) {
  const out = new Float32Array(N * N);
  const f = SHAPES[shape];
  const ry = shape === "lens" ? Math.sin(t * 0.7) * 0.55 + 0.35 : t * 0.55;
  const rx = TILT[shape];
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const sdf = (x: number, y: number, z: number) => {
    const y1 = y * cx - z * sx;
    const z1 = y * sx + z * cx;
    return f(x * cy + z1 * sy, y1, -x * sy + z1 * cy);
  };
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const u = ((i + 0.5) / N) * 2.6 - 1.3;
      const v = -(((j + 0.5) / N) * 2.6 - 1.3);
      let z = -3;
      let hit = false;
      for (let k = 0; k < 34; k++) {
        const d = sdf(u, v, z);
        if (d < 0.004) {
          hit = true;
          break;
        }
        z += d;
        if (z > 2) break;
      }
      if (!hit) continue;
      const e = 0.01;
      const nx = sdf(u + e, v, z) - sdf(u - e, v, z);
      const ny = sdf(u, v + e, z) - sdf(u, v - e, z);
      const nz = sdf(u, v, z - e) - sdf(u, v, z + e);
      const nl = len3(nx, ny, nz) || 1;
      const lambert = clamp((nx * -0.55 + ny * 0.6 + nz * 0.58) / nl, 0, 1);
      out[j * N + i] = 0.12 + (1 - lambert) * 0.88;
    }
  }
  return out;
}

const BAYER = (() => {
  const b = [
    [0, 2],
    [3, 1],
  ];
  let m = b;
  for (let s = 0; s < 2; s++) {
    const n = m.length;
    const next: number[][] = [];
    for (let y = 0; y < n * 2; y++) {
      next[y] = [];
      for (let x = 0; x < n * 2; x++) next[y]![x] = 4 * m[y % n]![x % n]! + b[(y / n) | 0]![(x / n) | 0]!;
    }
    m = next;
  }
  return m.map((row) => row.map((v) => (v + 0.5) / 64));
})();
const GLYPHS = [
  [0, 1, 0, 1, 1, 1, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 1, 0, 1, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 0, 1, 1, 1, 1],
  [0, 0, 0, 1, 1, 1, 0, 0, 0],
];
const ease = (x: number) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);

function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function useDitherVisual(canvasRef: React.RefObject<HTMLCanvasElement | null>, shape: ThinkingShape | null, running: boolean) {
  const state = React.useRef({ from: null as ThinkingShape | null, to: null as ThinkingShape | null, mixAt: 0 });
  // Draws one frame; the canvas effect fills it in. Needed when no animation loop is running
  // (reduced motion, offscreen) and the shape or canvas size changes.
  const redraw = React.useRef<(() => void) | null>(null);

  // A new shape starts a fly-in from wherever the last one was.
  React.useEffect(() => {
    const s = state.current;
    if (s.to === shape) return;
    s.from = s.to;
    s.to = shape;
    s.mixAt = performance.now();
    redraw.current?.();
  }, [shape]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext?.("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const rnd = seeded(7);
    const RND = Float32Array.from({ length: N * N }, rnd);
    const ANG = Float32Array.from({ length: N * N }, () => rnd() * Math.PI * 2);
    const DIST = Float32Array.from({ length: N * N }, () => 0.4 + rnd() * 0.9);
    const strays = Array.from({ length: 60 }, () => ({ a: rnd() * 6.28, r: 0.35 + rnd() * 0.62, s: (rnd() - 0.5) * 0.15, ph: rnd() * 6.28 }));
    const swarm = Array.from({ length: 130 }, () => {
      const a = rnd() * 6.28;
      const r = Math.pow(rnd(), 0.7) * 0.42;
      return { x: 0.5 + Math.cos(a) * r, y: 0.42 + Math.sin(a) * r * 0.9, g: (rnd() * GLYPHS.length) | 0, ph: rnd() * 6.28 };
    });
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let size = 0;
    let colour = "#1f1f1f";
    let visible = true;
    let raf = 0;
    const t0 = performance.now();

    const resize = () => {
      const w = canvas.clientWidth || 280;
      const next = Math.round(w * dpr);
      colour = getComputedStyle(canvas).color || colour;
      if (next === size) return;
      // Setting the canvas size clears it, so draw again straight after.
      size = next;
      canvas.width = size;
      canvas.height = size;
      redraw.current?.();
    };

    const cells = (data: Float32Array, mode: "in" | "out", m: number) => {
      const CELL = size / N;
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const idx = j * N + i;
          const dens = data[idx]!;
          if (!dens || dens < BAYER[j & 7]![i & 7]!) continue;
          const r = RND[idx]!;
          let k: number;
          if (mode === "in") {
            const local = (m - r * 0.55) / 0.45;
            if (local <= 0) continue;
            k = 1 - ease(local);
          } else {
            const local = (m - (1 - r) * 0.5) / 0.5;
            if (local >= 1) continue;
            k = ease(local);
          }
          const ox = Math.cos(ANG[idx]!) * DIST[idx]! * k * N * 0.45;
          const oy = Math.sin(ANG[idx]!) * DIST[idx]! * k * N * 0.45;
          ctx.globalAlpha = 1 - k * 0.6;
          const sz = CELL * (k > 0.05 ? 0.8 : 0.72);
          ctx.fillRect((i + ox) * CELL, (j + oy) * CELL, sz, sz);
        }
      }
      ctx.globalAlpha = 1;
    };
    const glyphs = (t: number, k: number) => {
      const px = (size / N) * 0.55;
      for (const s of swarm) {
        if (Math.sin(t * 3 + s.ph) < -0.6) continue;
        const g = GLYPHS[(s.g + ((t * 2 + s.ph) | 0)) % GLYPHS.length]!;
        const x = s.x * size + Math.cos(s.ph + t * 0.8) * 4 * dpr + (s.x - 0.5) * k * size * 0.7;
        const y = s.y * size + Math.sin(s.ph * 1.3 + t * 0.6) * 4 * dpr + (s.y - 0.42) * k * size * 0.7;
        ctx.globalAlpha = 1 - k;
        for (let q = 0; q < 9; q++) if (g[q]) ctx.fillRect(x + (q % 3) * px, y + ((q / 3) | 0) * px, px * 0.9, px * 0.9);
      }
      ctx.globalAlpha = 1;
    };
    const shadow = (alpha: number) => {
      const CELL = size / N;
      const cx = N * 0.5;
      const cy = N * 0.9;
      const rx = N * 0.2;
      const ry = N * 0.035;
      ctx.globalAlpha = alpha * 0.75;
      for (let j = Math.floor(cy - ry); j <= cy + ry; j++)
        for (let i = Math.floor(cx - rx); i <= cx + rx; i++) {
          const d = ((i - cx) / rx) ** 2 + ((j - cy) / ry) ** 2;
          if (d > 1 || (1 - d) * 0.55 < BAYER[j & 7]![i & 7]!) continue;
          ctx.fillRect(i * CELL, j * CELL, CELL * 0.6, CELL * 0.6);
        }
      ctx.globalAlpha = 1;
    };
    const dots = (t: number) => {
      const s = (size / N) * 0.6;
      for (const d of strays) {
        const a = d.a + t * d.s;
        const r = d.r + Math.sin(t * 0.9 + d.ph) * 0.03;
        ctx.globalAlpha = 0.45 + 0.45 * Math.sin(t * 2 + d.ph);
        ctx.fillRect(size / 2 + Math.cos(a) * r * size * 0.5, size * 0.47 + Math.sin(a) * r * size * 0.48, s, s);
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      const t = reduce ? 1.5 : (now - t0) / 1000;
      const st = state.current;
      const m = reduce ? 1 : clamp((now - st.mixAt) / 1250, 0, 1);
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = colour;
      dots(t);
      if (st.to) shadow(ease(m));
      if (!st.to) glyphs(t, 0);
      else {
        if (!st.from) glyphs(t, ease(m));
        else if (m < 1) cells(field(st.from, t), "out", m);
        cells(field(st.to, t), "in", m);
      }
      if (running && visible && !reduce) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };
    redraw.current = start;
    resize();

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            visible = entry?.isIntersecting ?? true;
            if (visible) start();
          })
        : null;
    io?.observe(canvas);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);
    const onVis = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    document.addEventListener("visibilitychange", onVis);
    // Pick up theme changes: the dots are drawn in the canvas's own text colour.
    const colourTimer = window.setInterval(() => (colour = getComputedStyle(canvas).color || colour), 1000);
    start();
    return () => {
      cancelAnimationFrame(raf);
      redraw.current = null;
      io?.disconnect();
      ro?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(colourTimer);
    };
  }, [canvasRef, running]);
}

/* ------------------------------------------------------------------ component */

function useNow(enabled: boolean) {
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [enabled]);
  return now;
}

/**
 * Shows an agent thinking: a timer with the thinking orb (or a spinner), each step as it happens,
 * and a dithered dot visual that reshapes per step. When done, the steps fold into "Thought for Ns"
 * and the answer takes their place.
 */
export function AgentThinking({
  prompt,
  steps,
  status,
  startedAt,
  seconds,
  loader = "orb",
  visual = true,
  onStop,
  children,
  className,
}: AgentThinkingProps) {
  const thinking = status === "thinking";
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const logId = React.useId();
  const [showSteps, setShowSteps] = React.useState(false);
  const now = useNow(thinking && startedAt !== undefined);
  const elapsed = startedAt !== undefined && now !== null ? Math.max(0, (now - startedAt) / 1000) : seconds;
  const [frozen, setFrozen] = React.useState<number | undefined>(undefined);

  // Keep the final time once thinking stops, even if startedAt is still passed.
  React.useEffect(() => {
    if (!thinking && frozen === undefined) setFrozen(elapsed);
    if (thinking) setFrozen(undefined);
  }, [thinking, elapsed, frozen]);

  const shape = [...steps].reverse().find((s) => s.shape)?.shape ?? (steps.length ? "tree" : null);
  useDitherVisual(canvasRef, shape, thinking && visual);

  const total = frozen ?? elapsed;
  const time = total === undefined ? "" : `${total.toFixed(thinking ? 1 : 0)}s`;

  return (
    <section className={cn(styles.root, className)} aria-label="Agent response" aria-busy={thinking}>
      {(prompt || onStop) && (
        <div className={styles.prompt}>
          {prompt && <p>{prompt}</p>}
          {onStop && thinking && (
            <button type="button" className={styles.stop} onClick={onStop} aria-label="Stop thinking">
              <Square aria-hidden="true" strokeWidth={0} fill="currentColor" />
            </button>
          )}
        </div>
      )}

      <div className={styles.body} data-visual={visual && thinking}>
        <div className={styles.side}>
          {thinking ? (
            // The ticking time is not in a live region, so screen readers hear "Thinking" once.
            <p className={styles.head}>
              <Loader variant={loader} size="sm" orbState="working" label={null} className={loader === "spinner" ? styles.spin : undefined} />
              <span role="status">Thinking</span>
              {time && (
                <span className={styles.time} aria-hidden="true">
                  {time}
                </span>
              )}
            </p>
          ) : (
            <button type="button" className={styles.headButton} aria-expanded={showSteps} aria-controls={logId} onClick={() => setShowSteps((s) => !s)}>
              <ChevronRight aria-hidden="true" strokeWidth={1.8} className={styles.chev} />
              <span>Thought{time ? ` for ${time}` : ""}</span>
            </button>
          )}
          {(thinking || showSteps) && (
            <ol id={logId} className={styles.log} aria-label="Steps" aria-live={thinking ? "polite" : undefined}>
              {steps.map((s, i) => (
                <li key={s.id} data-current={thinking && i === steps.length - 1}>
                  {s.label}
                </li>
              ))}
            </ol>
          )}
        </div>
        {visual && thinking && <canvas ref={canvasRef} className={styles.canvas} data-thinking-visual="" aria-hidden="true" />}
      </div>

      {!thinking && children && <div className={styles.answer}>{children}</div>}
    </section>
  );
}
