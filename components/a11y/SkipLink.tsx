"use client";

export function SkipLink() {
  return (
    <a
      className="fixed left-4 top-3 z-[200] -translate-y-24 rounded-editorial border border-gold bg-forest px-5 py-3 font-body text-xs font-medium uppercase tracking-[0.16em] text-cream transition-transform focus:translate-y-0"
      href="#main-content"
      onClick={() => {
        window.requestAnimationFrame(() =>
          document.getElementById("main-content")?.focus(),
        );
      }}
    >
      Skip to content
    </a>
  );
}
