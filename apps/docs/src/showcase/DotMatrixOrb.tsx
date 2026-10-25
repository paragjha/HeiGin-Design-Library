import * as React from "react";

export interface DotMatrixOrbProps {
  /** Width/height in CSS pixels. Default: 240. */
  size?: number;
  /** Dot grid resolution. Default: 48. */
  resolution?: number;
  /** Dot colour. Default: HeiGin brand. */
  color?: string;
  /** Rotate the sphere so it reads as spinning. Default: true. */
  rotate?: boolean;
  /** Shape to render inside the dot grid. Default: "sphere". */
  shape?: "sphere" | "ring" | "wave";
  className?: string;
}

/**
 * Dot-matrix visualisation that reads as an orb (or a chosen mark). The grid
 * is a canvas; shape masking is done by distance-from-centre math so there is
 * no sampled image needed. Rotates by shifting the dot phase, not by actually
 * spinning the canvas.
 */
export function DotMatrixOrb({
  size = 240,
  resolution = 48,
  color = "var(--hg-color-brand, #6366f1)",
  rotate = true,
  shape = "sphere",
  className,
}: DotMatrixOrbProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const strokeColor = (() => {
      const probe = document.createElement("span");
      probe.style.color = color;
      document.body.appendChild(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      return resolved || color;
    })();

    const gap = size / resolution;
    const centre = size / 2;
    const r0 = size * 0.42;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const start = performance.now();
    const render = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, size, size);
      for (let gy = 0; gy < resolution; gy++) {
        for (let gx = 0; gx < resolution; gx++) {
          const x = (gx + 0.5) * gap;
          const y = (gy + 0.5) * gap;
          const dx = x - centre;
          const dy = y - centre;
          const d = Math.sqrt(dx * dx + dy * dy);
          let a = 0;
          switch (shape) {
            case "sphere": {
              if (d <= r0) {
                // 3-D depth: alpha falls at silhouette, radial lat/long shimmer.
                const z = Math.sqrt(Math.max(0, r0 * r0 - d * d));
                const latitude = y - centre;
                const longitude = Math.atan2(dx, z); // -π .. π
                const spin = rotate ? t * 0.9 : 0;
                const slot = Math.sin((longitude + spin) * 8) * 0.5 + 0.5;
                const edge = 1 - d / r0;
                a = Math.max(0, slot * 0.9 + 0.1) * (0.3 + 0.7 * edge);
                // subtle horizontal bands
                a *= 0.7 + 0.3 * Math.cos(latitude * 0.05);
              }
              break;
            }
            case "ring": {
              const target = r0 * 0.78;
              const width = r0 * 0.12;
              const diff = Math.abs(d - target);
              if (diff < width) {
                a = 1 - diff / width;
                a *= 0.5 + 0.5 * Math.sin(Math.atan2(dy, dx) * 8 + t * (rotate ? 2 : 0));
              }
              break;
            }
            case "wave": {
              const row = Math.sin((gx / resolution) * Math.PI * 4 + t * (rotate ? 2 : 0)) * 0.5 + 0.5;
              a = (gy / resolution < row ? 1 : 0) * (1 - gy / resolution);
              break;
            }
          }
          if (a > 0.02) {
            ctx.beginPath();
            ctx.arc(x, y, Math.min(gap * 0.4, 1.8), 0, Math.PI * 2);
            ctx.fillStyle = strokeColor;
            ctx.globalAlpha = Math.min(1, a);
            ctx.fill();
          }
        }
      }
      if (!reduce && rotate) rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [size, resolution, color, rotate, shape]);

  return <canvas ref={canvasRef} className={["hg-dot-orb", className].filter(Boolean).join(" ")} aria-hidden="true" />;
}
