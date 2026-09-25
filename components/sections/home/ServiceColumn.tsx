"use client";

import type { StaticImageData } from "next/image";
import { useRef } from "react";

import { CursorImageFollow } from "@/components/sections/home/CursorImageFollow";
import { gsap } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import type { Service } from "@/lib/data/products";

interface ServiceColumnProps {
  image: StaticImageData | string;
  service: Service;
}

export function ServiceColumn({ image, service }: ServiceColumnProps) {
  const article = useRef<HTMLElement>(null);
  const number = useRef<HTMLParagraphElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!article.current || !number.current) return;
    if (shouldReduceMotion) {
      number.current.textContent = service.number;
      return;
    }
    const progress = { value: 0 };
    const target = Number.parseInt(service.number, 10);
    const context = gsap.context(() => {
      // Count the service number once as its column enters at 82%; the proxy
      // changes text only, while the parent Reveal owns the translate entrance.
      gsap.to(progress, {
        duration: 0.9,
        ease: "power2.out",
        onUpdate: () => {
          if (number.current) {
            number.current.textContent = String(
              Math.round(progress.value),
            ).padStart(2, "0");
          }
        },
        scrollTrigger: {
          trigger: article.current,
          start: "top 82%",
          once: true,
        },
        value: target,
      });
    }, article);
    return () => context.revert();
  }, [service.number, shouldReduceMotion]);

  return (
    <article
      ref={article}
      className="group relative flex min-h-[24rem] flex-col border-t border-gold/30 py-9 transition-transform duration-500 ease-out lg:hover:-translate-y-1.5"
      data-reveal-item
    >
      <p
        ref={number}
        className="font-display text-[2.75rem] leading-none text-gold"
      >
        {service.number}
      </p>
      <div className="mt-7 h-px w-14 origin-left bg-gold transition-[width] duration-500 group-hover:w-full" />
      <h3 className="mt-8 font-display text-[1.55rem] text-charcoal">
        {service.name}
      </h3>
      <p className="mt-5 max-w-[18rem] text-sm font-light leading-7 text-muted">
        {service.description}
      </p>
      <a
        className="mt-auto w-fit border-b border-gold/50 pb-1 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-charcoal transition-colors hover:border-gold hover:text-gold"
        href="#collection"
      >
        Discover{" "}
        <span className="inline-block transition-transform group-hover:translate-x-1">
          →
        </span>
      </a>
      <CursorImageFollow image={image} targetRef={article} />
    </article>
  );
}
