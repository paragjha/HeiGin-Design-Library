"use client";

import * as React from "react";
import { launchConfig } from "@/lib/launch-config";
import { cn } from "@/lib/launch-utils";

const c = () => launchConfig.careers;
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => Array.from(w)[0])
    .slice(0, 2)
    .join("");

/**
 * A dark careers page: a People intro, values that stack as you scroll (each sticks while the next
 * slides over it), the crew as a grouped list beside a portrait grid where hovering a name lights
 * that person's photo and dims the rest, then the open roles and a contact band.
 */
export function LaunchCareers({ className }: { className?: string }) {
  const cfg = c();
  const openCount = cfg.roles.filter((r) => r.open).length;
  return (
    <div className={cn("lj min-h-svh", className)}>
      <header className="lj-head-bar sticky top-0 z-20">
        <div className="mx-auto flex h-11 max-w-[1440px] items-center justify-between gap-4 px-4 md:px-6">
          <a href={launchConfig.brand.href} className="lj-white text-[17px] font-bold tracking-[-0.04em]">
            {launchConfig.brand.name}.
          </a>
          <nav aria-label="Main" className="hidden md:block">
            <ul className="m-0 flex list-none gap-5 p-0 text-[13px] font-medium">
              {cfg.nav.map((l) => (
                <li key={l.href}>
                  <a href={l.href} aria-current={l.current ? "page" : undefined} className="lj-nav">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-5 text-[13px] font-medium">
            <a href="#open-roles" className="lj-nav hidden items-center gap-1.5 sm:inline-flex">
              <span aria-hidden="true" className="lj-dot" />
              {cfg.hiringLabel}
              <sup className="lj-dim text-[9px]">({openCount})</sup>
            </a>
            <a href={cfg.contactLink.href} className="lj-white">
              {cfg.contactLink.label}
            </a>
          </div>
        </div>
      </header>

      {cfg.banner && <PixelBanner image={cfg.banner.image} />}
      <Intro />
      {cfg.values.items.length > 0 && <Values />}
      {cfg.crew.groups.length > 0 && <Crew />}
      <OpenRoles />
      {cfg.contact && <Contact />}
    </div>
  );
}

// Each pixel is a 5px square on a 6px pitch; a cell re-rolls its brightness this often per frame.
const SQUARE = 5;
const PITCH = 6;
const FLICKER = 0.05;
const FPS = 24;

/**
 * The banner: the image sampled down to one colour per cell and drawn as a grid of squares that
 * flicker. Each frame writes the cells into a tiny canvas, scales it up without smoothing, then
 * cuts the gaps with a pre-drawn square mask, so even 40k cells cost two drawImage calls.
 */
function PixelBanner({ image }: { image?: string }) {
  const box = React.useRef<HTMLDivElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const host = box.current;
    const out = canvas.current;
    const ctx = out?.getContext("2d");
    if (!host || !out || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = document.createElement("canvas");
    const sctx = small.getContext("2d")!;
    const mask = document.createElement("canvas");
    let cols = 0;
    let rows = 0;
    let base = new Uint8ClampedArray(0); // r, g, b per cell, from the image
    let level = new Float32Array(0); // each cell's current brightness, 0–1
    let frame: ImageData | null = null;
    let photo: HTMLImageElement | null = null;
    let raf = 0;
    let last = 0;
    let visible = true;

    const sample = () => {
      base = new Uint8ClampedArray(cols * rows * 3);
      if (photo) {
        const s = document.createElement("canvas");
        s.width = cols;
        s.height = rows;
        const c2 = s.getContext("2d", { willReadFrequently: true })!;
        // cover: fill the grid, crop the overflow evenly
        const k = Math.max(cols / photo.naturalWidth, rows / photo.naturalHeight);
        const w = photo.naturalWidth * k;
        const h = photo.naturalHeight * k;
        c2.drawImage(photo, (cols - w) / 2, (rows - h) / 2, w, h);
        const px = c2.getImageData(0, 0, cols, rows).data;
        for (let i = 0; i < cols * rows; i++) for (let ch = 0; ch < 3; ch++) base[i * 3 + ch] = px[i * 4 + ch]! * 1.6; // lifted, because the squares sit on black
      } else base.fill(196);
    };

    const layout = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const { width, height } = host.getBoundingClientRect();
      cols = Math.ceil(width / PITCH);
      rows = Math.ceil(height / PITCH);
      out.width = Math.round(width * dpr);
      out.height = Math.round(height * dpr);
      small.width = cols;
      small.height = rows;
      frame = sctx.createImageData(cols, rows);
      level = new Float32Array(cols * rows).map(() => (still ? 0.9 : 0.45 + Math.random() * 0.55));
      mask.width = out.width;
      mask.height = out.height;
      const m = mask.getContext("2d")!;
      m.scale(dpr, dpr);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) m.fillRect(x * PITCH, y * PITCH, SQUARE, SQUARE);
      sample();
      draw();
    };

    const draw = () => {
      if (!frame) return;
      const d = frame.data;
      for (let i = 0; i < cols * rows; i++) {
        if (!still && Math.random() < FLICKER) level[i] = 0.45 + Math.random() * 0.55;
        d[i * 4] = base[i * 3]!;
        d[i * 4 + 1] = base[i * 3 + 1]!;
        d[i * 4 + 2] = base[i * 3 + 2]!;
        d[i * 4 + 3] = level[i]! * 255;
      }
      sctx.putImageData(frame, 0, 0);
      const dpr = out.width / host.getBoundingClientRect().width;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, out.width, out.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0, cols * PITCH * dpr, rows * PITCH * dpr);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(mask, 0, 0);
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (now - last >= 1000 / FPS) {
        last = now;
        draw();
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!still && !raf) raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(layout);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (visible) start();
    });
    io.observe(host);
    const onVisibility = () => !document.hidden && start();
    document.addEventListener("visibilitychange", onVisibility);
    if (image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        photo = img;
        sample();
        draw();
      };
      img.src = image;
    }
    layout();
    start();
    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(raf);
    };
  }, [image]);

  return (
    <div ref={box} aria-hidden="true" className="lj-banner relative h-[62svh] min-h-[360px] w-full overflow-hidden lg:h-[calc(100svh-44px)]">
      <canvas ref={canvas} className="absolute inset-0 size-full" />
    </div>
  );
}

