import { cn } from "@/lib/utils";

export function PaperGrain({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "paper-grain pointer-events-none absolute inset-0 z-[1] opacity-[0.025]",
        className,
      )}
    />
  );
}
