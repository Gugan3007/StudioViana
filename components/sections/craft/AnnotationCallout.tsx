import { cn } from "@/lib/utils";

interface AnnotationCalloutProps {
  className?: string;
  description: string;
  index: number;
  label: string;
  path: string;
  viewBox?: string;
}

export function AnnotationCallout({
  className,
  description,
  index,
  label,
  path,
  viewBox = "0 0 180 70",
}: AnnotationCalloutProps) {
  return (
    <li
      className={cn(
        "grid grid-cols-[2rem_1fr] gap-3 md:absolute md:block md:w-52",
        className,
      )}
      data-annotation-callout
    >
      <span className="font-display text-xl italic text-gold md:hidden">
        {String(index).padStart(2, "0")}
      </span>
      <span>
        <svg
          aria-hidden="true"
          className="absolute hidden overflow-visible text-gold md:block"
          fill="none"
          viewBox={viewBox}
        >
          <path
            d={path}
            data-callout-line
            pathLength="1"
            stroke="currentColor"
            strokeDasharray="1"
            strokeDashoffset="0"
            strokeWidth="1"
          />
        </svg>
        <span data-callout-label>
          <span className="block font-display text-base italic leading-snug text-cream">
            {label}
          </span>
          <span className="mt-1 block font-body text-[0.58rem] font-light uppercase leading-4 tracking-[0.14em] text-cream/55">
            {description}
          </span>
        </span>
      </span>
    </li>
  );
}
