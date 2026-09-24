import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  grid?: boolean;
}

export function Container({
  className,
  grid = false,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-content px-gutter",
        grid && "grid grid-cols-12 gap-x-4 md:gap-x-6 lg:gap-x-8",
        className,
      )}
      {...props}
    />
  );
}
