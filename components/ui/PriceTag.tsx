import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function PriceTag({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex min-h-12 items-center border border-gold/70 px-5 font-display text-xl text-charcoal",
        className,
      )}
      {...props}
    />
  );
}
