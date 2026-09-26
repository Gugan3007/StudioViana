"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { OrderSummary } from "@/components/sections/order/OrderSummary";
import { motionTokens } from "@/lib/animations/tokens";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { useManagedOverlay } from "@/lib/context/OverlayContext";
import { useOrderStore } from "@/lib/store/orderStore";
import { estimateOrder, formatINR } from "@/lib/utils/formatINR";

export function MobileSummarySheet() {
  const [open, setOpen] = useState(false);
  const [inOrderView, setInOrderView] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const order = useOrderStore();
  const shouldReduceMotion = useReducedMotion();
  useManagedOverlay({
    id: "order-summary",
    initialFocusRef: close,
    onClose: () => setOpen(false),
    open,
    returnFocusRef: trigger,
    rootRef: root,
  });

  useEffect(() => {
    const orderSection = document.querySelector("#order");
    if (!orderSection || typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setInOrderView(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInOrderView(entry.isIntersecting);
        if (!entry.isIntersecting) setOpen(false);
      },
      { threshold: 0.05 },
    );
    observer.observe(orderSection);
    return () => observer.disconnect();
  }, []);

  if (!inOrderView) return null;

  return (
    <div className="lg:hidden">
      <button
        ref={trigger}
        className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[80] flex min-h-14 items-center justify-between rounded-full border border-gold/40 bg-forest px-5 text-cream shadow-soft"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="font-display text-lg">
          Est. {formatINR(estimateOrder(order))}
        </span>
        <span className="text-[0.58rem] uppercase tracking-[0.14em]">
          View summary ↑
        </span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[140] flex items-end bg-charcoal/65"
            exit={{
              opacity: 0,
              transition: {
                duration: shouldReduceMotion ? 0 : motionTokens.overlay.exit,
              },
            }}
            initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : motionTokens.overlay.enter,
            }}
          >
            <motion.div
              ref={root}
              aria-label="Order summary"
              aria-modal="true"
              animate={{ y: 0 }}
              className="max-h-[85svh] w-full overflow-y-auto rounded-t-[2rem] bg-cream pb-[env(safe-area-inset-bottom)] text-charcoal"
              data-lenis-prevent
              exit={{ y: "100%" }}
              initial={{ y: shouldReduceMotion ? 0 : "100%" }}
              role="dialog"
              transition={{
                duration: shouldReduceMotion
                  ? 0
                  : motionTokens.overlay.panelEnter,
                ease: motionTokens.ease.framerExpo,
              }}
            >
              <button
                ref={close}
                aria-label="Close summary"
                className="ml-auto mr-4 mt-4 grid h-11 w-11 place-items-center rounded-full border border-gold/40 text-xl"
                onClick={() => setOpen(false)}
                type="button"
              >
                ×
              </button>
              <OrderSummary compact />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
