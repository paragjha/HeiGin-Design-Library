import * as React from "react";

export type ParticleMode = "attract" | "repel";

export interface CursorParticlesProps {
  mode?: ParticleMode;
  /** How many particles to render. Default: 90. */
  count?: number;
  /** Radius of influence around the cursor in CSS pixels. Default: 140. */
  radius?: number;
  /** Force applied inside the radius. Default: 0.6. */
  force?: number;
  /** 0–1 damping each frame. 0 = no damping. Default: 0.14. */
  damping?: number;
  /** Particle colour. Default: HeiGin brand. */
  color?: string;
  /** Height of the canvas area in px. Default: 320. */
  height?: number;
  className?: string;
  /** Optional React children rendered over the canvas (e.g. a hero title). */
  children?: React.ReactNode;
}

interface P {
  x: number; y: number; vx: number; vy: number; ox: number; oy: number; r: number;
}

/**
 * Canvas particle field that reacts to the pointer. Two variants:
 *   - attract: particles drift toward the cursor
 *   - repel: particles slide out of the cursor's way, then settle back
 * Keyboard/touch friendly: without a pointer the field holds still at rest.
 */
export function CursorParticles({
  mode = "repel",
  count = 90,
  radius = 140,
  force = 0.6,
  damping = 0.14,
  color = "var(--hg-color-brand, #6366f1)",
  height = 320,
  className,
  children,
}: CursorParticlesProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const pointer = React.useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false });
  const particles = React.useRef<P[]>([]);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const rect = host.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      const arr: P[] = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        arr.push({ x, y, vx: 0, vy: 0, ox: x, oy: y, r: 1 + Math.random() * 1.8 });
      }
      particles.current = arr;
    };

    const strokeColor = (() => {
      const probe = document.createElement("span");
      probe.style.color = color;
      document.body.appendChild(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      return resolved || color;
    })();

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      const p = particles.current;
      const px = pointer.current.x;
      const py = pointer.current.y;
      const active = pointer.current.active;
      const r2 = radius * radius;
      for (let i = 0; i < p.length; i++) {
        const pt = p[i]!;
        if (active) {
          const dx = pt.x - px;
          const dy = pt.y - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2 && d2 > 0.5) {
            const d = Math.sqrt(d2);
            const strength = (1 - d / radius) * force;
            const nx = dx / d;
            const ny = dy / d;
            if (mode === "repel") {
              pt.vx += nx * strength;
              pt.vy += ny * strength;
            } else {
              pt.vx -= nx * strength;
              pt.vy -= ny * strength;
            }
          }
        }
        // Spring back to origin.
        pt.vx += (pt.ox - pt.x) * 0.012;
        pt.vy += (pt.oy - pt.y) * 0.012;
        pt.vx *= 1 - damping;
        pt.vy *= 1 - damping;
        pt.x += pt.vx;
        pt.y += pt.vy;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.globalAlpha = 0.7;
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(render);
    };

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.current.x = e.clientX - rect.left;
      pointer.current.y = e.clientY - rect.top;
      pointer.current.active = true;
    };
    const onLeave = () => {
      pointer.current.active = false;
      pointer.current.x = -9999;
      pointer.current.y = -9999;
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resize();
    seed();
    if (!reduce) rafRef.current = requestAnimationFrame(render);
    else {
      // Draw one static frame for reduced motion.
      render();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    const ro = new ResizeObserver(() => {
      resize();
      seed();
    });
    ro.observe(host);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
    };
  }, [mode, count, radius, force, damping, color]);

  return (
    <div
      ref={hostRef}
      className={["hg-cursor-particles", className].filter(Boolean).join(" ")}
      style={{ height }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      {children && <div className="hg-cursor-particles__content">{children}</div>}
    </div>
  );
}
