import * as React from "react";

export interface CloudIcon {
  id: string;
  label: string;
  /** React node (SVG, img, text). Rendered inside a 36×36 chip. */
  node: React.ReactNode;
}

export interface IconCloudProps {
  icons: CloudIcon[];
  /** Rendered size in CSS pixels (width = height). Default: 320. */
  size?: number;
  /** Rotation period in seconds. Default: 24. */
  rotationSeconds?: number;
  /** Pause the cloud. Default: false. */
  paused?: boolean;
  className?: string;
  /** Accessible description for the whole cloud. */
  label?: string;
}

/**
 * Rotating sphere of icon chips. Icons are placed on an evenly distributed
 * Fibonacci sphere; the rotation applies an inverse transform to each chip so
 * icons stay upright. No WebGL, no three.js — just transforms.
 */
export function IconCloud({
  icons,
  size = 320,
  rotationSeconds = 24,
  paused = false,
  className,
  label,
}: IconCloudProps) {
  // Precompute direction vectors on a Fibonacci sphere, memoized by count.
  const positions = React.useMemo(() => {
    const n = icons.length;
    const phi = Math.PI * (3 - Math.sqrt(5));
    return icons.map((_, i) => {
      const y = 1 - (i / Math.max(1, n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = phi * i;
      return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
    });
  }, [icons]);

  const chipsRef = React.useRef<HTMLDivElement[]>([]);
  const rafRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number>(performance.now());

  React.useEffect(() => {
    if (paused) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const radius = size * 0.38;

    const tick = (now: number) => {
      const t = (now - startRef.current) / 1000;
      const theta = (t / rotationSeconds) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const tilt = 0.3;
      const cosP = Math.cos(tilt);
      const sinP = Math.sin(tilt);

      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i]!;
        const el = chipsRef.current[i];
        if (!el) continue;
        // rotate around y
        const x1 = pos.x * cosT + pos.z * sinT;
        const z1 = -pos.x * sinT + pos.z * cosT;
        // tilt around x
        const y1 = pos.y * cosP - z1 * sinP;
        const z2 = pos.y * sinP + z1 * cosP;
        const scale = 0.6 + (z2 + 1) * 0.3;
        const px = x1 * radius;
        const py = y1 * radius;
        el.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${scale})`;
        el.style.opacity = `${Math.max(0.3, 0.5 + z2 * 0.5)}`;
        el.style.zIndex = `${Math.round((z2 + 1) * 1000)}`;
      }
      if (!reduce) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [positions, rotationSeconds, paused, size]);

  return (
    <div
      className={["hg-icon-cloud", className].filter(Boolean).join(" ")}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `Cloud of ${icons.length} integrations`}
    >
      {icons.map((icon, i) => (
        <div
          key={icon.id}
          className="hg-icon-cloud__chip"
          ref={(el) => {
            if (el) chipsRef.current[i] = el;
          }}
          title={icon.label}
        >
          {icon.node}
        </div>
      ))}
    </div>
  );
}
