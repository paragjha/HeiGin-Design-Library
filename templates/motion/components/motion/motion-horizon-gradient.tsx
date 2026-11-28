"use client";

import * as React from "react";
import { motionConfig } from "@/lib/motion-config";
import { chaser, clamp01, cn, cubicBezier, lerp, power3Out, prefersReducedMotion, smoothstep } from "@/lib/motion-utils";

// Timeline, in scroll units: the edge rises and flattens, the dark holds, then it lifts into a sunrise glow.
const RISE = 1.3;
const HOLD = 0.5;
const BACK = 1.1;
const TOTAL = RISE + HOLD + BACK;
const SCRUB_S = 0.5;
const phaseEase = cubicBezier(0.65, 0, 0.35, 1);

const HAZE: [number, string][] = [
  [0.3, "#000c22"],
  [0.55, "#031a39"],
  [0.7, "#0c284f"],
  [0.8, "#194373"],
  [0.9, "#1f5788"],
  [1, "#3e90c2"],
];
const RIM_BLUE = [62, 144, 194];
const RIM_WHITE = [232, 244, 255];
const RIM_LAYERS: [number, number][] = [
  [4, 0.4],
  [9, 0.2],
  [16, 0.09],
  [26, 0.04],
];

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

type Pose = { edge: number; s: number; g: number; r: number; flip: boolean; covered: boolean; R?: number; cy?: number };

/** Where the planet's edge is at timeline time `t`: rising as a dome from below, then hanging from the top as it lifts away. */
function poseAt(t: number, W: number, H: number, sag: number, glowHeight: number): Pose {
  const rise = phaseEase(clamp01(t / RISE));
  const back = phaseEase(clamp01((t - RISE - HOLD) / BACK));
  let y: number;
  let p: Omit<Pose, "edge" | "covered">;
  if (back > 0) {
    const s = lerp(1.15 * sag, 0, back);
    y = lerp(H, 0, back) + s;
    p = { s, g: lerp(0.16, glowHeight, back) * H, r: lerp(0.3, 1, back), flip: true };
  } else {
    y = lerp(0.24 * H, H + lerp(1, 0.35, 0.92) * sag, rise / 0.92);
    p = { s: lerp(1, 0.35, rise) * sag, g: lerp(0.34, 0.6, rise) * H, r: lerp(0.45, 0.75, rise), flip: false };
  }
  const pose: Pose = { ...p, edge: p.flip ? y : H - y, covered: y - p.s >= H };
  if (pose.s >= 2) {
    pose.R = ((W / 2) * (W / 2) + pose.s * pose.s) / (2 * pose.s);
    pose.cy = pose.flip ? pose.edge - pose.R : pose.edge + pose.R;
  }
  return pose;
}