function Intro() {
  const { intro } = c();
  return (
    <section aria-labelledby="lj-people" className="mx-auto grid max-w-[1440px] gap-6 px-4 pb-[clamp(72px,14vh,160px)] pt-[clamp(72px,16vh,180px)] md:px-6 lg:grid-cols-12 lg:gap-2">
      <h1 id="lj-people" className="lj-title m-0 text-[clamp(56px,6.2vw,92px)] font-semibold leading-[0.9] tracking-[-0.045em] lg:col-span-4">
        {intro.title}
      </h1>
      {intro.paragraphs.map((p) => (
        <p key={p.slice(0, 24)} className="lj-white m-0 text-[clamp(20px,1.9vw,28px)] font-medium leading-[1.12] tracking-[-0.025em] lg:col-span-4">
          {p}
        </p>
      ))}
    </section>
  );
}

function Values() {
  const { values } = c();
  return (
    <section aria-labelledby="lj-values" className="mx-auto max-w-[1440px] px-4 md:px-6">
      <h2 id="lj-values" className="lj-dim lj-rule m-0 pb-2 text-[18px] font-medium tracking-[-0.02em]">
        {values.eyebrow}
      </h2>
      {values.items.map((v, i) => (
        <article key={v.title} className="lj-value lj-rule grid gap-4 py-2 lg:sticky lg:top-11 lg:grid-cols-12 lg:gap-2" style={{ zIndex: i + 1 }}>
          <h3 className="lj-title m-0 text-[clamp(40px,4.6vw,68px)] font-semibold leading-[0.95] tracking-[-0.04em] lg:col-span-4">{v.title}</h3>
          <div className="lj-photo aspect-square w-full overflow-hidden lg:col-span-4">
            {v.image ? <img src={v.image} alt="" className="size-full object-cover" draggable={false} /> : <div className="lj-photo-empty size-full" />}
          </div>
          <p className="lj-white m-0 max-w-[460px] pb-6 text-[16px] font-medium leading-[1.3] tracking-[-0.01em] lg:col-span-4">{v.body}</p>
        </article>
      ))}
    </section>
  );
}

