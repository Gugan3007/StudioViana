"use client";

import { useEffect, useRef, useState } from "react";

interface ContactRowProps {
  copyLabel: string;
  href: string;
  label: string;
  value: string;
}

export function ContactRow({ copyLabel, href, label, value }: ContactRowProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const copy = async () => {
    await navigator.clipboard?.writeText(value);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="group relative grid min-h-24 grid-cols-[1fr_auto] items-end gap-4 border-b border-gold/35 pb-4 transition-colors data-[copied=true]:bg-gold/10"
      data-copied={copied}
    >
      <div>
        <p className="text-[0.55rem] uppercase tracking-[0.2em] text-gold-light">
          {label}
        </p>
        <a
          className="mt-2 inline-flex items-center font-display text-[clamp(1.15rem,2.1vw,1.7rem)] leading-tight text-cream"
          href={href}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
          target={href.startsWith("http") ? "_blank" : undefined}
        >
          {value}
          <span aria-hidden="true" className="ml-3 transition-transform duration-300 group-hover:translate-x-1">↗</span>
        </a>
      </div>
      <button
        aria-label={copyLabel}
        className="relative grid h-11 w-11 place-items-center rounded-full border border-gold/40 text-gold-light"
        onClick={copy}
        type="button"
      >
        <span aria-hidden="true">⧉</span>
        {copied ? (
          <span className="absolute -top-8 right-0 whitespace-nowrap rounded-full bg-gold px-3 py-1 text-[0.55rem] text-forest shadow-soft">
            Copied ✓
          </span>
        ) : null}
      </button>
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
    </div>
  );
}
