import { launchConfig } from "@/lib/launch-config";
import { cn } from "@/lib/launch-utils";

/**
 * A dark open-roles list. Open roles are bright and link to their posting with an apply label;
 * closed roles stay in the list, dimmed, or drop out with `showClosed: false`. Under the pointer
 * (or keyboard focus) a fine diagonal hatch fades in behind the row. A contact band can follow.
 */
export function LaunchCareers({ className }: { className?: string }) {
  const c = launchConfig.careers;
  const roles = c.showClosed ? c.roles : c.roles.filter((r) => r.open);
  const cells = (r: (typeof roles)[number]) => (
    <>
      <span className="col-span-4 text-[19px] font-semibold leading-[1.15] tracking-[-0.03em] lg:col-span-3 lg:text-[24px] lg:leading-[24px]">{r.title}</span>
      <span className="col-span-2 text-[13px] lg:text-[16px]">{r.team}</span>
      <span className="col-span-2 flex items-center justify-end gap-4 whitespace-nowrap text-[13px] lg:col-span-3 lg:justify-between lg:text-[16px]">
        <span className="hidden lg:inline">{r.location}</span>
        <span className="whitespace-nowrap">
          {r.open ? (
            <>
              {c.applyLabel} <span aria-hidden="true">→</span>
            </>
          ) : (
            c.closedLabel
          )}
        </span>
      </span>
    </>
  );

  return (
    <section className={cn("lj", className)} aria-labelledby="lj-title">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-[clamp(72px,12vh,128px)] md:px-6 lg:grid-cols-12 lg:gap-2">
        <h2 id="lj-title" className="lj-title m-0 whitespace-pre-line text-[clamp(52px,5.3vw,76px)] font-semibold leading-[0.9] tracking-[-0.04em] lg:col-span-4">
          {c.title}
        </h2>
        <div className="lg:col-span-8">
          <div aria-hidden="true" className="lj-head grid grid-cols-8 gap-2 pb-1 text-[16px] lg:text-[18px]">
            <span className="col-span-4 lg:col-span-3">{c.columns.role}</span>
            <span className="col-span-2">{c.columns.team}</span>
            <span className="hidden lg:col-span-3 lg:block">{c.columns.location}</span>
          </div>
          <ul className="m-0 list-none p-0">
            {roles.map((r) => (
              <li key={r.title} className="lj-line">
                {r.open && r.href ? (
                  <a href={r.href} aria-label={`${r.title}, ${r.team}, ${r.location}. ${c.applyLabel}`} className="lj-row lj-open group relative grid grid-cols-8 items-center gap-2 py-3 lg:py-2">
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

      {c.contact && (
        <div className="mx-auto max-w-[1440px] px-4 pb-[clamp(72px,12vh,128px)] md:px-6">
          <div className="lj-contact relative lg:ml-[calc(100%/6)]">
            <span aria-hidden="true" className="lj-hatch lj-hatch-on pointer-events-none absolute inset-0" />
            <div className="relative px-1 py-6 lg:py-8">
              <p className="lj-dim m-0 text-[20px] font-semibold tracking-[-0.03em] lg:text-[24px]">{c.contact.eyebrow}</p>
              <p className="lj-title m-0 mt-2 text-[clamp(36px,5.3vw,76px)] font-semibold leading-[0.95] tracking-[-0.04em]">{c.contact.title}</p>
              <a href={`mailto:${c.contact.email}`} className="lj-mail lj-title mt-1 inline-block break-all text-[clamp(36px,5.3vw,76px)] font-semibold leading-[0.95] tracking-[-0.04em]">
                {c.contact.email}
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
