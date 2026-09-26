"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { catalogueProducts } from "@/lib/data/products";
import { useOrderStore } from "@/lib/store/orderStore";
import { estimateOrder, formatINR } from "@/lib/utils/formatINR";
import flowerCard from "@/public/images/products/flower-card.jpg";

function AnimatedTotal({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const shouldReduceMotion = useReducedMotion();
  useEffect(() => {
    if (shouldReduceMotion) return;
    const from = shown;
    let frame = 0;
    let start = 0;
    const draw = (now: number) => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / 450);
      setShown(Math.round(from + (value - from) * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
    // The current visual value intentionally seeds each new interpolation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldReduceMotion, value]);
  return <>{formatINR(shouldReduceMotion ? value : shown)}</>;
}

export function OrderSummary({ compact = false }: { compact?: boolean }) {
  const order = useOrderStore();
  const product = catalogueProducts.find(
    (candidate) => candidate.slug === order.pieceSlug,
  );
  const variant = product?.variants.find((item) => item.name === order.variant);
  const image = variant?.image ?? product?.heroImage ?? flowerCard;
  const selections = [
    order.flowers.length ? order.flowers.join(", ") : null,
    order.palettes.length ? order.palettes.join(", ") : null,
    order.wrapStyle,
    order.occasion,
  ].filter(Boolean);

  return (
    <div
      className={
        compact ? "p-5" : "border border-gold/35 bg-cream-soft p-6 shadow-soft"
      }
    >
      <div className="flex items-start justify-between gap-4 border-b border-gold/30 pb-4">
        <div>
          <p className="font-display text-2xl">Order Summary</p>
          <p className="text-[0.55rem] uppercase tracking-[0.14em] text-muted">
            Step {order.step} of 5
          </p>
        </div>
        <span className="text-[0.55rem] uppercase tracking-[0.14em] text-[#765b34]">
          Made by hand
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${order.pieceSlug}-${order.variant}`}
          animate={{ opacity: 1 }}
          className="mt-5 grid grid-cols-[6rem_1fr] gap-4"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <div className="relative aspect-square overflow-hidden bg-cream">
            <Image
              fill
              alt=""
              className="object-cover"
              sizes="96px"
              src={image}
            />
          </div>
          <div>
            <p className="font-display text-xl">
              {product?.name ??
                (order.pieceSlug ? "Something custom" : "Your piece")}
            </p>
            {order.variant ? (
              <p className="text-xs text-muted">{order.variant}</p>
            ) : null}
            {order.quantity > 1 ? (
              <p className="mt-2 text-xs text-muted">
                Quantity · {order.quantity}
              </p>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>
      {selections.length ? (
        <ul className="mt-5 space-y-2 border-t border-gold/25 pt-4 text-xs text-muted">
          {selections.map((selection) => (
            <motion.li
              key={selection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {selection}
            </motion.li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6 flex items-end justify-between border-t border-gold/35 pt-5">
        <div>
          <p className="text-[0.55rem] uppercase tracking-[0.14em] text-muted">
            Estimated total
          </p>
          <p className="mt-1 text-[0.58rem] text-muted">
            Final price confirmed with you
          </p>
        </div>
        <p
          className="font-display text-3xl tabular-nums"
          data-testid="order-estimate"
        >
          <AnimatedTotal value={estimateOrder(order)} />
        </p>
      </div>
    </div>
  );
}
