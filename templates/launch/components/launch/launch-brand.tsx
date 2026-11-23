import type * as React from "react";
import { HeiGinMark } from "@heigin/ui";
import { launchConfig } from "@/lib/launch-config";
import { cn } from "@/lib/launch-utils";

/** The brand mark: the HeiGin mark, or your logo once `brand.logoSrc` is set. */
export function BrandMark({ size = 22, tile = true, className, style }: { size?: number; tile?: boolean; className?: string; style?: React.CSSProperties }) {
  const { logoSrc } = launchConfig.brand;
  if (logoSrc) return <img src={logoSrc} alt="" aria-hidden="true" width={size} height={size} className={cn("rounded-md object-contain", className)} style={style} />;
  return <HeiGinMark size={size} tile={tile} className={className} style={style} />;
}
