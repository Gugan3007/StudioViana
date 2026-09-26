import type { GalleryFilter } from "@/lib/data/gallery";
import { galleryFilters } from "@/lib/data/gallery";
import { cn } from "@/lib/utils";

interface GalleryFiltersProps {
  activeFilter: GalleryFilter;
  count: number;
  onChange: (filter: GalleryFilter) => void;
}

export function GalleryFilters({
  activeFilter,
  count,
  onChange,
}: GalleryFiltersProps) {
  return (
    <div>
      <div
        aria-label="Filter gallery"
        className="flex flex-wrap gap-2"
        role="group"
      >
        {galleryFilters.map((filter) => {
          const active = filter === activeFilter;
          return (
            <button
              key={filter}
              aria-pressed={active}
              className={cn(
                "min-h-11 rounded-full border px-4 font-body text-[0.62rem] font-medium uppercase tracking-[0.15em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                active
                  ? "border-forest bg-forest text-cream"
                  : "border-gold/55 text-charcoal hover:border-gold hover:bg-gold/10",
              )}
              onClick={() => onChange(filter)}
              type="button"
            >
              {filter}
            </button>
          );
        })}
      </div>
      <p
        aria-live="polite"
        className="mt-5 font-body text-[0.62rem] uppercase tracking-[0.18em] text-muted"
      >
        Showing {count} {count === 1 ? "piece" : "pieces"}
      </p>
    </div>
  );
}
