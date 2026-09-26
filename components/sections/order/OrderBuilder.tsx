"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { MobileSummarySheet } from "@/components/sections/order/MobileSummarySheet";
import { OrderSuccess } from "@/components/sections/order/OrderSuccess";
import { OrderSummary } from "@/components/sections/order/OrderSummary";
import { StepDetails } from "@/components/sections/order/StepDetails";
import { StepFlowers } from "@/components/sections/order/StepFlowers";
import { StepPalette } from "@/components/sections/order/StepPalette";
import { StepPiece } from "@/components/sections/order/StepPiece";
import { StepProgress } from "@/components/sections/order/StepProgress";
import { StepReview } from "@/components/sections/order/StepReview";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { refreshScrollTrigger } from "@/lib/animations/gsap";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import {
  hydrateOrderStore,
  resetOrderStore,
  useOrderStore,
} from "@/lib/store/orderStore";
import type { OrderBuilderEventDetail } from "@/lib/utils/orderEntry";
import { customerDetailsSchema } from "@/lib/validation/orderSchema";

const stepLabels = ["", "Flowers", "Palette", "Details", "Review your order"];

export function OrderBuilder() {
  const order = useOrderStore();
  const [direction, setDirection] = useState(1);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const stage = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    hydrateOrderStore();
    const prefill = (event: Event) => {
      const detail = (event as CustomEvent<OrderBuilderEventDetail>).detail;
      if (!detail?.productSlug) return;
      resetOrderStore(false);
      const configuration = detail.configuration ?? {};
      useOrderStore.setState({
        flowers: configuration.flower ? [configuration.flower] : [],
        occasion: configuration.occasion,
        palettes: configuration.palette ? [configuration.palette] : [],
        messageCard: configuration.personalMessage,
        pieceSlug: detail.productSlug,
        quantity: configuration.quantity ?? 1,
        size: configuration.size,
        step: 2,
        variant: configuration.variant,
      });
      setDirection(1);
      setErrors({});
    };
    window.addEventListener("studio-viana:open-order-builder", prefill);
    return () =>
      window.removeEventListener("studio-viana:open-order-builder", prefill);
  }, []);

  useEffect(() => {
    refreshScrollTrigger();
  }, [order.step, order.submitted]);

  const goTo = useCallback(
    (step: number) => {
      setDirection(step >= order.step ? 1 : -1);
      order.setStep(step);
      setErrors({});
      stage.current?.focus({ preventScroll: true });
    },
    [order],
  );

  const next = useCallback(() => {
    if (order.step === 1 && !order.pieceSlug) return;
    if (
      order.step === 3 &&
      (!order.palettes.length ||
        !order.wrapStyle ||
        (order.palettes.includes("Custom") && !order.customPalette?.trim()))
    ) {
      return;
    }
    if (order.step === 4) {
      const result = customerDetailsSchema.safeParse({
        customerName: order.customerName ?? "",
        deliveryArea: order.deliveryArea ?? "",
        deliveryMethod: order.deliveryMethod,
        email: order.email ?? "",
        phone: order.phone ?? "",
      });
      const nextErrors: Record<string, string> = {};
      if (!order.occasion) nextErrors.occasion = "Please choose an occasion.";
      if (!order.neededBy)
        nextErrors.neededBy = "Please choose when you need your order.";
      if (!order.deliveryMethod)
        nextErrors.deliveryMethod = "Please choose pick up or delivery.";
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const field = String(issue.path[0] ?? "details");
          if (!nextErrors[field]) nextErrors[field] = issue.message;
        });
      }
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) return;
    }
    goTo(Math.min(5, order.step + 1));
  }, [goTo, order]);

  const previous = () => goTo(Math.max(1, order.step - 1));
  const nextDisabled =
    (order.step === 1 && !order.pieceSlug) ||
    (order.step === 3 &&
      (!order.palettes.length ||
        !order.wrapStyle ||
        (order.palettes.includes("Custom") && !order.customPalette?.trim())));

  const stepContent = [
    null,
    <StepPiece key="piece" />,
    <StepFlowers key="flowers" />,
    <StepPalette key="palette" />,
    <StepDetails key="details" errors={errors} />,
    <StepReview key="review" />,
  ][order.step];

  return (
    <Section
      id="order"
      aria-labelledby="order-heading"
      className="relative overflow-hidden bg-cream-soft pb-32 lg:pb-section"
      data-theme="light"
      tone="soft"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>M A K E &nbsp; I T &nbsp; Y O U R S</SectionLabel>
          <h2
            className="mt-5 font-display text-[clamp(3.4rem,7vw,7rem)] leading-[0.94] tracking-[-0.05em]"
            id="order-heading"
          >
            Design <em className="font-normal text-gold">your</em> bouquet
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-light leading-8 text-muted">
            Tell us what you have in mind — we&apos;ll craft it by hand and
            confirm everything on WhatsApp.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(19rem,2fr)] lg:items-start">
          <div className="border border-gold/30 bg-cream p-5 sm:p-8 lg:p-10">
            {order.submitted ? (
              <OrderSuccess />
            ) : (
              <>
                <StepProgress current={order.step} onStep={goTo} />
                <div
                  ref={stage}
                  className="min-h-[42rem] outline-none sm:min-h-[38rem]"
                  onKeyDown={(event) => {
                    if (
                      event.key !== "Enter" ||
                      event.shiftKey ||
                      event.target instanceof HTMLTextAreaElement ||
                      order.step === 5
                    ) {
                      return;
                    }
                    event.preventDefault();
                    next();
                  }}
                  tabIndex={-1}
                >
                  {shouldReduceMotion ? (
                    <div key={order.step}>{stepContent}</div>
                  ) : (
                    <AnimatePresence
                      initial={false}
                      mode="wait"
                      custom={direction}
                    >
                      <motion.div
                        key={order.step}
                        animate={{ opacity: 1, x: 0 }}
                        custom={direction}
                        exit={{
                          opacity: 0,
                          x: direction > 0 ? -32 : 32,
                        }}
                        initial={{
                          opacity: 0,
                          x: direction > 0 ? 32 : -32,
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        {stepContent}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
                {order.step < 5 ? (
                  <div className="mt-8 flex items-center justify-between gap-4 border-t border-gold/25 pt-6">
                    <Button
                      className={order.step === 1 ? "invisible" : undefined}
                      disabled={order.step === 1}
                      onClick={previous}
                      variant="text-link"
                    >
                      ← Previous
                    </Button>
                    <Button
                      disabled={nextDisabled}
                      onClick={next}
                      variant="solid-forest"
                    >
                      {order.step === 4
                        ? "Review your order"
                        : `Continue to ${stepLabels[order.step]}`}
                    </Button>
                  </div>
                ) : null}
                <button
                  className="mt-4 inline-flex min-h-11 items-center px-1 text-[0.55rem] uppercase tracking-[0.14em] text-muted underline"
                  onClick={() => resetOrderStore()}
                  type="button"
                >
                  Clear this order
                </button>
              </>
            )}
          </div>
          <aside className="sticky top-28 hidden lg:block">
            <OrderSummary />
          </aside>
        </div>
      </Container>
      {!order.submitted ? <MobileSummarySheet /> : null}
    </Section>
  );
}
