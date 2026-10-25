import * as React from "react";

export interface IntegrationBeamIcon {
  id: string;
  label: string;
  node: React.ReactNode;
}

export interface IntegrationBeamProps {
  /** Icon on the left. */
  from: IntegrationBeamIcon;
  /** Icon(s) on the right. Each gets its own beam. */
  to: IntegrationBeamIcon[];
  /** Beam cycle time in seconds. Default: 2.8. */
  duration?: number;
  /** Beam colour (gradient end). Default: HeiGin brand. */
  color?: string;
  className?: string;
}

/**
 * Horizontal connector showing data flowing from a source icon to one or more
 * target icons. The beam is a thin gradient stroke that cycles smoothly along
 * each path. Pure SVG + CSS, no runtime deps.
 */
export function IntegrationBeam({
  from,
  to,
  duration = 2.8,
  color = "var(--hg-color-brand, #6366f1)",
  className,
}: IntegrationBeamProps) {
  const h = Math.max(1, to.length);
  const containerH = h * 72 + 24;
  const sourceY = containerH / 2;
  const w = 480;
  const sourceX = 40;
  const targetX = w - 40;
  return (
    <div className={["hg-ibeam", className].filter(Boolean).join(" ")}>
      <svg viewBox={`0 0 ${w} ${containerH}`} role="img" aria-label={`Connections from ${from.label}`}>
        <defs>
          <linearGradient id="hg-ibeam-g" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="45%" stopColor={color} stopOpacity="1" />
            <stop offset="55%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {to.map((t, i) => {
          const ty = ((i + 0.5) / h) * containerH;
          const dx = (targetX - sourceX) / 2;
          const d = `M ${sourceX} ${sourceY} C ${sourceX + dx} ${sourceY}, ${targetX - dx} ${ty}, ${targetX} ${ty}`;
          return (
            <g key={t.id}>
              <path d={d} className="hg-ibeam__track" />
              <path
                d={d}
                className="hg-ibeam__flow"
                style={{ animationDuration: `${duration}s`, stroke: "url(#hg-ibeam-g)" }}
              />
            </g>
          );
        })}
      </svg>
      <div className="hg-ibeam__chips">
        <div className="hg-ibeam__chip" aria-label={from.label} title={from.label}>
          {from.node}
        </div>
        <div className="hg-ibeam__targets">
          {to.map((t) => (
            <div className="hg-ibeam__chip" key={t.id} aria-label={t.label} title={t.label}>
              {t.node}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
