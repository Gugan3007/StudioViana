interface GalleryProgressProps {
  activeIndex: number;
  productNames: readonly string[];
  total: number;
}

export function GalleryProgress({
  activeIndex,
  productNames,
  total,
}: GalleryProgressProps) {
  const progress = total <= 1 ? 1 : activeIndex / (total - 1);
  const current = String(activeIndex + 1).padStart(2, "0");
  const count = String(total).padStart(2, "0");

  return (
    <>
      <div className="pointer-events-none absolute right-8 top-7 z-30 text-[0.58rem] uppercase tracking-[0.22em] text-muted">
        {productNames[activeIndex]}
      </div>
      <div className="pointer-events-none absolute inset-x-8 bottom-6 z-30 flex items-center gap-5">
        <p
          aria-live="polite"
          className="w-20 font-display text-xl text-charcoal"
          data-testid="gallery-counter"
        >
          <span
            key={current}
            className="inline-block animate-[counter-roll_0.4s_ease-out]"
          >
            {current}
          </span>{" "}
          / {count}
        </p>
        <span className="relative h-px flex-1 bg-gold/25">
          <span
            className="absolute inset-y-0 left-0 origin-left bg-gold transition-transform duration-500"
            style={{ transform: `scaleX(${progress})`, width: "100%" }}
          />
        </span>
      </div>
    </>
  );
}
