import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function SectionLabel({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "font-body text-label font-medium uppercase tracking-label text-gold",
        className,
      )}
      {...props}
    />
  );
}
