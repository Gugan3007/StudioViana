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
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
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
