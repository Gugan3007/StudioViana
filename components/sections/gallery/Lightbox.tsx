"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { motionTokens } from "@/lib/animations/tokens";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { useManagedOverlay } from "@/lib/context/OverlayContext";
import type { GalleryItemData } from "@/lib/data/gallery";
import { whatsappLink } from "@/lib/utils";

interface LightboxProps {
  initialItemId: string;
  items: readonly GalleryItemData[];
  onClose: () => void;
  origin: HTMLElement;
}

const SWIPE_THRESHOLD = 48;
const slideVariants = {
  center: { opacity: 1, x: 0 },
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? "10%" : "-10%",
  }),
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? "-10%" : "10%",
  }),
};

export function Lightbox({
  initialItemId,
  items,
  onClose,
  origin,
}: LightboxProps) {
  const root = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const pointerStart = useRef<number | null>(null);
  const restoreOrigin = useRef(true);
  const returnFocusRef = useRef<HTMLElement | null>(origin);
  const shouldReduceMotion = useReducedMotion();
  const initialIndex = Math.max(
    0,
    items.findIndex((item) => item.id === initialItemId),
  );
  const [navigation, setNavigation] = useState({
    direction: 1,
    index: initialIndex,
  });
  const [zoomed, setZoomed] = useState(false);
  const current = items[navigation.index] ?? items[0];

  const navigate = useCallback(
    (direction: -1 | 1) => {
      setZoomed(false);
      setNavigation((state) => ({
        direction,
        index: (state.index + direction + items.length) % items.length,
      }));
    },
    [items.length],
  );

  const requestClose = useCallback(
    (shouldRestoreFocus = true) => {
      restoreOrigin.current = shouldRestoreFocus;
      onClose();
    },
    [onClose],
  );

  useManagedOverlay({
    id: "gallery-lightbox",
    initialFocusRef: closeButton,
    onClose: requestClose,
    open: true,
    restoreFocus: () => restoreOrigin.current,
    returnFocusRef,
    rootRef: root,
  });

  useEffect(() => {
    returnFocusRef.current = origin;
  }, [origin]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigate(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        navigate(1);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  useEffect(() => {
    if (!items.length) return;
    const previous =
      items[(navigation.index - 1 + items.length) % items.length];
    const next = items[(navigation.index + 1) % items.length];
    [previous, next].forEach((item) => {
      if (!item) return;
      const preload = new window.Image();
      preload.src = item.src.src;
    });
  }, [items, navigation.index]);

  if (!current) return null;

  const openProduct = () => {
    if (!current.productSlug) return;
    restoreOrigin.current = false;
    onClose();
    // ProductDetail is dispatched on the next task after this dialog unmounts,
    // preventing two focus traps or scroll-lock owners from overlapping.
    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("studio-viana:open-product", {
          detail: { returnFocus: origin, slug: current.productSlug },
        }),
      );
    }, 0);
  };

  return (
    <motion.div
      ref={root}
      aria-label={`Gallery lightbox: ${current.title}`}
      aria-modal="true"
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[140] grid min-h-[100svh] place-items-start overflow-y-auto overflow-x-hidden bg-forest-deep/[0.97] px-4 pb-8 pt-20 text-cream md:place-items-center md:overflow-hidden md:px-16 md:py-12"
      data-lenis-prevent
      data-lightbox
      exit={{
        opacity: 0,
        transition: {
          duration: shouldReduceMotion ? 0 : motionTokens.overlay.exit,
        },
      }}
      initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      role="dialog"
      transition={{
        duration: shouldReduceMotion ? 0 : motionTokens.overlay.enter,
        ease: motionTokens.ease.framerExpo,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(rgba(255,255,255,0.6)_0.55px,transparent_0.55px)] [background-size:5px_5px]"
      />
      <button
        ref={closeButton}
        aria-label="Close gallery lightbox"
        className="absolute right-4 top-4 z-20 grid h-12 w-12 place-items-center rounded-full border border-gold/60 text-2xl text-cream transition-transform duration-500 hover:rotate-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:right-8 md:top-7"
        onClick={() => requestClose()}
        type="button"
      >
        ×
      </button>

      <button
        aria-label="Previous gallery piece"
        className="absolute left-4 top-1/3 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center border border-gold/50 bg-forest-deep/55 text-xl backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold md:left-7 md:top-1/2"
        onClick={() => navigate(-1)}
        type="button"
      >
        ←
      </button>
      <button
        aria-label="Next gallery piece"
        className="absolute right-4 top-1/3 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center border border-gold/50 bg-forest-deep/55 text-xl backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold md:right-7 md:top-1/2"
        onClick={() => navigate(1)}
        type="button"
      >
        →
      </button>

      <div
        className="relative grid min-h-[calc(100svh-7rem)] w-full max-w-6xl items-center gap-6 md:h-full md:min-h-0 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-10"
        data-lightbox-stage
        onPointerDown={(event) => {
          pointerStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (pointerStart.current === null) return;
          const travel = event.clientX - pointerStart.current;
          pointerStart.current = null;
          if (Math.abs(travel) < SWIPE_THRESHOLD) return;
          navigate(travel < 0 ? 1 : -1);
        }}
      >
        <div className="relative flex min-h-0 items-center justify-center overflow-hidden">
          <AnimatePresence
            custom={navigation.direction}
            initial={false}
            mode="wait"
          >
            <motion.div
              key={current.id}
              animate="center"
              className="relative h-[min(48svh,32rem)] w-full md:h-[min(65svh,48rem)]"
              custom={navigation.direction}
              exit="exit"
              initial="enter"
              transition={{
                duration: shouldReduceMotion
                  ? 0
                  : motionTokens.overlay.panelEnter,
                ease: motionTokens.ease.framerExpo,
              }}
              variants={slideVariants}
            >
              <motion.button
                aria-label={zoomed ? "Zoom out image" : "Zoom in image"}
                aria-pressed={zoomed}
                animate={{ scale: zoomed ? 1.7 : 1 }}
                className="relative h-full w-full cursor-zoom-in touch-pan-y focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                layoutId={`gallery-image-${current.id}`}
                onClick={() => {
                  if (
                    window.matchMedia("(hover: hover) and (pointer: fine)")
                      .matches
                  ) {
                    setZoomed((value) => !value);
                  }
                }}
                onDoubleClick={() => setZoomed((value) => !value)}
                transition={{
                  duration: shouldReduceMotion ? 0 : motionTokens.duration.fast,
                  ease: motionTokens.ease.framerExpo,
                }}
                type="button"
              >
                {/* Matching layoutIds let Framer Motion carry the selected
                    gallery image into this contained editorial stage. */}
                <Image
                  fill
                  alt={current.alt}
                  className="object-contain"
                  placeholder="blur"
                  priority
                  sizes="(min-width: 768px) 70vw, 94vw"
                  src={current.src}
                />
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="relative z-10 border-t border-gold/35 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <p className="font-body text-[0.58rem] uppercase tracking-[0.2em] text-gold-light">
            {current.category}
          </p>
          <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
            {current.title}
          </h2>
          <p
            className="mt-5 font-body text-[0.62rem] uppercase tracking-[0.2em] text-cream/55"
            data-testid="lightbox-counter"
          >
            {String(navigation.index + 1).padStart(2, "0")} /{" "}
            {String(items.length).padStart(2, "0")}
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            {current.productSlug ? (
              <Button
                className="border-gold-light text-cream before:bg-gold"
                onClick={openProduct}
                variant="outline-gold"
              >
                View this piece
              </Button>
            ) : null}
            <Button
              className="text-cream"
              href={whatsappLink(
                `Hi Studio Viana! 🌸 I'd like to order something similar to ${current.title}.`,
              )}
              rel="noreferrer"
              target="_blank"
              variant="text-link"
            >
              Order something similar
            </Button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
