import * as React from "react";

export interface ImageStreamHeroProps {
  /** Images shown as cards flowing through the corridor. */
  images: string[];
  /** Visible rail height in CSS px. Default: 420. */
  height?: number;
  /** Card width ratio (0–1 of rail width). Default: 0.18. */
  cardSize?: number;
  /** Seconds for a card to travel the rail. Default: 24. */
  speed?: number;
  /** Rail curve amplitude as a ratio of height. 0 is flat. Default: 0.1. */
  curve?: number;
  /** Centered title children drawn above the stream. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Mirrored image rails receding to a central vanishing point. Each image is
 * repeated across both rails on staggered animation delays, so the stream is
 * continuous. Cards use CSS transforms only (translate3d + scale), so the
 * browser can offload animation to the compositor.
 */
export function ImageStreamHero({
  images,
  height = 420,
  cardSize = 0.18,
  speed = 24,
  curve = 0.1,
  children,
  className,
}: ImageStreamHeroProps) {
  const safeImages = images.length > 0 ? images : [""];
  const slots = Math.max(6, safeImages.length * 2);
  const items = Array.from({ length: slots }, (_, i) => ({
    src: safeImages[i % safeImages.length]!,
    delay: -(i / slots) * speed,
  }));
  const style = {
    ["--rail-h"]: `${height}px`,
    ["--rail-card"]: `${cardSize * 100}%`,
    ["--rail-speed"]: `${speed}s`,
    ["--rail-curve"]: `${curve * 100}%`,
  } as React.CSSProperties;
  return (
    <div className={["hg-stream", className].filter(Boolean).join(" ")} style={style} aria-label="Image stream">
      <div className="hg-stream__rail hg-stream__rail--left" aria-hidden="true">
        {items.map((item, i) => (
          <Card key={`l-${i}`} src={item.src} delay={item.delay} side="left" />
        ))}
      </div>
      <div className="hg-stream__rail hg-stream__rail--right" aria-hidden="true">
        {items.map((item, i) => (
          <Card key={`r-${i}`} src={item.src} delay={item.delay + 0.5} side="right" />
        ))}
      </div>
      {children && <div className="hg-stream__content">{children}</div>}
    </div>
  );
}

function Card({ src, delay, side }: { src: string; delay: number; side: "left" | "right" }) {
  const className = `hg-stream__card hg-stream__card--${side}`;
  const style = { animationDelay: `${delay}s` } as React.CSSProperties;
  return (
    <div className={className} style={style}>
      {src ? (
        <img src={src} alt="" loading="lazy" />
      ) : (
        <div className="hg-stream__placeholder" />
      )}
    </div>
  );
}
