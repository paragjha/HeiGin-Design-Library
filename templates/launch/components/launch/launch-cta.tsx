import * as React from "react";
import { Avatar } from "@heigin/ui";
import { launchConfig } from "@/lib/launch-config";
import { cn, seeded } from "@/lib/launch-utils";

// Pixel sprites, one string per row: X is a filled pixel.
const HEART = [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."];
const BUBBLE = ["XXXXXXXXX", "XXXXXXXXX", "XX.X.X.XX", "XXXXXXXXX", "XXXXXXXXX", ".XX......", ".X......."];

function Sprite({ rows }: { rows: string[] }) {
  const d = rows.flatMap((row, y) => Array.from(row).flatMap((ch, x) => (ch === "X" ? [`M${x} ${y}h1v1h-1z`] : []))).join("");
  return (
    <svg viewBox={`0 0 ${rows[0]!.length} ${rows.length}`} shapeRendering="crispEdges" className="block size-full">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

// Decoration is seeded, so it sits in the same place on the server and in the browser.
const rand = seeded(7);
const STARS = Array.from({ length: 150 }, (_, i) => {
  const band = i < 96; // the dense band of pixels along the top edge
  return {
    left: rand() * 100,
    top: band ? rand() * rand() * 7 : 7 + rand() * 45,
    size: rand() < 0.25 ? 3 : 2,
    delay: -rand() * 6,
    duration: 2.4 + rand() * 4,
    twinkle: !band || rand() < 0.4,
  };
});
const SPRITES = Array.from({ length: 22 }, (_, i) => {
  const side = i % 2 ? 1 : -1; // keep the middle clear for the copy
  const offset = 16 + rand() * 33;
  return {
    heart: rand() < 0.55,
    inner: offset < 30, // these would cross the copy on a phone
    left: 50 + side * offset,
    bottom: 6 + rand() * 30,
    size: 18 + Math.round(rand() * 14),
    opacity: 0.45 + rand() * 0.45,
    rise: 120 + rand() * 160,
    duration: 7 + rand() * 6,
    delay: -rand() * 13,
  };
});

/**
 * A closing call to action on a deep blue field: a headline in a tall serif, two buttons and a row
 * of customer avatars, over a photo strip toned to the blue that pixel hearts and messages float
 * up from. Stars twinkle along the top. With reduced motion the hearts and stars hold still.
 */
export function LaunchCta({ className }: { className?: string }) {
  const c = launchConfig.cta;
  return (
    <section className={cn("lc relative isolate overflow-hidden", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {STARS.map((s, i) => (
          <span
            key={i}
            className={cn("lc-star absolute block bg-white", s.twinkle && "lc-twinkle")}
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
          />
        ))}
      </div>

      <div aria-hidden="true" className="lc-photo pointer-events-none absolute inset-x-0 bottom-0 h-[48%]">
        {c.image ? <img src={c.image} alt={c.imageAlt} className="size-full object-cover object-[50%_58%]" draggable={false} /> : <div className="lc-photo-empty size-full" />}
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {SPRITES.map((s, i) => (
          <span
            key={i}
            className={cn("lc-sprite absolute block text-[#9db0ff]", s.inner && "max-md:hidden")}
            style={
              {
                left: `${s.left}%`,
                bottom: `${s.bottom}%`,
                width: s.size,
                height: s.heart ? s.size * (6 / 7) : s.size * (7 / 9),
                "--lc-o": s.opacity,
                "--lc-rise": `${-s.rise}px`,
                animationDuration: `${s.duration}s`,
                animationDelay: `${s.delay}s`,
              } as React.CSSProperties
            }
          >
            <Sprite rows={s.heart ? HEART : BUBBLE} />
          </span>
        ))}
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 pb-[clamp(230px,36vh,360px)] pt-[clamp(96px,17vh,190px)] text-center">
        <h2 className="lc-title m-0 max-w-[17ch] text-[clamp(46px,7vw,86px)] font-normal leading-[0.94] tracking-[-0.01em]">{c.title}</h2>
        <p className="m-0 mt-7 max-w-[340px] text-[15px] leading-[1.5] text-white/80">{c.subtitle}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          <a href={c.primary.href} className="lc-btn lc-btn-light">
            {c.primary.label}
          </a>
          <a href={c.secondary.href} className="lc-btn lc-btn-dark">
            {c.secondary.label}
          </a>
        </div>
        <div className="lc-faces mt-12 flex" aria-hidden="true">
          {c.people.map((name) => (
            <span key={name} className="lc-face rounded-full ring-2 ring-white/90">
              <Avatar name={name} size="md" tinted decorative />
            </span>
          ))}
        </div>
        <p className="m-0 mt-3 max-w-[260px] text-[13px] leading-[1.45] text-white/75">{c.proof}</p>
      </div>
    </section>
  );
}
