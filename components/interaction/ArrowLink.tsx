import type { ReactNode } from "react";

export function ArrowLink({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span>{children}</span>
      <span
        className="relative block h-4 w-4 overflow-hidden"
        aria-hidden="true"
      >
        <svg
          className="absolute inset-0 h-4 w-4 transition-transform duration-500 group-hover:translate-x-full group-focus-visible:translate-x-full"
          fill="none"
          viewBox="0 0 16 16"
        >
          <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" />
        </svg>
        <svg
          className="absolute inset-0 h-4 w-4 -translate-x-full transition-transform duration-500 group-hover:translate-x-0 group-focus-visible:translate-x-0"
          fill="none"
          viewBox="0 0 16 16"
        >
          <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" />
        </svg>
      </span>
    </span>
  );
}
