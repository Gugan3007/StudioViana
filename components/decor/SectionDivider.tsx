import { cn } from "@/lib/utils";

interface SectionDividerProps {
  className?: string;
  from?: "cream" | "forest";
  to?: "cream" | "forest";
}

const tones = {
  cream: "var(--color-cream, #f6f0e5)",
  forest: "var(--color-forest, #173628)",
} as const;

export function SectionDivider({
  className,
  from = "forest",
  to = "cream",
}: SectionDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("h-24 w-full", className)}
      style={{
        background: `linear-gradient(to bottom, ${tones[from]}, ${tones[to]})`,
      }}
    />
  );
}
