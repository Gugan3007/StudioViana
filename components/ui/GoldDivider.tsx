import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface GoldDividerProps extends HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

export function GoldDivider({
  animate,
  className,
  ...props
}: GoldDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("h-0.5 w-14 origin-left bg-gold", className)}
      data-animate={animate || undefined}
      {...props}
    />
  );
}
