"use client";

import { useBagStore } from "@/lib/store/bagStore";
import { cn } from "@/lib/utils";

export function OrderBagButton({ className }: { className?: string }) {
  const count = useBagStore((state) => state.itemCount());
  return (
    <button
      aria-label={`Open order bag, ${count} ${count === 1 ? "item" : "items"}`}
      className={cn(
        "border-current/35 relative grid h-11 w-11 shrink-0 place-items-center rounded-full border text-current transition-colors hover:border-gold hover:text-gold",
        className,
      )}
      data-cursor="link"
      onClick={() =>
        window.dispatchEvent(new CustomEvent("studio-viana:open-bag"))
      }
      type="button"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M5 8h14l-1 12H6L5 8Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
        <path
          d="M9 9V6a3 3 0 0 1 6 0v3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.4"
        />
      </svg>
      {count ? (
        <span
          key={count}
          className="absolute -right-1 -top-1 grid h-5 min-w-5 animate-[bag-bounce_0.45s_ease-out] place-items-center rounded-full bg-gold px-1 text-[0.55rem] font-medium text-forest motion-reduce:animate-none"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
