import { cn } from "@/lib/landing-utils";

/**
 * Lightweight thinking indicator. Three dots that pulse in sequence while an
 * agent is reasoning or drafting. Respects prefers-reduced-motion (the
 * keyframes are motion-safe only; static dots otherwise).
 */
export function ThinkingOrbs({
  size = 6,
  className,
  label = "Thinking",
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  const dot = "rounded-full bg-current motion-safe:animate-[thinking-pulse_1.4s_ease-in-out_infinite]";
  return (
    <span className={cn("inline-flex items-center gap-1 text-info-ink", className)} aria-label={label} role="status">
      <style>{`@keyframes thinking-pulse { 0%, 80%, 100% { transform: scale(0.75); opacity: 0.35; } 40% { transform: scale(1); opacity: 1; } }`}</style>
      <span className={dot} style={{ width: size, height: size, animationDelay: "0ms" }} aria-hidden="true" />
      <span className={dot} style={{ width: size, height: size, animationDelay: "180ms" }} aria-hidden="true" />
      <span className={dot} style={{ width: size, height: size, animationDelay: "360ms" }} aria-hidden="true" />
    </span>
  );
}
