import * as React from "react";

export interface GlyphMatrixProps {
  /** Width in CSS px. Default: 480. */
  width?: number;
  /** Height in CSS px. Default: 320. */
  height?: number;
  /** Glyph cell size in px. Default: 14. */
  cellSize?: number;
  /** Charset to draw. Default: a short unicode set. */
  charset?: string;
  /** Any number of forms to cycle between. Each is { kind, value }. */
  forms?: GlyphForm[];
  /** Seconds a form holds before transitioning. Default: 3. */
  holdSeconds?: number;
  /** Transition duration between forms. Default: 1.2. */
  morphSeconds?: number;
  /** Glyph colour. Default: muted docs ink. */
  color?: string;
  className?: string;
}

export type GlyphForm =
  | { kind: "random" }
  | { kind: "text"; value: string; weight?: number }
  | { kind: "image"; src: string };

/**
 * A low-contrast background matrix of small glyphs that cycles between forms:
 * random noise, typed text, and uploaded silhouettes. Every form is sampled to
 * the same cell grid so transitions are smooth. The matrix is drawn behind
 * content via position: absolute; it is purely decorative.
 */
export function GlyphMatrix({
  width = 480,
  height = 320,
  cellSize = 14,
  charset = "01HEIGIN<>/\\|.*+#@",
  forms = [{ kind: "random" }],
  holdSeconds = 3,
  morphSeconds = 1.2,
  color = "rgba(99, 102, 241, 0.75)",
  className,
}: GlyphMatrixProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  // Resolve each form into a mask grid once per prop change.
  const maskPromise = React.useMemo(() => resolveForms(forms, Math.floor(width / cellSize), Math.floor(height / cellSize), charset), [forms, width, height, cellSize, charset]);

  React.useEffect(() => {
    let cancelled = false;
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
    ctx.font = `${cellSize - 2}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);

    maskPromise.then((masks) => {
      if (cancelled) return;
      const periodMs = (holdSeconds + morphSeconds) * 1000;
      const start = performance.now();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const tick = (now: number) => {
        const elapsed = now - start;
        const idxA = Math.floor(elapsed / periodMs) % masks.length;
        const idxB = (idxA + 1) % masks.length;
        const inPeriod = elapsed % periodMs;
        const morphPhase = Math.max(0, (inPeriod - holdSeconds * 1000) / (morphSeconds * 1000));
        const a = masks[idxA]!;
        const b = masks[idxB]!;

        ctx.clearRect(0, 0, width, height);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            const va = a.values[idx]!;
            const vb = b.values[idx]!;
            const value = va + (vb - va) * morphPhase;
            if (value < 0.08) continue;
            const ch = (morphPhase > 0.5 ? b : a).chars[idx] ?? pickChar(charset, r, c, Math.floor(now / 400));
            ctx.globalAlpha = value;
            ctx.fillStyle = color;
            ctx.fillText(ch, c * cellSize + cellSize / 2, r * cellSize + cellSize / 2);
          }
        }
        ctx.globalAlpha = 1;
        if (!reduce) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    });
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [width, height, cellSize, charset, color, holdSeconds, morphSeconds, maskPromise]);

  return <canvas ref={canvasRef} className={["hg-glyphmx", className].filter(Boolean).join(" ")} aria-hidden="true" />;
}

interface ResolvedForm { values: Float32Array; chars: string[] }

async function resolveForms(forms: GlyphForm[], cols: number, rows: number, charset: string): Promise<ResolvedForm[]> {
  const n = cols * rows;
  const results: ResolvedForm[] = [];
  for (const form of forms) {
    if (form.kind === "random") {
      const values = new Float32Array(n);
      const chars: string[] = new Array(n);
      for (let i = 0; i < n; i++) {
        values[i] = Math.random() * 0.6 + 0.1;
        chars[i] = charset.charAt(Math.floor(Math.random() * charset.length));
      }
      results.push({ values, chars });
    } else if (form.kind === "text") {
      results.push(renderText(form.value, cols, rows, charset, form.weight ?? 700));
    } else {
      try {
        results.push(await renderImage(form.src, cols, rows, charset));
      } catch {
        // Fall back to a dim random form.
        const values = new Float32Array(n);
        for (let i = 0; i < n; i++) values[i] = 0.15;
        const chars: string[] = new Array(n).fill(charset.charAt(0));
        results.push({ values, chars });
      }
    }
  }
  return results;
}

function renderText(value: string, cols: number, rows: number, charset: string, weight: number): ResolvedForm {
  const off = document.createElement("canvas");
  off.width = cols;
  off.height = rows;
  const ctx = off.getContext("2d");
  const n = cols * rows;
  const values = new Float32Array(n);
  const chars: string[] = new Array(n);
  if (!ctx) {
    for (let i = 0; i < n; i++) chars[i] = charset.charAt(0);
    return { values, chars };
  }
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  // Fit text within the grid.
  const target = Math.min(cols * 0.9, rows * 1.4);
  ctx.font = `${weight} ${Math.max(6, target / Math.max(2, value.length) * 1.8)}px system-ui, sans-serif`;
  ctx.fillText(value, cols / 2, rows / 2);
  const data = ctx.getImageData(0, 0, cols, rows).data;
  for (let i = 0; i < n; i++) {
    const alpha = data[i * 4 + 3]! / 255;
    values[i] = alpha * 0.95;
    chars[i] = charset.charAt((i * 31) % charset.length);
  }
  return { values, chars };
}

async function renderImage(src: string, cols: number, rows: number, charset: string): Promise<ResolvedForm> {
  const img = await loadImage(src);
  const off = document.createElement("canvas");
  off.width = cols;
  off.height = rows;
  const ctx = off.getContext("2d");
  const n = cols * rows;
  const values = new Float32Array(n);
  const chars: string[] = new Array(n);
  if (!ctx) return { values, chars };
  const ratio = Math.min(cols / img.width, rows / img.height);
  const w = img.width * ratio;
  const h = img.height * ratio;
  ctx.drawImage(img, (cols - w) / 2, (rows - h) / 2, w, h);
  const data = ctx.getImageData(0, 0, cols, rows).data;
  for (let i = 0; i < n; i++) {
    const a = data[i * 4 + 3]! / 255;
    // Darkness of the image also contributes, so black-on-white silhouettes work.
    const r = data[i * 4]!;
    const g = data[i * 4 + 1]!;
    const b = data[i * 4 + 2]!;
    const lum = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    values[i] = a > 0 ? Math.max(a, lum) * 0.9 : 0;
    chars[i] = charset.charAt((i * 37) % charset.length);
  }
  return { values, chars };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function pickChar(charset: string, r: number, c: number, salt: number): string {
  return charset.charAt(((r * 131 + c * 31) ^ salt) % charset.length);
}
