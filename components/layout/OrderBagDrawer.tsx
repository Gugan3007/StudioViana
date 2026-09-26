"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { motionTokens } from "@/lib/animations/tokens";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { useManagedOverlay } from "@/lib/context/OverlayContext";
import { getProductBySlug, type Product } from "@/lib/data/products";
import { whatsappLink } from "@/lib/data/site";
import { hydrateBagStore, useBagStore } from "@/lib/store/bagStore";
import { useOrderStore } from "@/lib/store/orderStore";
import { formatINR } from "@/lib/utils/formatINR";
import { buildBagMessage } from "@/lib/utils/whatsapp";

export function OrderBagDrawer() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const items = useBagStore((state) => state.items);
  const updateQuantity = useBagStore((state) => state.updateQuantity);
  const removeItem = useBagStore((state) => state.removeItem);
  const total = useBagStore((state) => state.estimatedTotal());
  const prefillFromBag = useOrderStore((state) => state.prefillFromBag);
  const shouldReduceMotion = useReducedMotion();
  useManagedOverlay({
    id: "order-bag",
    initialFocusRef: closeButton,
    onClose: () => setOpen(false),
    open,
    returnFocusRef: returnFocus,
    rootRef: root,
  });

  useEffect(() => {
    hydrateBagStore();
    const reveal = () => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    window.addEventListener("studio-viana:open-bag", reveal);
    return () => window.removeEventListener("studio-viana:open-bag", reveal);
  }, []);

  const continueToDetails = () => {
    // The bag remains intact while its serializable items seed step four.
    prefillFromBag(items);
    setOpen(false);
    document
      .querySelector("#order")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[150] bg-charcoal/65"
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
            aria-label="Your order bag"
            aria-modal="true"
            animate={{ x: 0 }}
            className="ml-auto flex h-full w-full max-w-[32rem] flex-col overflow-y-auto bg-cream text-charcoal shadow-soft"
            data-lenis-prevent
            exit={{ x: shouldReduceMotion ? 0 : "100%" }}
            initial={{ x: shouldReduceMotion ? 0 : "100%" }}
            role="dialog"
            transition={{
              duration: shouldReduceMotion
                ? 0
                : motionTokens.overlay.panelEnter,
              ease: motionTokens.ease.framerExpo,
            }}
          >
            <div className="flex items-center justify-between border-b border-gold/30 px-6 py-5">
              <div>
                <h2 className="font-display text-3xl">Your Order</h2>
                <p className="text-xs text-muted">{items.length} selections</p>
              </div>
              <button
                ref={closeButton}
                aria-label="Close order bag"
                className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 text-xl"
                onClick={() => setOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="flex-1 px-6 py-3">
              {items.length ? (
                <ul className="divide-y divide-gold/25">
                  {items.map((item, index) => {
                    const product = getProductBySlug(item.productSlug) as
                      Product | undefined;
                    if (!product) return null;
                    const variant = product.variants.find(
                      (candidate) => candidate.name === item.variant,
                    );
                    return (
                      <motion.li
                        key={item.id}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-[5.5rem_1fr_auto] gap-4 py-5"
                        initial={{
                          opacity: shouldReduceMotion ? 1 : 0,
                          y: shouldReduceMotion ? 0 : 12,
                        }}
                        transition={{
                          delay: shouldReduceMotion
                            ? 0
                            : index * motionTokens.overlay.stagger,
                        }}
                      >
                        <div className="relative aspect-square overflow-hidden bg-cream-soft">
                          <Image
                            fill
                            alt=""
                            className="object-cover"
                            sizes="88px"
                            src={variant?.image ?? product.heroImage}
                          />
                        </div>
                        <div>
                          <p className="font-display text-lg leading-6">
                            {product.name}
                          </p>
                          {item.variant || item.flower || item.size ? (
                            <p className="text-xs text-muted">
                              {item.variant ?? item.flower ?? item.size}
                            </p>
                          ) : null}
                          <p className="mt-1 font-display">
                            {formatINR(item.unitPrice * item.quantity)}
                          </p>
                          <div className="mt-3 flex items-center">
                            <button
                              aria-label={`Decrease ${product.name} quantity`}
                              className="grid h-11 w-11 place-items-center border border-gold/35"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              type="button"
                            >
                              −
                            </button>
                            <output className="w-9 text-center text-sm">
                              {item.quantity}
                            </output>
                            <button
                              aria-label={`Increase ${product.name} quantity`}
                              className="grid h-11 w-11 place-items-center border border-gold/35"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              type="button"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          aria-label={`Remove ${product.name}`}
                          className="grid h-11 w-11 place-items-center text-muted hover:text-charcoal"
                          onClick={() => removeItem(item.id)}
                          type="button"
                        >
                          ⌫
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              ) : (
                <div className="grid min-h-72 place-items-center text-center">
                  <div>
                    <p className="font-display text-3xl">Your bag is waiting</p>
                    <p className="mt-3 text-sm text-muted">
                      Add a piece from the collection to begin.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {items.length ? (
              <div className="border-t border-gold/35 bg-cream-soft p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Estimated total</span>
                  <span className="font-display text-3xl">
                    {formatINR(total)}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Final delivery and custom details will be confirmed on
                  WhatsApp.
                </p>
                <div className="mt-5 grid gap-3">
                  <Button
                    href={whatsappLink(buildBagMessage(items))}
                    rel="noreferrer"
                    target="_blank"
                    variant="solid-forest"
                  >
                    Send order on WhatsApp
                  </Button>
                  <Button onClick={continueToDetails} variant="outline-gold">
                    Continue to custom details
                  </Button>
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
