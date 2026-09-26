"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { SectionDivider } from "@/components/decor/SectionDivider";
import { Footer } from "@/components/layout/Footer";
import { PricingSection } from "@/components/sections/pricing/PricingSection";

const loadOrderBuilder = () =>
  import("@/components/sections/order/OrderBuilder");
const loadCorporate = () =>
  import("@/components/sections/corporate/CorporateSection");
const loadFAQ = () => import("@/components/sections/faq/FAQSection");
const loadContact = () =>
  import("@/components/sections/contact/ContactSection");

export function PhaseFiveLoadingShell({
  id,
  label,
  theme = "light",
}: {
  id: string;
  label: string;
  theme?: "dark" | "light";
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className={
        theme === "dark" ? "min-h-[52rem] bg-forest" : "min-h-[52rem] bg-cream"
      }
      data-theme={theme}
      data-phase-five-loading
    >
      <span className="sr-only">{label}</span>
    </section>
  );
}

const DynamicOrderBuilder = dynamic(
  () => loadOrderBuilder().then((module) => module.OrderBuilder),
  {
    loading: () => (
      <PhaseFiveLoadingShell id="order" label="Loading order builder" />
    ),
  },
);
const DynamicCorporateSection = dynamic(
  () => loadCorporate().then((module) => module.CorporateSection),
  {
    loading: () => (
      <PhaseFiveLoadingShell
        id="corporate"
        label="Loading corporate enquiries"
        theme="dark"
      />
    ),
  },
);
const DynamicFAQSection = dynamic(
  () => loadFAQ().then((module) => module.FAQSection),
  {
    loading: () => <PhaseFiveLoadingShell id="faq" label="Loading questions" />,
  },
);
const DynamicContactSection = dynamic(
  () => loadContact().then((module) => module.ContactSection),
  {
    loading: () => (
      <PhaseFiveLoadingShell
        id="contact"
        label="Loading contact"
        theme="dark"
      />
    ),
  },
);

export function PhaseFiveSections() {
  const [interactiveReady, setInteractiveReady] = useState(false);
  const preloadMarker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const marker = preloadMarker.current;
    let cancelled = false;
    let activationStarted = false;
    const activate = () => {
      if (activationStarted) return;
      activationStarted = true;
      void Promise.all([
        loadOrderBuilder(),
        loadCorporate(),
        loadFAQ(),
        loadContact(),
      ]).then(() => {
        if (!cancelled) setInteractiveReady(true);
      });
    };
    if (!marker || typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(activate);
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        // Warm the separated client chunks before the visitor reaches the
        // conversion flow while preserving SSR content and stable shell sizes.
        activate();
        observer.disconnect();
      },
      { rootMargin: "1200px 0px" },
    );
    observer.observe(marker);
    // A browser can restore the page directly to Order, FAQ, or Contact after
    // reload. Observing every reserved shell makes that deep position just as
    // reliable as approaching the flow from Pricing.
    document
      .querySelectorAll<HTMLElement>("[data-phase-five-loading]")
      .forEach((shell) => observer.observe(shell));
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <span ref={preloadMarker} aria-hidden="true" className="block h-px" />
      <PricingSection />
      {interactiveReady ? (
        <DynamicOrderBuilder />
      ) : (
        <PhaseFiveLoadingShell id="order" label="Loading order builder" />
      )}
      <SectionDivider from="cream" to="forest" />
      {interactiveReady ? (
        <DynamicCorporateSection />
      ) : (
        <PhaseFiveLoadingShell
          id="corporate"
          label="Loading corporate enquiries"
          theme="dark"
        />
      )}
      <SectionDivider from="forest" to="cream" />
      {interactiveReady ? (
        <DynamicFAQSection />
      ) : (
        <PhaseFiveLoadingShell id="faq" label="Loading questions" />
      )}
      <SectionDivider from="cream" to="forest" />
      {interactiveReady ? (
        <DynamicContactSection />
      ) : (
        <PhaseFiveLoadingShell
          id="contact"
          label="Loading contact"
          theme="dark"
        />
      )}
      <Footer />
    </>
  );
}
