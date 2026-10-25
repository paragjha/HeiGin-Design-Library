import * as React from "react";

export interface FlickerGridProps {
  /** Width of the canvas in CSS px. Default: 480. */
  width?: number;
  /** Height of the canvas in CSS px. Default: 320. */
  height?: number;
  /** Cell size in px. Default: 4. */
  squareSize?: number;
  /** Gap between cells in px. Default: 6. */
  gridGap?: number;
  /** Dot colour. Default: HeiGin brand. */
  color?: string;
  /** Peak opacity of a dot inside the shape. Default: 0.9. */
  maxOpacity?: number;
  /** Per-frame chance a cell flips. Default: 0.1. */
  flickerChance?: number;
  /** Pointer influence radius in px; 0 disables. Default: 90. */
  magnetRadius?: number;
  /** URL or ObjectURL of a shape mask. Transparent means off; black is on. */
  shapeSrc?: string;
  className?: string;
}

/**
 * A flickering grid of dots that reveals a shape, with a magnetic cursor
 * response that pushes nearby cells brighter. The shape is sampled from an
 * uploaded image/SVG: anywhere the image is opaque counts as "inside". When
 * no shape is provided the whole grid flickers evenly.
 */
export function FlickerGrid({
  width = 480,
  height = 320,
  squareSize = 4,
  gridGap = 6,
  color = "var(--hg-color-brand, #6366f1)",
  maxOpacity = 0.9,
  flickerChance = 0.1,
  magnetRadius = 90,
  shapeSrc,
  className,
}: FlickerGridProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const pointer = React.useRef<{ x: number; y: number; active: boolean }>({ x: -1e4, y: -1e4, active: false });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const strokeColor = (() => {
      const probe = document.createElement("span");
      probe.style.color = color;
      document.body.appendChild(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c || color;
    })();

    const step = squareSize + gridGap;
    const cols = Math.floor(width / step);
    const rows = Math.floor(height / step);
    const states = new Float32Array(cols * rows);
    for (let i = 0; i < states.length; i++) states[i] = Math.random() * maxOpacity;

    // Shape mask: render shape image to an offscreen canvas and sample alpha.
    const mask = new Float32Array(cols * rows);
    mask.fill(shapeSrc ? 0 : 1);
    let cancelled = false;

    if (shapeSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) return;
        const off = document.createElement("canvas");
        off.width = cols;
        off.height = rows;
        const octx = off.getContext("2d");
        if (!octx) return;
        // "contain" into the grid, centered.
        const ratio = Math.min(cols / img.width, rows / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        octx.drawImage(img, (cols - w) / 2, (rows - h) / 2, w, h);
        const data = octx.getImageData(0, 0, cols, rows).data;
        for (let i = 0; i < mask.length; i++) {
          mask[i] = data[i * 4 + 3]! / 255;
        }
      };
      img.onerror = () => {
        // Shape failed; keep the whole grid lit so the demo still shows.
        if (!cancelled) mask.fill(1);
      };
      img.src = shapeSrc;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const px = pointer.current.x;
      const py = pointer.current.y;
      const active = pointer.current.active;
      const r2 = magnetRadius * magnetRadius;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const inside = mask[i]!;
          if (!reduce && Math.random() < flickerChance) {
            states[i] = Math.random() * maxOpacity;
          }
          let alpha = states[i]! * (0.25 + 0.75 * inside);
          if (active) {
            const cx = c * step + squareSize / 2;
            const cy = r * step + squareSize / 2;
            const dx = cx - px;
            const dy = cy - py;
            const d2 = dx * dx + dy * dy;
            if (d2 < r2) {
              const boost = 1 - d2 / r2;
              alpha = Math.min(maxOpacity, alpha + boost * 0.8);
            }
          }
          if (alpha < 0.02) continue;
          ctx.fillStyle = strokeColor;
          ctx.globalAlpha = alpha;
          ctx.fillRect(c * step, r * step, squareSize, squareSize);
        }
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(render);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current.x = e.clientX - rect.left;
      pointer.current.y = e.clientY - rect.top;
      pointer.current.active = true;
    };
    const onLeave = () => {
      pointer.current.active = false;
      pointer.current.x = -1e4;
      pointer.current.y = -1e4;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [width, height, squareSize, gridGap, color, maxOpacity, flickerChance, magnetRadius, shapeSrc]);

  return (
    <canvas
      ref={canvasRef}
      className={["hg-flicker", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}
