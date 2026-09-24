import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type SectionTone = "light" | "soft" | "dark";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
}

const toneClasses: Record<SectionTone, string> = {
  light: "bg-cream text-charcoal",
  soft: "bg-cream-soft text-charcoal",
  dark: "bg-forest text-cream [background-image:radial-gradient(circle_at_72%_20%,rgba(214,185,138,0.08),transparent_34%)]",
};

export function Section({ className, tone = "light", ...props }: SectionProps) {
  return (
    <section
      className={cn("py-section", toneClasses[tone], className)}
      {...props}
    />
  );
}
