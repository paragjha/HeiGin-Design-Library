import { landingConfig, type LinkItem } from "@/lib/landing-config";

/** Slim strip above the header. Not sticky, so it scrolls away and the header height never changes. */
export function AnnouncementBar({ content = landingConfig.announcement }: { content?: LinkItem | null }) {
  if (!content) return null;
  return (
    <div className="bg-foreground">
      <div className="container-site flex h-10 items-center justify-center">
        <a
          href={content.href}
          className="group inline-flex items-center gap-2 text-xs font-medium tracking-[0.02em] text-background/80 transition-colors hover:text-background focus-visible:text-background focus-visible:outline-none"
        >
          <span className="underline-offset-4 group-hover:underline group-focus-visible:underline">{content.label}</span>
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
          >
            →
          </span>
        </a>
      </div>
    </div>
  );
}
