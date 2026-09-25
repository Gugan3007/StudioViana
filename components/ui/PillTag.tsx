import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function PillTag({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full border border-gold/70 px-4 font-body text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold",
        className,
      )}
      {...props}
    />
  );
}
