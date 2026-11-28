"use client";

import * as React from "react";
import { motionConfig } from "@/lib/motion-config";
import { chaser, clamp01, cn, power3Out, prefersReducedMotion, seeded } from "@/lib/motion-utils";

const SCRUB_S = 0.5;
const ACCENT_SPAN = 0.06; // share of the sweep an accent cell spends in its two colours before it turns light
const SEED = 1729;

type Grid = { cols: number; rows: number; size: number; top: number; th: Float32Array; accent: Uint8Array };

/**
 * Each cell's turn in the sweep, 0 (first) to 1 (last). Bottom rows go first; the front is part smooth wave across
 * the columns and part scatter per cell, seeded, so it breaks up the same way on every load and reverses cleanly.
 */
function buildGrid(W: number, H: number, cellSize: number, raggedness: number, accentShare: number): Grid {
  const cols = Math.max(1, Math.ceil(W / cellSize));
  const size = W / cols;
  const rows = Math.max(1, Math.ceil(H / size));
  const rand = seeded(SEED);
  const p1 = rand() * Math.PI * 2;
  const p2 = rand() * Math.PI * 2;
  const th = new Float32Array(cols * rows);
  const accent = new Uint8Array(cols * rows);
  const k = 0.05 * raggedness;
  let min = Infinity;
  let max = -Infinity;
  for (let c = 0; c < cols; c++) {
    const wave = 0.6 * Math.sin(c * 0.55 + p1) + 0.4 * Math.sin(c * 1.3 + p2);
    for (let r = 0; r < rows; r++) {
      const fromBottom = rows - 1 - r;
      const v = (fromBottom + 0.5) / rows + k * (0.6 * wave + 1.4 * (rand() - 0.5));
      const i = r * cols + c;
      th[i] = v;
      accent[i] = rand() < accentShare ? 1 : 0;
      min = Math.min(min, v);
      max = Math.max(max, v);
    }
  }
  for (let i = 0; i < th.length; i++) th[i] = (th[i]! - min) / (max - min || 1);
  return { cols, rows, size, top: H - rows * size, th, accent };
}

/** Turn range of the cells under a box, so copy can leave before the first of them flips or arrive after the last. */
function turnsUnder(g: Grid, box: DOMRect, stage: DOMRect) {
  let first = 1;
  let last = 0;
  const c0 = Math.max(0, Math.floor((box.left - stage.left) / g.size));
  const c1 = Math.min(g.cols - 1, Math.floor((box.right - stage.left) / g.size));
  const r0 = Math.max(0, Math.floor((box.top - stage.top - g.top) / g.size));
  const r1 = Math.min(g.rows - 1, Math.floor((box.bottom - stage.top - g.top) / g.size));
  for (let r = r0; r <= r1; r++)
    for (let c = c0; c <= c1; c++) {
      const t = g.th[r * g.cols + c]!;
      first = Math.min(first, t);
      last = Math.max(last, t);
    }
  return { first, last };
}

/** A dark hero breaks up into square cells as you scroll, flipping to the light section underneath in a ragged front. */
export function MotionPixelWipe({ className }: { className?: string }) {
  const cfg = motionConfig.pixelWipe;
  const root = React.useRef<HTMLElement>(null);
  const stage = React.useRef<HTMLDivElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const darkCopy = React.useRef<HTMLDivElement>(null);
  const lightCopy = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState({ dark: false, light: false });

  React.useEffect(() => {
    const el = root.current;
    const st = stage.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !st || !cv || !ctx) return;
    const progress = chaser(prefersReducedMotion() ? 0 : SCRUB_S, power3Out);
    let W = 0;
    let H = 0;
    let dpr = 1;
    let grid: Grid | null = null;
    let darkTurn = 0;
    let lightTurn = 1;
    let ink = "#0f0f0f";
    let state = { dark: false, light: false };
    let raf = 0;

    const measure = () => {
      W = st.clientWidth;
      H = st.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      grid = buildGrid(W, H, cfg.cellSize, cfg.raggedness, cfg.accent);
      const box = st.getBoundingClientRect();
      darkTurn = darkCopy.current ? turnsUnder(grid, darkCopy.current.getBoundingClientRect(), box).first : 0;
      lightTurn = lightCopy.current ? turnsUnder(grid, lightCopy.current.getBoundingClientRect(), box).last : 1;
      ink = getComputedStyle(st.querySelector(".mo-dark")!).getPropertyValue("--hg-color-bg").trim() || ink;
    };

    const draw = (now: number) => {
      if (!grid) return;
      const p = progress.get(now);
      const sweep = p * (1 + ACCENT_SPAN);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      const { cols, rows, size, top, th, accent } = grid;
      // cell edges snapped to whole device pixels, so neighbours share an edge and no seam shows
      const px = (v: number) => Math.round(v * dpr);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const q = sweep - th[i]!;
          if (q >= ACCENT_SPAN) continue; // turned light: the light section shows through
          ctx.fillStyle = q > 0 && accent[i] ? cfg.accentColors[q < ACCENT_SPAN / 2 ? 0 : 1]! : ink;
          const x = px(c * size);
          const y = px(top + r * size);
          ctx.fillRect(x, y, px((c + 1) * size) - x, px(top + (r + 1) * size) - y);
        }
      const r = el.getBoundingClientRect();
      const next = { dark: r.top < window.innerHeight * 0.5 && sweep <= darkTurn, light: sweep - lightTurn >= ACCENT_SPAN };
      if (next.dark !== state.dark || next.light !== state.light) {
        state = next;
        setShown(next);
      }
    };

    const loop = (now: number) => {
      draw(now);
      raf = progress.settled(now) ? 0 : requestAnimationFrame(loop);
    };
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      progress.set(span > 0 ? clamp01(-r.top / span) : 0, performance.now());
      if (!raf) raf = requestAnimationFrame(loop);
    };
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        measure();
        draw(performance.now());
      }, 150);
    };

    measure();
    onScroll();
    progress.jump(progress.get(Infinity));
    draw(performance.now());
    void document.fonts?.ready.then(() => {
      measure();
      draw(performance.now());
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [cfg]);

  const copy = (part: { headline: string[]; text: string; emphasis: string }) => (
    <>
      <h2 className="mo-display m-0">
        {part.headline.map((line, i) => (
          <span key={i} className={cn("mo-rise-mask", i > 0 && "text-muted")}>
            <span className="mo-rise-line" style={{ "--i": i } as React.CSSProperties}>
              {line}
            </span>
          </span>
        ))}
      </h2>
      <p className="mo-pw-note mo-rise-fade m-0 text-muted" style={{ "--i": 0 } as React.CSSProperties}>
        {part.text} <b className="font-normal text-ink">{part.emphasis}</b>
      </p>
    </>
  );

  return (
    <section ref={root} className={cn("mo-pw bg-bg text-ink", className)} style={{ "--mo-pw-len": cfg.scrollLength } as React.CSSProperties}>
      <div ref={stage} className="mo-pw-stage">
        <div className="mo-pw-scene bg-bg" data-shown={shown.light}>
          <div ref={lightCopy} className="mo-pw-copy mo-pw-bottom">
            {copy(cfg.light)}
          </div>
        </div>
        <canvas ref={canvas} className="mo-pw-canvas" aria-hidden="true" />
        <div className="mo-pw-scene mo-pw-dark mo-dark text-ink" data-shown={shown.dark}>
          <div ref={darkCopy} className="mo-pw-copy mo-pw-top">
            {copy(cfg.dark)}
          </div>
        </div>
      </div>
    </section>
  );
}
