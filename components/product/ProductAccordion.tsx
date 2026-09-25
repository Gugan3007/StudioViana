"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const items = [
  {
    title: "Customisation",
    copy: "Every bloom, wrap and ribbon can be re-imagined in your chosen palette. Share references with us on WhatsApp and we will suggest a balanced edit.",
  },
  {
    title: "Care — how to keep your blooms beautiful",
    copy: "Dust gently with a soft dry brush. Keep away from water, humidity and direct sunlight so the chenille fibres and colour stay beautiful.",
  },
  {
    title: "Lead time & delivery",
    copy: "Each piece is made to order. Current lead time and delivery options are confirmed on WhatsApp before your order is accepted.",
  },
] as const;

export function ProductAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mt-10 border-t border-gold/30">
      {items.map((item, index) => {
        const open = openIndex === index;
        const contentId = `product-accordion-${index}`;
        return (
          <div key={item.title} className="border-b border-gold/30">
            <button
              aria-controls={contentId}
              aria-expanded={open}
              className="flex w-full items-center justify-between py-5 text-left text-sm text-charcoal"
              onClick={() => setOpenIndex(open ? null : index)}
              type="button"
            >
              {item.title}
              <span aria-hidden="true" className="text-gold">
                {open ? "−" : "+"}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  key="content"
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  id={contentId}
                  initial={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="max-w-xl pb-6 text-sm font-light leading-7 text-muted">
                    {item.copy}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