/** The dark side of a planet rises over the page with sunrise burning on its edge, fills the screen, then lifts away as a glow. */
export function MotionHorizonGradient({ className }: { className?: string }) {
  const cfg = motionConfig.horizon;
  const root = React.useRef<HTMLElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = React.useState({ after: false, dark: false, afterText: false });

  React.useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;
    const ramp = cfg.ramp.map(rgb);
    const night = rgb(cfg.night);
    const glow = document.createElement("canvas");
    const gctx = glow.getContext("2d")!;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let sag = 0;
    let image: ImageData | null = null;
    const time = chaser(prefersReducedMotion() ? 0 : SCRUB_S, power3Out);
    let raf = 0;
    let shown = { after: false, dark: false, afterText: false };

    const measure = () => {
      W = cv.clientWidth;
      H = cv.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      // the glow is worked out per pixel at a quarter of the screen size, then scaled up
      glow.width = Math.max(1, Math.round(W * 0.25));
      glow.height = Math.max(1, Math.round(H * 0.25));
      image = gctx.createImageData(glow.width, glow.height);
      sag = Math.min(cfg.curveDepth * Math.max(W / 2, 0.38 * H), (W / 2) * 0.8);
    };

    const limb = (p: Pose) => {
      ctx.beginPath();
      if (p.cy === undefined) {
        ctx.moveTo(0, p.edge);
        ctx.lineTo(W, p.edge);
      } else if (p.flip) ctx.arc(W / 2, p.cy, p.R!, 0, Math.PI);
      else ctx.arc(W / 2, p.cy, p.R!, Math.PI, 2 * Math.PI);
    };
    // inside: just the planet; outside: everything but the planet
    const clipPlanet = (p: Pose, inside: boolean) => {
      ctx.beginPath();
      if (p.cy === undefined) {
        const planet = p.flip ? [0, 0, W, p.edge] : [0, p.edge, W, H - p.edge];
        const sky = p.flip ? [0, p.edge, W, H - p.edge] : [0, 0, W, p.edge];
        const [x, y, w, h] = inside ? planet : sky;
        ctx.rect(x!, y!, w!, h!);
      } else {
        if (!inside) ctx.rect(0, 0, W, H);
        ctx.arc(W / 2, p.cy, p.R!, 0, 2 * Math.PI);
      }
      ctx.clip("evenodd");
    };

    const drawGlow = (p: Pose) => {
      const gw = glow.width;
      const gh = glow.height;
      const data = image!.data;
      const last = ramp.length - 1;
      const peak = 255 * (0.55 + 0.45 * p.r);
      for (let i = 0; i < gw; i++) {
        const x = ((i + 0.5) * W) / gw;
        // hottest and tallest in the middle where the sun sits; thinner and already orange-red at the sides
        const c = Math.exp(-Math.pow((x - W / 2) / (0.42 * W), 2));
        const reach = Math.max(1, p.g * (0.5 + 0.5 * c));
        const offset = 0.25 * (1 - c);
        for (let j = 0; j < gh; j++) {
          const y = ((j + 0.5) * H) / gh;
          const d = p.cy === undefined ? (p.flip ? y - p.edge : p.edge - y) : Math.hypot(x - W / 2, y - p.cy) - p.R!;
          const t = d / reach + offset;
          const k = 4 * (j * gw + i);
          if (d < 0 || t >= 1) {
            data[k + 3] = 0;
            continue;
          }
          const at = t * last;
          const lo = Math.min(last - 1, Math.floor(at));
          const f = at - lo;
          const a = ramp[lo]!;
          const b = ramp[lo + 1]!;
          const fade = t <= 0.55 ? 1 : 1 - (t - 0.55) / 0.45;
          data[k] = a[0]! + (b[0]! - a[0]!) * f;
          data[k + 1] = a[1]! + (b[1]! - a[1]!) * f;
          data[k + 2] = a[2]! + (b[2]! - a[2]!) * f;
          data[k + 3] = peak * smoothstep(fade);
        }
      }
      gctx.putImageData(image!, 0, 0);
      ctx.drawImage(glow, 0, 0, W, H);
    };

    const drawPlanet = (p: Pose) => {
      ctx.fillStyle = rgba(night, 1);
      if (p.cy === undefined) {
        if (p.flip) ctx.fillRect(0, 0, W, p.edge);
        else ctx.fillRect(0, p.edge, W, H - p.edge);
      } else {
        ctx.beginPath();
        ctx.arc(W / 2, p.cy, p.R!, 0, 2 * Math.PI);
        ctx.fill();
        // the circle can be smaller than the screen: fill the far side of its centre too
        if (p.flip && p.cy > 0) ctx.fillRect(0, 0, W, p.cy);
        if (!p.flip && p.cy < H) ctx.fillRect(0, p.cy, W, H - p.cy);
      }
    };

    // a faint blue haze just inside the edge, thinning toward the sides
    const drawHaze = (p: Pose) => {
      const depth = 0.06 * W;
      const g =
        p.cy === undefined
          ? ctx.createLinearGradient(0, p.edge + (p.flip ? -depth : depth), 0, p.edge)
          : ctx.createRadialGradient(W / 2, p.cy, Math.max(0, p.R! - depth), W / 2, p.cy, p.R!);
      const a = 0.7 + 0.3 * p.r;
      g.addColorStop(0, rgba(rgb(HAZE[0]![1]), 0));
      HAZE.forEach(([at, hex]) => g.addColorStop(at, rgba(rgb(hex), a)));
      const sides = ctx.createLinearGradient(0, 0, W, 0);
      [0, 0.32, 0.5, 0.68, 1].forEach((at, i) => sides.addColorStop(at, rgba(night, [0.85, 0.16, 0, 0.16, 0.85][i]!)));
      ctx.save();
      clipPlanet(p, true);
      if (p.cy !== undefined) {
        // only the half of the limb that faces the light
        ctx.beginPath();
        if (p.flip) ctx.rect(0, p.cy, W, H - p.cy);
        else ctx.rect(0, 0, W, p.cy);
        ctx.clip();
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = sides;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    };

    // a hairline rim, white where the sun is and blue toward the sides, with a soft bloom outside it
    const drawRim = (p: Pose) => {
      const a = 0.9 * (0.4 + 0.6 * p.r);
      const g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, rgba(RIM_BLUE, 0.6 * a));
      g.addColorStop(0.3, rgba(RIM_BLUE, 0.8 * a));
      g.addColorStop(0.5, rgba(RIM_WHITE, a));
      g.addColorStop(0.7, rgba(RIM_BLUE, 0.8 * a));
      g.addColorStop(1, rgba(RIM_BLUE, 0.6 * a));
      ctx.save();
      clipPlanet(p, false);
      ctx.strokeStyle = g;
      for (const [width, alpha] of RIM_LAYERS) {
        limb(p);
        ctx.lineWidth = width;
        ctx.globalAlpha = alpha;
        ctx.stroke();
      }
      ctx.restore();
      limb(p);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.25;
      ctx.stroke();
    };

    const draw = (now: number) => {
      if (!W || !H) return;
      const t = time.get(now);
      const p = poseAt(t, W, H, sag, cfg.glowHeight);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (p.covered) {
        ctx.fillStyle = rgba(night, 1);
        ctx.fillRect(0, 0, W, H);
      } else {
        drawGlow(p);
        drawPlanet(p);
        drawHaze(p);
        drawRim(p);
      }
      const back = clamp01((t - RISE - HOLD) / BACK);
      const next = { after: back > 0, dark: p.covered && back <= 0, afterText: back >= 0.55 };
      if (next.after !== shown.after || next.dark !== shown.dark || next.afterText !== shown.afterText) {
        shown = next;
        setPhase(next);
      }
    };

    const loop = (now: number) => {
      draw(now);
      raf = time.settled(now) ? 0 : requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      time.set((span > 0 ? clamp01(-r.top / span) : 0) * TOTAL, performance.now());
      kick();
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
    time.jump(time.get(Infinity));
    draw(performance.now());
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [cfg]);

  const heading = (lines: string[]) => (
    <h2 className="mo-display m-0">
      {lines.map((line, i) => (
        <span key={i} className={cn("mo-rise-mask", i > 0 && "text-muted")}>
          <span className="mo-rise-line" style={{ "--i": i } as React.CSSProperties}>
            {line}
          </span>
        </span>
      ))}
    </h2>
  );

  return (
    <section
      ref={root}
      className={cn("mo-hz bg-bg text-ink", className)}
      style={{ "--mo-hz-len": cfg.scrollLength } as React.CSSProperties}
    >
      <div className="mo-hz-stage">
        <div className="mo-hz-scene bg-bg" data-hidden={phase.after}>
          <div className="mo-hz-top">
            <h2 className="mo-display m-0">
              <span className="block">{cfg.before.headline[0]}</span> <span className="block text-muted">{cfg.before.headline[1]}</span>
            </h2>
          </div>
        </div>

        <div className="mo-hz-scene bg-bg" data-hidden={!phase.after} data-shown={phase.afterText}>
          <div className="mo-hz-bottom">
            {heading(cfg.after.headline)}
            <p className="mo-hz-note mo-rise-fade m-0 text-muted" style={{ "--i": 0 } as React.CSSProperties}>
              {cfg.after.text} <b className="font-normal text-ink">{cfg.after.emphasis}</b>
            </p>
            <a
              href={cfg.after.cta.href}
              className="mo-hz-cta mo-rise-fade inline-flex h-12 items-center whitespace-nowrap rounded-full bg-accent px-[22px] text-[15px] font-medium text-on-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              style={{ "--i": 1 } as React.CSSProperties}
              tabIndex={phase.afterText ? undefined : -1}
            >
              {cfg.after.cta.label}
            </a>
          </div>
        </div>

        <canvas ref={canvas} className="mo-hz-canvas" aria-hidden="true" />

        <div className="mo-hz-scene mo-hz-dark mo-dark text-ink" data-shown={phase.dark}>
          <div className="mo-hz-center">
            {heading(cfg.dark.headline)}
            <p className="mo-hz-note mo-rise-fade m-0 text-muted" style={{ "--i": 0 } as React.CSSProperties}>
              {cfg.dark.text} <b className="font-normal text-ink">{cfg.dark.emphasis}</b>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
