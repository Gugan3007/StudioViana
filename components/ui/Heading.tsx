import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type HeadingSize = "display" | "h1" | "h2" | "h3";

interface HeadingProps extends Omit<
  HTMLAttributes<HTMLHeadingElement>,
  "children"
> {
  as?: "h1" | "h2" | "h3";
  children: string;
  italic?: string;
  light?: boolean;
  size?: HeadingSize;
}

const sizeClasses: Record<HeadingSize, string> = {
  display: "text-[length:clamp(3rem,7vw,6.5rem)] leading-[0.98]",
  h1: "text-[length:clamp(2.5rem,5vw,4.5rem)] leading-[1.05]",
  h2: "text-[length:clamp(2rem,3.5vw,3.25rem)] leading-[1.12]",
  h3: "text-[length:clamp(1.4rem,2vw,1.9rem)] leading-[1.2]",
};

export function Heading({
  as: Tag = "h2",
  children,
  className,
  italic,
  light = false,
  size = "h2",
  ...props
}: HeadingProps) {
  const italicIndex = italic ? children.indexOf(italic) : -1;

  return (
    <Tag
      className={cn(
        "font-display font-medium tracking-[-0.025em]",
        sizeClasses[size],
        light ? "text-cream" : "text-charcoal",
        className,
      )}
      {...props}
    >
      {italic && italicIndex >= 0 ? (
        <>
          {children.slice(0, italicIndex)}
          <span className="italic">{italic}</span>
          {children.slice(italicIndex + italic.length)}
        </>
      ) : (
        children
      )}
    </Tag>
  );
}
