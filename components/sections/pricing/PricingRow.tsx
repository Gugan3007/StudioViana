"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import type { Product } from "@/lib/data/products";
import { ORDER_MODE } from "@/lib/data/site";
import { formatINR, formatINRValue } from "@/lib/utils/formatINR";
import {
  openProductDetail,
  openProductOrder,
  productOrderHref,
} from "@/lib/utils/orderEntry";

export interface PricingRowData {
  readonly details: string;
  readonly highPrice?: number;
  readonly lowPrice?: number;
  readonly product: Product;
}

function AnimatedPrice({ highPrice, lowPrice }: Omit<PricingRowData, "details" | "product">) {
  const finalLow = lowPrice ?? 0;
  const finalHigh = highPrice;
  const [values, setValues] = useState({ high: finalHigh ?? 0, low: finalLow });
  const root = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion || !root.current || !lowPrice) return;
    const node = root.current;
    let frame = 0;
    let startedAt = 0;
    const draw = (now: number) => {
      if (!startedAt) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / 750);
      const eased = 1 - (1 - progress) ** 3;
      setValues({
        high: Math.round((finalHigh ?? 0) * eased),
        low: Math.round(finalLow * eased),
      });
      if (progress < 1) frame = requestAnimationFrame(draw);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setValues({ high: 0, low: 0 });
        frame = requestAnimationFrame(draw);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10%", threshold: 0.3 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [finalHigh, finalLow, lowPrice, shouldReduceMotion]);

  if (!lowPrice) {
    return (
      <span
        ref={root}
        className="inline-block animate-[pricing-type_0.9s_steps(10,end)_both] overflow-hidden whitespace-nowrap"
      >
        On request
      </span>
    );
  }

  return (
    <span ref={root} className="whitespace-nowrap tabular-nums">
      {finalHigh
        ? `₹${formatINRValue(values.low)} – ₹${formatINRValue(values.high)}`
        : formatINR(values.low)}
    </span>
  );
}

export function PricingRow({ details, highPrice, lowPrice, product }: PricingRowData) {
  const corporate = product.slug === "corporate-bulk-orders";
  const revealCorporate = () =>
    document.querySelector("#corporate")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  const viewDetails = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (corporate) revealCorporate();
    else openProductDetail(product.slug, event.currentTarget);
  };
  const href = corporate
    ? "#corporate"
    : productOrderHref(product, {}, ORDER_MODE);

  return (
    <article
      className="group relative grid overflow-hidden border-b border-gold/35 transition-colors duration-500 hover:bg-cream-soft [&.pricing-visible_[data-row-line]]:scale-x-100 md:grid-cols-[minmax(13rem,1.1fr)_minmax(16rem,1.35fr)_minmax(7rem,.55fr)_minmax(5.5rem,.35fr)] md:items-center"
      data-pricing-row
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-700 group-[.pricing-visible]:scale-x-100"
        data-row-line
      />
      <button
        aria-label={
          corporate ? "View corporate and bulk orders" : `View ${product.name} details`
        }
        className="flex min-h-20 items-center gap-4 px-4 py-5 text-left md:min-h-24 md:px-5"
        onClick={viewDetails}
        type="button"
      >
        <span className="relative h-14 w-0 shrink-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:w-14 group-hover:opacity-100">
          <Image
            fill
            alt=""
            className="object-cover"
            placeholder="blur"
            sizes="56px"
            src={product.heroImage}
          />
        </span>
        <h3 className="font-display text-[1.35rem] leading-7 transition-transform duration-500 group-hover:translate-x-2.5">
          {product.name}
        </h3>
      </button>
      <p className="px-4 pb-4 text-sm font-light leading-6 text-muted md:px-5 md:pb-0">
        {details}
      </p>
      <p className="absolute right-4 top-6 font-display text-xl md:static md:px-5 md:text-right md:text-2xl">
        <AnimatedPrice highPrice={highPrice} lowPrice={lowPrice} />
      </p>
      <a
        aria-label={`Order ${product.name}`}
        className="mx-4 mb-5 inline-flex min-h-11 items-center justify-center border border-gold/45 px-4 text-[0.62rem] uppercase tracking-[0.18em] text-charcoal transition-all duration-300 hover:border-gold hover:bg-gold hover:text-forest md:mx-0 md:mb-0 md:border-0 md:px-5 md:opacity-0 md:group-hover:opacity-100"
        href={href}
        onClick={(event) => {
          if (corporate) {
            event.preventDefault();
            revealCorporate();
          } else if (ORDER_MODE === "builder") {
            event.preventDefault();
            openProductOrder(product);
          }
        }}
      >
        Order <span aria-hidden="true" className="ml-2">→</span>
      </a>
    </article>
  );
}
