import { builderOptions } from "@/lib/data/site";
import { useOrderStore } from "@/lib/store/orderStore";
import { cn } from "@/lib/utils";

const swatches: Record<string, string> = {
  "Blush Pink": "#e9c9c9",
  Lilac: "#c9b6e4",
  "Ruby Red": "#9f2f3c",
  "Ivory White": "#f7f0e6",
  "Sunshine Yellow": "#e3bd4f",
  "Royal Purple": "#6d4b8b",
  Peach: "#efb894",
  "Mixed Pastels": "conic-gradient(#e9c9c9, #c9b6e4, #efb894, #f7f0e6)",
  Custom: "conic-gradient(#9f2f3c, #c9b6e4, #e3bd4f, #e9c9c9)",
};

export function StepPalette() {
  const order = useOrderStore();

  return (
    <div>
      <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#765b34]">
        03 · Palette
      </p>
      <h3 className="mt-3 font-display text-4xl tracking-[-0.03em]">
        Choose a palette
      </h3>
      <p className="mt-3 text-sm font-light text-muted">
        Select up to three colours, then choose how the piece should be wrapped.
      </p>
      <div
        className="mt-7 grid grid-cols-3 gap-4 sm:grid-cols-5"
        role="group"
        aria-label="Colour palette"
      >
        {builderOptions.palettes.map((palette) => {
          const active = order.palettes.includes(palette);
          const capped = order.palettes.length >= 3 && !active;
          return (
            <button
              key={palette}
              aria-pressed={active}
              className={cn(
                "min-h-24 text-center text-[0.58rem] leading-4 text-muted",
                capped && "opacity-45",
              )}
              onClick={() => order.togglePalette(palette)}
              type="button"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mx-auto block h-12 w-12 rounded-full border border-charcoal/10 ring-offset-4 ring-offset-cream transition-shadow",
                  active && "ring-2 ring-gold",
                )}
                style={{ background: swatches[palette] }}
              />
              <span className="mt-2 block">{palette}</span>
            </button>
          );
        })}
      </div>
      {order.palettes.includes("Custom") ? (
        <label className="mt-5 grid gap-2 text-xs text-muted">
          Describe your colours
          <input
            aria-label="Describe your colours"
            className="min-h-12 border-b border-gold/50 bg-transparent px-1 text-charcoal"
            onChange={(event) =>
              order.update({ customPalette: event.target.value })
            }
            placeholder="e.g. dusty rose with sage green"
            value={order.customPalette ?? ""}
          />
        </label>
      ) : null}

      <fieldset className="mt-8">
        <legend className="text-[0.58rem] uppercase tracking-[0.18em] text-muted">
          Wrap style
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {builderOptions.wraps.map((wrap) => (
            <label key={wrap} className="cursor-pointer">
              <input
                aria-label={wrap}
                checked={order.wrapStyle === wrap}
                className="peer sr-only"
                name="wrap-style"
                onChange={() => order.update({ wrapStyle: wrap })}
                type="radio"
              />
              <span className="flex min-h-12 items-center border border-gold/30 px-4 text-sm peer-checked:border-gold peer-checked:bg-gold peer-checked:text-forest">
                {wrap}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
