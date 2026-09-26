"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import type { FAQItem as FAQItemData } from "@/lib/data/faq";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  item: FAQItemData;
  onToggle: () => void;
  open: boolean;
}

export function AccordionItem({ item, onToggle, open }: AccordionItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const buttonId = `faq-button-${item.id}`;
  const panelId = `faq-panel-${item.id}`;
  const panel = (
    <div
      aria-labelledby={buttonId}
      className="overflow-hidden"
      id={panelId}
      role="region"
    >
      <p className="max-w-3xl pb-7 pr-10 font-light leading-8 text-muted">
        {item.answer}
      </p>
    </div>
  );

  return (
    <div className="border-t border-gold/40 last:border-b">
      <h3>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          className={cn(
            "flex min-h-20 w-full items-center justify-between gap-5 py-5 text-left font-display text-[clamp(1.35rem,2.4vw,2rem)] leading-tight transition-colors",
            open ? "text-[#8a6738]" : "text-charcoal",
          )}
          id={buttonId}
          onClick={onToggle}
          type="button"
        >
          {item.question}
          <span
            aria-hidden="true"
            className={cn(
              "relative block h-7 w-7 shrink-0 transition-transform duration-500",
              open && "rotate-45",
            )}
          >
            <span className="absolute left-0 top-1/2 h-px w-full bg-gold" />
            <span className="absolute left-1/2 top-0 h-full w-px bg-gold" />
          </span>
        </button>
      </h3>
      {shouldReduceMotion ? (
        open ? (
          panel
        ) : null
      ) : (
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {panel}
            </motion.div>
          ) : null}
        </AnimatePresence>
      )}
    </div>
  );
}
