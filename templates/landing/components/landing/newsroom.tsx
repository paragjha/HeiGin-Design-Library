import type { ComponentType } from "react";
import { ArrowRight } from "lucide-react";
import { landingConfig, type LandingConfig, type PostThumb } from "@/lib/landing-config";
import { Backdrop } from "./backdrop";
import { InlineEyebrow } from "./inline-eyebrow";
import { Section } from "./section";
import { ThumbApproval } from "./scenes/thumb-approval";
import { ThumbProposal } from "./scenes/thumb-proposal";
import { ThumbQueue } from "./scenes/thumb-queue";

const thumbs: Record<PostThumb, ComponentType<{ tone?: "light" | "dark" }>> = {
  proposal: ThumbProposal,
  queue: ThumbQueue,
  approval: ThumbApproval,
};

/** Three recent posts. A post with a `thumb` shows a coded, animated scene instead of an image. */
export function Newsroom({ content = landingConfig.newsroom }: { content?: LandingConfig["newsroom"] }) {
  return (
    <Section tone="tint">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <InlineEyebrow>{content.eyebrow}</InlineEyebrow>
          <h2 className="mt-3 text-balance text-headline text-foreground">{content.title}</h2>
        </div>
        {content.link && (
          <a
            href={content.link.href}
            className="inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {content.link.label} <ArrowRight size={14} aria-hidden="true" />
          </a>
        )}
      </div>
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {content.posts.map((post) => {
          const Thumb = post.thumb ? thumbs[post.thumb] : null;
          return (
            <li key={post.href}>
              <a
                href={post.href}
                className="group block overflow-hidden rounded-[1.5rem] border border-border transition-transform hover:-translate-y-0.5"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Backdrop />
                  {Thumb ? (
                    <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                      <Thumb tone="dark" />
                    </div>
                  ) : (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-b from-foreground/10 via-foreground/40 to-foreground/70"
                    />
                  )}
                  <div className="pointer-events-none absolute inset-x-0 top-0 flex p-5">
                    <span className="inline-flex w-fit items-center rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                      {post.tag}
                    </span>
                  </div>
                  {!Thumb && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
                      <h3 className="text-lg font-semibold leading-snug text-background">{post.title}</h3>
                    </div>
                  )}
                </div>
                <div className="bg-surface p-5">
                  {Thumb && <h3 className="mb-2 text-lg font-semibold leading-snug text-foreground">{post.title}</h3>}
                  <p className="text-sm leading-relaxed text-muted-foreground">{post.summary}</p>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-faint">{post.meta}</p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