function Crew() {
  const { crew } = c();
  const people = crew.groups.flatMap((g) => g.people);
  const [active, setActive] = React.useState<string | null>(null);
  return (
    <section aria-labelledby="lj-crew" className="mx-auto max-w-[1440px] px-4 pt-[clamp(72px,12vh,140px)] md:px-6">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-2" onMouseLeave={() => setActive(null)}>
        <div className="lg:col-span-4 lg:sticky lg:top-14 lg:self-start">
          <p aria-hidden="true" className="lj-dim m-0 hidden text-[18px] font-medium lg:block">
            {crew.listLabel}
          </p>
          {crew.groups.map((g) => (
            <div key={g.name} className="mt-6 first:mt-2">
              <h3 className="lj-dim lj-rule m-0 pb-1 text-[18px] font-medium tracking-[-0.02em]">{g.name}</h3>
              <ul className="m-0 list-none p-0">
                {g.people.map((p) => (
                  <li
                    key={p.name}
                    data-active={active === p.name || undefined}
                    onMouseEnter={() => setActive(p.name)}
                    onFocus={() => setActive(p.name)}
                    onBlur={() => setActive(null)}
                    className="lj-person lj-rule relative grid grid-cols-[1fr_1fr_auto] items-baseline gap-2 py-[3px] text-[13px] font-medium"
                  >
                    <span aria-hidden="true" className="lj-hatch pointer-events-none absolute inset-0" />
                    <span className="relative">{p.name}</span>
                    <span className="lj-role relative">{p.role}</span>
                    <span className="relative whitespace-nowrap text-right">
                      {p.links.map((l, i) => (
                        <React.Fragment key={l.label}>
                          {i > 0 && ", "}
                          <a href={l.href} className="lj-link" aria-label={`${p.name} on ${l.label}`}>
                            {l.label}
                          </a>
                        </React.Fragment>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-lg:order-first lg:col-span-8">
          <div className="flex items-end justify-between gap-4">
            <h2 id="lj-crew" className="lj-title m-0 text-[clamp(44px,4.6vw,68px)] font-semibold leading-[0.95] tracking-[-0.04em]">
              {crew.title}
            </h2>
            <p className="lj-dim m-0 text-[clamp(44px,4.6vw,68px)] font-semibold leading-[0.95] tracking-[-0.04em]">
              <span className="sr-only">{people.length} people</span>
              <span aria-hidden="true">{people.length}</span>
            </p>
          </div>
          {/* the portraits repeat the list above for sighted readers, so assistive tech skips them */}
          <div aria-hidden="true" className="lj-grid mt-3 grid grid-cols-3 gap-px sm:grid-cols-4 lg:grid-cols-5" data-dimmed={active ? true : undefined}>
            {people.map((p) => (
              <div key={p.name} className="lj-portrait relative aspect-[7/8] overflow-hidden" data-active={active === p.name || undefined} onMouseEnter={() => setActive(p.name)}>
                {p.photo ? (
                  <img src={p.photo} alt="" className="size-full object-cover" draggable={false} />
                ) : (
                  <span className="lj-initials grid size-full place-items-center text-[clamp(22px,2.4vw,34px)] font-semibold tracking-[-0.04em]">{initials(p.name)}</span>
                )}
              </div>
            ))}
            <a href="#open-roles" tabIndex={-1} className="lj-join relative flex aspect-[7/8] items-end justify-end p-3 text-[13px] font-medium">
              <span aria-hidden="true" className="lj-hatch lj-hatch-on pointer-events-none absolute inset-0" />
              <span className="relative">
                {crew.joinLabel} <span aria-hidden="true">→</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function OpenRoles() {
  const cfg = c();
  const roles = cfg.showClosed ? cfg.roles : cfg.roles.filter((r) => r.open);
  const cells = (r: (typeof roles)[number]) => (
    <>
      <span className="col-span-4 text-[19px] font-semibold leading-[1.15] tracking-[-0.03em] lg:col-span-3 lg:text-[24px] lg:leading-[24px]">{r.title}</span>
      <span className="col-span-2 text-[13px] lg:text-[16px]">{r.team}</span>
      <span className="col-span-2 flex items-center justify-end gap-4 whitespace-nowrap text-[13px] lg:col-span-3 lg:justify-between lg:text-[16px]">
        <span className="hidden lg:inline">{r.location}</span>
        <span className="whitespace-nowrap">
          {r.open ? (
            <>
              {cfg.applyLabel} <span aria-hidden="true">→</span>
            </>
          ) : (
            cfg.closedLabel
          )}
        </span>
      </span>
    </>
  );

  return (
    <section id="open-roles" aria-labelledby="lj-title" className="scroll-mt-12">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-[clamp(72px,12vh,128px)] md:px-6 lg:grid-cols-12 lg:gap-2">
        <h2 id="lj-title" className="lj-title m-0 whitespace-pre-line text-[clamp(52px,5.3vw,76px)] font-semibold leading-[0.9] tracking-[-0.04em] lg:col-span-4">
          {cfg.title}
        </h2>
        <div className="lg:col-span-8">
          <div aria-hidden="true" className="lj-head grid grid-cols-8 gap-2 pb-1 text-[16px] lg:text-[18px]">
            <span className="col-span-4 lg:col-span-3">{cfg.columns.role}</span>
            <span className="col-span-2">{cfg.columns.team}</span>
            <span className="hidden lg:col-span-3 lg:block">{cfg.columns.location}</span>
          </div>
          <ul className="m-0 list-none p-0">
            {roles.map((r) => (
              <li key={r.title} className="lj-line">
                {r.open && r.href ? (
                  <a href={r.href} aria-label={`${r.title}, ${r.team}, ${r.location}. ${cfg.applyLabel}`} className="lj-row lj-open group relative grid grid-cols-8 items-center gap-2 py-3 lg:py-2">
                    <span aria-hidden="true" className="lj-hatch pointer-events-none absolute inset-0 -top-px" />
                    {cells(r)}
                  </a>
                ) : (
                  <div className="lj-row lj-closed relative grid grid-cols-8 items-center gap-2 py-3 lg:py-2">{cells(r)}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const contact = c().contact!;
  return (
    <section id="contact" aria-labelledby="lj-contact" className="mx-auto max-w-[1440px] scroll-mt-12 px-4 pb-[clamp(72px,12vh,128px)] md:px-6">
      <div className="lj-contact relative lg:ml-[calc(100%/6)]">
        <span aria-hidden="true" className="lj-hatch lj-hatch-on pointer-events-none absolute inset-0" />
        <div className="relative px-1 py-6 lg:py-8">
          <h2 id="lj-contact" className="lj-dim m-0 text-[20px] font-semibold tracking-[-0.03em] lg:text-[24px]">
            {contact.eyebrow}
          </h2>
          <p className="lj-title m-0 mt-2 text-[clamp(36px,5.3vw,76px)] font-semibold leading-[0.95] tracking-[-0.04em]">{contact.title}</p>
          <a href={`mailto:${contact.email}`} className="lj-mail lj-title mt-1 inline-block break-all text-[clamp(36px,5.3vw,76px)] font-semibold leading-[0.95] tracking-[-0.04em]">
            {contact.email}
          </a>
        </div>
      </div>
    </section>
  );
}
