import { HeiGinMark } from "@heigin/ui";
import { heroesConfig } from "@/lib/heroes-config";
import { cn } from "@/lib/heroes-utils";

/** The brand mark: the HeiGin mark, or your logo once `brand.logoSrc` is set. */
export function BrandMark({ size = 22, className }: { size?: number; className?: string }) {
  const { logoSrc } = heroesConfig.brand;
  if (logoSrc) return <img src={logoSrc} alt="" aria-hidden="true" width={size} height={size} className={cn("rounded-md object-contain", className)} />;
  return <HeiGinMark size={size} className={className} />;
}

/** Mark plus name, linked home. */
export function Brand({ className, size }: { className?: string; size?: number }) {
  return (
    <a href={heroesConfig.brand.href} className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <BrandMark size={size} />
      <span>{heroesConfig.brand.name}</span>
    </a>
  );
}
