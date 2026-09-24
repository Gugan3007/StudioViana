import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

export function MandalaMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={cn("shrink-0", className)}
      fill="none"
      viewBox="0 0 48 48"
      {...props}
    >
      <g stroke="currentColor" strokeWidth="1.15">
        <path d="M24 3c4.2 5.3 6.3 9.4 6.3 12.2S28.2 20 24 21c-4.2-1-6.3-3-6.3-5.8S19.8 8.3 24 3Z" />
        <path d="M24 45c-4.2-5.3-6.3-9.4-6.3-12.2S19.8 28 24 27c4.2 1 6.3 3 6.3 5.8S28.2 39.7 24 45Z" />
        <path d="M3 24c5.3-4.2 9.4-6.3 12.2-6.3S20 19.8 21 24c-1 4.2-3 6.3-5.8 6.3S8.3 28.2 3 24Z" />
        <path d="M45 24c-5.3 4.2-9.4 6.3-12.2 6.3S28 28.2 27 24c1-4.2 3-6.3 5.8-6.3S39.7 19.8 45 24Z" />
        <path d="M9.2 9.2c6.7.8 11.1 2.2 13.1 4.2s2 5-.3 8.6c-3.6 2.3-6.6 2.3-8.6.3s-3.4-6.4-4.2-13.1Z" />
        <path d="M38.8 38.8c-6.7-.8-11.1-2.2-13.1-4.2s-2-5 .3-8.6c3.6-2.3 6.6-2.3 8.6-.3s3.4 6.4 4.2 13.1Z" />
        <path d="M38.8 9.2c-.8 6.7-2.2 11.1-4.2 13.1s-5 2-8.6-.3c-2.3-3.6-2.3-6.6-.3-8.6s6.4-3.4 13.1-4.2Z" />
        <path d="M9.2 38.8c.8-6.7 2.2-11.1 4.2-13.1s5-2 8.6.3c2.3 3.6 2.3 6.6.3 8.6s-6.4 3.4-13.1 4.2Z" />
        <circle cx="24" cy="24" r="5.5" />
        <circle cx="24" cy="24" r="2" />
      </g>
    </svg>
  );
}
