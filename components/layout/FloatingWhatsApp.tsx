"use client";

import { motion } from "framer-motion";

import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { useIntro } from "@/lib/context/IntroContext";
import { useOverlay } from "@/lib/context/OverlayContext";
import { whatsappLink } from "@/lib/utils";

const message =
  "Hello Studio Viana! I’d love to know more about your handcrafted florals.";

export function FloatingWhatsApp() {
  const { introComplete } = useIntro();
  const { overlayOpen } = useOverlay();
  const shouldReduceMotion = useReducedMotion();
  if (!introComplete || overlayOpen) return null;
  return (
    <motion.a
      aria-label="Chat with us on WhatsApp"
      animate={{ opacity: 1, scale: 1 }}
      className="group fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[70] flex h-14 items-center justify-end overflow-hidden rounded-full border border-gold/55 bg-forest text-gold shadow-soft transition-[width] duration-500 hover:w-44 sm:bottom-6 sm:right-6"
      href={whatsappLink(message)}
      initial={
        shouldReduceMotion
          ? { opacity: 1, scale: 1 }
          : { opacity: 0, scale: 0.7 }
      }
      rel="noreferrer"
      target="_blank"
    >
      <span className="pointer-events-none absolute inset-0 animate-[whatsapp-pulse_6s_ease-out_infinite] rounded-full border border-gold/35 motion-reduce:hidden" />
      <span className="w-0 overflow-hidden whitespace-nowrap pl-4 text-[0.58rem] uppercase tracking-[0.14em] text-cream opacity-0 transition-[width,opacity] duration-500 group-hover:w-28 group-hover:opacity-100">
        Chat with us
      </span>
      <svg
        aria-hidden="true"
        className="mx-[1.05rem] h-6 w-6 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.6Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8.2 8.1c.3-.7.6-.7 1-.7h.3c.2 0 .4.1.5.4l.8 1.9c.1.3 0 .5-.1.7l-.6.7c-.2.2-.1.4 0 .6.8 1.4 1.9 2.4 3.4 3 .3.1.5.1.7-.1l.8-1c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.3.4.6 0 .5-.2 1.5-1 2.1-.7.6-1.7.8-2.7.5-1.4-.4-3.2-1.1-5-2.8-1.5-1.4-2.5-3.2-2.8-4.4-.3-1.1 0-1.8.3-2.2.4-.4.8-.6 1.4-.6Z"
          fill="currentColor"
        />
      </svg>
    </motion.a>
  );
}
