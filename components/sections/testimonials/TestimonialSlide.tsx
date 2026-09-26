"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

import type { TestimonialData } from "@/lib/data/testimonials";

interface TestimonialSlideProps {
  direction: -1 | 1;
  testimonial: TestimonialData;
}

const slideVariants = {
  enter: (direction: number) => ({ opacity: 0, y: direction * 18 }),
  exit: (direction: number) => ({ opacity: 0, y: direction * -18 }),
  visible: { opacity: 1, y: 0 },
};

export function TestimonialSlide({
  direction,
  testimonial,
}: TestimonialSlideProps) {
  const words = testimonial.quote.split(" ");

  return (
    <AnimatePresence custom={direction} initial={false} mode="wait">
      <motion.article
        key={testimonial.id}
        aria-hidden="true"
        animate="visible"
        custom={direction}
        exit="exit"
        initial="enter"
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        variants={slideVariants}
      >
        <blockquote className="mx-auto max-w-[52rem] text-balance text-center font-display text-[clamp(1.4rem,2.4vw,2.2rem)] italic leading-[1.55] text-forest">
          <span aria-hidden="true">“</span>
          {words.map((word, index) => (
            <motion.span
              key={`${word}-${index}`}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              className="inline-block"
              initial={{ filter: "blur(5px)", opacity: 0, y: 8 }}
              transition={{
                delay: index * 0.018,
                duration: 0.42,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
              {index < words.length - 1 ? "\u00a0" : ""}
            </motion.span>
          ))}
          <span aria-hidden="true">”</span>
        </blockquote>

        <div className="mt-9 flex items-center justify-center gap-4 text-center">
          {testimonial.photo ? (
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gold/40">
              <Image
                fill
                alt={`Piece received by ${testimonial.name}`}
                className="object-cover"
                placeholder="blur"
                sizes="48px"
                src={testimonial.photo}
              />
            </div>
          ) : null}
          <div>
            <p className="font-body text-[0.68rem] font-medium uppercase tracking-[0.2em] text-charcoal">
              {testimonial.name}
            </p>
            <p className="mt-1 font-body text-[0.54rem] uppercase tracking-[0.16em] text-[#765b34]">
              {testimonial.occasion} · {testimonial.product}
            </p>
          </div>
        </div>
      </motion.article>
    </AnimatePresence>
  );
}
