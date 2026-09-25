import { cn } from "@/lib/utils";

const steps = ["Piece", "Flowers", "Palette", "Details", "Review"] as const;

interface StepProgressProps {
  current: number;
  onStep: (step: number) => void;
}

export function StepProgress({ current, onStep }: StepProgressProps) {
  return (
    <div aria-label={`Step ${current} of 5`} className="mb-9">
      <div className="h-px overflow-hidden bg-gold/25">
        <span
          className="block h-full origin-left bg-gold transition-transform duration-700"
          style={{ transform: `scaleX(${current / steps.length})` }}
        />
      </div>
      <ol className="mt-4 grid grid-cols-5 gap-1">
        {steps.map((label, index) => {
          const number = index + 1;
          const completed = number < current;
          return (
            <li key={label}>
              <button
                aria-current={number === current ? "step" : undefined}
                className={cn(
                  "min-h-11 text-left text-[0.5rem] uppercase leading-4 tracking-[0.12em] sm:text-[0.56rem]",
                  number === current
                    ? "text-[#765b34]"
                    : completed
                      ? "text-charcoal"
                      : "text-muted/65",
                )}
                disabled={number > current}
                onClick={() => onStep(number)}
                type="button"
              >
                <span className="block font-display text-sm normal-case tracking-normal">
                  {completed ? "✓" : String(number).padStart(2, "0")}
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
