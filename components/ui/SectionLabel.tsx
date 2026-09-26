import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function SectionLabel({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "section-label font-body text-label font-medium uppercase tracking-label",
        className,
      )}
      {...props}
    />
  );
}
