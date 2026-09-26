import { useOrderStore } from "@/lib/store/orderStore";

export function OrderSuccess() {
  const reset = useOrderStore((state) => state.reset);
  return (
    <div className="grid min-h-[34rem] place-items-center text-center">
      <div>
        <svg
          aria-hidden="true"
          className="mx-auto h-24 w-24 text-gold"
          fill="none"
          viewBox="0 0 100 100"
        >
          <g stroke="currentColor" strokeWidth="1.5">
            {Array.from({ length: 8 }, (_, index) => (
              <ellipse
                key={index}
                className="animate-[flower_draw_1.4s_ease-out_both] [stroke-dasharray:120] [stroke-dashoffset:0] motion-reduce:animate-none"
                cx="50"
                cy="28"
                rx="12"
                ry="24"
                style={{
                  transform: `rotate(${index * 45}deg)`,
                  transformOrigin: "50px 50px",
                }}
              />
            ))}
            <circle cx="50" cy="50" r="10" />
          </g>
        </svg>
        <h3 className="mt-6 font-display text-4xl">Thank you!</h3>
        <p className="mx-auto mt-4 max-w-md font-light leading-7 text-muted">
          We&apos;ll confirm your order on WhatsApp shortly.
        </p>
        <button
          className="mt-7 border-b border-gold pb-1 text-xs uppercase tracking-[0.16em] text-[#765b34]"
          onClick={reset}
          type="button"
        >
          Start another order
        </button>
      </div>
    </div>
  );
}
