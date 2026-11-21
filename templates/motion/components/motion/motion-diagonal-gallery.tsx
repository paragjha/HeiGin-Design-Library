"use client";

import * as React from "react";
import { motionConfig } from "@/lib/motion-config";
import { clamp01, cn, coverFor, EASE, EASE_IN_OUT, prefersReducedMotion } from "@/lib/motion-utils";

const STEP_VH = 110; // scroll distance per photo
const MOVE_MS = 900;
const THUMB = 0.22; // a waiting photo's size, as a share of the large one
const GAP = 0.06; // between the large photo and its neighbours, as a share of its width
const LEAVE_DRIFT = 0.5; // a leaving photo drifts half a thumbnail further out as it shrinks away
const COPY_OUT_MS = 250;
const COPY_IN_MS = 600;
const COPY_STAGGER_MS = 60;
const LINE_PARK = 110; // % a caption line travels out of its mask

/** Where a photo sits relative to the current one: 0 large in the middle, 1 waiting small at the bottom right,
 *  -1 small at the top left, further out shrunk to nothing beyond those spots. */
function pose(rel: number, w: number, h: number) {
  const sw = w * THUMB;
  const sh = h * THUMB;
  const nx = w / 2 + w * GAP + sw / 2;
  const ny = h / 2 - sh / 2;
  if (rel === 0) return { x: 0, y: 0, s: 1, z: 3 };
  if (rel === 1) return { x: nx, y: ny, s: THUMB, z: 2 };
  if (rel === -1) return { x: -nx, y: -ny, s: THUMB, z: 1 };
  if (rel > 1) return { x: nx, y: ny, s: 0, z: 0 };
  const drift = (sw + w * GAP) * LEAVE_DRIFT;
  return { x: -nx - drift, y: -ny - drift, s: 0, z: 0 };
}

/** A gallery that holds the screen while you scroll: each photo moves up from the bottom-right corner to take the centre,
 *  pushing the last one to the top left, while the caption and a big step number change with it. */
export function MotionDiagonalGallery({ className }: { className?: string }) {
  const { headline, photos } = motionConfig.diagonal;
  const n = photos.length;
  const places = Math.max(2, String(n).length);
  const root = React.useRef<HTMLElement>(null);
  const els = React.useRef<(HTMLElement | null)[]>([]);
  const lines = React.useRef<(HTMLSpanElement | null)[]>([]);
  const [index, setIndex] = React.useState(0);
  const [copy, setCopy] = React.useState(0);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const placed = React.useRef({ index: 0, until: 0 });
  const copyAnims = React.useRef<Animation[]>([]);

  React.useEffect(() => {
    const el = root.current;
    if (!el || n < 2) return;
    const measure = () => setSize({ w: els.current[0]?.offsetWidth ?? 0, h: els.current[0]?.offsetHeight ?? 0 });
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      setIndex(Math.min(n - 1, Math.floor((span > 0 ? clamp01(-r.top / span) : 0) * n)));
    };
    measure();
    onScroll();
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [n]);

  // Photos move with a transition; a step that lands mid-move carries on without a slow start.
  React.useEffect(() => {
    const now = performance.now();
    const moved = placed.current.index !== index;
    const animate = moved && !prefersReducedMotion();
    const ease = now < placed.current.until ? EASE : EASE_IN_OUT;
    if (moved) placed.current = { index, until: animate ? now + MOVE_MS : 0 };
    els.current.forEach((photo, i) => {
      if (!photo) return;
      const p = pose(i - index, size.w, size.h);
      photo.style.zIndex = String(p.z);
      photo.style.transition = animate ? `transform ${MOVE_MS}ms ${ease}` : "none";
      photo.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${p.s})`;
    });
  }, [index, size]);

  // The caption lines leave upward, the text swaps, then the new lines rise in.
  React.useEffect(() => {
    if (index === copy) return;
    const live = lines.current.filter(Boolean).map((line) => getComputedStyle(line!).transform); // read before cancelling, so a mid-rise line leaves from where it is
    copyAnims.current.forEach((a) => a.cancel());
    if (prefersReducedMotion()) {
      setCopy(index);
      return;
    }
    const outs = lines.current.filter(Boolean).map((line, k) =>
      line!.animate([{ transform: live[k] }, { transform: `translateY(-${LINE_PARK}%)` }], {
        duration: COPY_OUT_MS,
        easing: EASE_IN_OUT,
        fill: "forwards",
      }),
    );
    copyAnims.current = outs;
    void Promise.all(outs.map((a) => a.finished)).then(
      () => setCopy(index),
      () => {},
    );
  }, [index, copy]);

  React.useLayoutEffect(() => {
    if (prefersReducedMotion() || !copyAnims.current.length) return;
    copyAnims.current.forEach((a) => a.cancel());
    copyAnims.current = lines.current.filter(Boolean).map((line, k) =>
      line!.animate([{ transform: `translateY(${LINE_PARK}%)` }, { transform: "translateY(0)" }], {
        duration: COPY_IN_MS,
        delay: k * COPY_STAGGER_MS,
        easing: EASE,
        fill: "backwards",
      }),
    );
  }, [copy]);

  const current = photos[copy]!;
  const number = String(index + 1).padStart(places, "0");

  return (
    <section
      ref={root}
      className={cn("mo-dia bg-bg text-ink", className)}
      style={{ "--mo-n": n, "--mo-step": STEP_VH } as React.CSSProperties}
    >
      <div className="mo-dia-stage">
        <h2 className="mo-dia-headline m-0 font-medium tracking-[-0.035em]">
          <span className="block">{headline[0]}</span> <span className="block text-muted">{headline[1]}</span>
        </h2>
        {photos.map((photo, i) => (
          <figure
            key={i}
            ref={(node) => {
              els.current[i] = node;
            }}
            className="mo-dia-photo m-0 overflow-hidden rounded-xl"
            aria-hidden={i !== index}
          >
            {photo.src ? (
              <img src={photo.src} alt={photo.alt ?? ""} decoding="async" className="block size-full object-cover" />
            ) : (
              <div className="size-full" style={{ background: coverFor(i) }} />
            )}
          </figure>
        ))}
        <div className="mo-dia-copy" aria-live="polite">
          <p className="mo-dia-mask m-0 text-[clamp(18px,1.4vw,28px)] font-medium leading-[1.15]">
            <span
              ref={(node) => {
                lines.current[0] = node;
              }}
              className="block"
            >
              {current.title}
            </span>
          </p>
          <p className="mo-dia-mask m-0 mt-3 text-[15px] leading-[1.45] text-muted">
            <span
              ref={(node) => {
                lines.current[1] = node;
              }}
              className="block"
            >
              {current.text}
              {current.emphasis && (
                <>
                  {" "}
                  <b className="font-normal text-ink">{current.emphasis}</b>
                </>
              )}
            </span>
          </p>
        </div>
        <p className="mo-dia-count m-0 flex items-baseline gap-2.5" aria-hidden="true">
          <span className="mo-dia-number inline-flex font-medium tracking-[-0.04em]">
            {number.split("").map((d, p) => (
              <span key={p} className="inline-block h-[1em] overflow-clip">
                <span
                  className="block"
                  style={{ transform: `translateY(${-Number(d) * 10}%)`, transition: `transform ${MOVE_MS}ms ${EASE_IN_OUT}` }}
                >
                  {Array.from({ length: 10 }, (_, g) => (
                    <span key={g} className="block h-[1em]">
                      {g}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </span>
          <span className="text-sm text-muted">/ {String(n).padStart(places, "0")}</span>
        </p>
      </div>
    </section>
  );
}
