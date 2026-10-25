import * as React from "react";

export interface DottedGlobeProps {
  /** Rendered size (width = height) in CSS pixels. Default: 320. */
  size?: number;
  /** Number of latitude/longitude dots. Higher = denser. Default: 42. */
  density?: number;
  /** Rotation period in seconds. Default: 32. */
  rotationSeconds?: number;
  /** Tilt in degrees around the x-axis. Default: 22. */
  tilt?: number;
  /** Dot colour. Default: HeiGin brand. */
  color?: string;
  className?: string;
}

/**
 * 3-D rotating globe drawn as a grid of dots. Pure canvas, 60fps on modern
 * laptops, no WebGL. Dot alpha goes to 0 when a dot rotates behind the sphere,
 * which gives the familiar "pierced" silhouette.
 */
export function DottedGlobe({
  size = 320,
  density = 42,
  rotationSeconds = 32,
  tilt = 22,
  color = "var(--hg-color-brand, #6366f1)",
  className,
}: DottedGlobeProps) {
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

    const resolved = (() => {
      const probe = document.createElement("span");
      probe.style.color = color;
      document.body.appendChild(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c || color;
    })();

    // Precompute equator-style dot grid in lat/lng.
    type D = { lat: number; lng: number };
    const dots: D[] = [];
    const latCount = density;
    for (let i = 1; i < latCount; i++) {
      const lat = -Math.PI / 2 + (i / latCount) * Math.PI;
      const ring = Math.max(4, Math.round(density * Math.cos(lat) * 2));
      for (let j = 0; j < ring; j++) {
        const lng = (j / ring) * Math.PI * 2;
        dots.push({ lat, lng });
      }
    }

    const centre = size / 2;
    const radius = size * 0.42;
    const tiltRad = (tilt * Math.PI) / 180;
    const cosT = Math.cos(tiltRad);
    const sinT = Math.sin(tiltRad);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();

    const render = (now: number) => {
      const t = (now - start) / 1000;
      const theta = (t / rotationSeconds) * Math.PI * 2;
      ctx.clearRect(0, 0, size, size);

      // Soft halo
      const grad = ctx.createRadialGradient(centre, centre, radius * 0.6, centre, centre, radius * 1.3);
      grad.addColorStop(0, "rgba(99,102,241,0.0)");
      grad.addColorStop(1, "rgba(99,102,241,0.15)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centre, centre, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]!;
        const lng = d.lng + theta;
        // Convert lat/lng to xyz on a unit sphere.
        const x0 = Math.cos(d.lat) * Math.sin(lng);
        const y0 = Math.sin(d.lat);
        const z0 = Math.cos(d.lat) * Math.cos(lng);
        // Apply tilt around x axis.
        const y1 = y0 * cosT - z0 * sinT;
        const z1 = y0 * sinT + z0 * cosT;
        if (z1 < -0.02) continue; // dot is behind the globe
        const alpha = Math.max(0, Math.min(1, 0.3 + z1 * 0.9));
        const px = centre + x0 * radius;
        const py = centre + y1 * radius;
        ctx.beginPath();
        ctx.arc(px, py, 1.2 + z1 * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = resolved;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduce) rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [size, density, rotationSeconds, tilt, color]);

  return (
    <canvas
      ref={canvasRef}
      className={["hg-globe", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}
