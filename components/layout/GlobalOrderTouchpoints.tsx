"use client";

import dynamic from "next/dynamic";

import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";

const DynamicOrderBagDrawer = dynamic(
  () =>
    import("@/components/layout/OrderBagDrawer").then(
      (module) => module.OrderBagDrawer,
    ),
  { ssr: false },
);

export function GlobalOrderTouchpoints() {
  return (
    <>
      <FloatingWhatsApp />
      <DynamicOrderBagDrawer />
    </>
  );
}
