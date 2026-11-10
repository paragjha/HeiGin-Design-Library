import { landingConfig } from "@/lib/landing-config";
import { cn, monogram } from "@/lib/landing-utils";

/** Square brand mark: your logo image when `brand.logoSrc` is set, a monogram tile otherwise. */
export function BrandMark({ className }: { className?: string }) {
  const { name, logoSrc } = landingConfig.brand;
  if (logoSrc) {
    return <img src={logoSrc} alt="" aria-hidden="true" className={cn("rounded-md object-contain", className ?? "size-7")} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center rounded-md bg-primary text-[0.62em] font-semibold text-primary-foreground",
        className ?? "size-7"
      )}
    >
      {monogram(name).slice(0, 1)}
    </span>
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[15.5px]", className)}>
      <BrandMark />
      <span className="font-semibold tracking-tight text-foreground">{landingConfig.brand.name}</span>
    </span>
  );
}
