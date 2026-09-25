"use client";

import Image, { type StaticImageData } from "next/image";
import { type RefObject, useEffect, useRef, useState } from "react";

import { gsap } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";

interface CursorImageFollowProps {
  image: StaticImageData | string;
  targetRef: RefObject<HTMLElement | null>;
}

export function CursorImageFollow({
  image,
  targetRef,
}: CursorImageFollowProps) {
  const preview = useRef<HTMLDivElement>(null);
  const [finePointer, setFinePointer] = useState(false);
  const [visible, setVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const target = targetRef.current;
    const element = preview.current;
    if (!finePointer || shouldReduceMotion || !target || !element) return;

    const moveX = gsap.quickTo(element, "x", {
      duration: 0.45,
      ease: "power3.out",
    });
    const moveY = gsap.quickTo(element, "y", {
      duration: 0.45,
      ease: "power3.out",
    });
    const rotate = gsap.quickTo(element, "rotation", {
      duration: 0.5,
      ease: "power3.out",
    });
    let previousX = 0;

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);
    const onMove = (event: PointerEvent) => {
      const bounds = target.getBoundingClientRect();
      moveX(event.clientX - bounds.left - 96);
      moveY(event.clientY - bounds.top - 120);
      rotate(Math.max(-6, Math.min(6, (event.clientX - previousX) * 0.2)));
      previousX = event.clientX;
    };

    target.addEventListener("pointerenter", onEnter);
    target.addEventListener("pointerleave", onLeave);
    target.addEventListener("pointermove", onMove);
    return () => {
      target.removeEventListener("pointerenter", onEnter);
      target.removeEventListener("pointerleave", onLeave);
      target.removeEventListener("pointermove", onMove);
    };
  }, [finePointer, shouldReduceMotion, targetRef]);

  if (!finePointer || shouldReduceMotion) return null;

  return (
    <div
      ref={preview}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-20 h-60 w-48 overflow-hidden border border-gold/60 bg-cream shadow-soft transition-opacity duration-300"
      data-cursor-preview
      data-visible={visible}
      style={{ opacity: visible ? 1 : 0 }}
    >
      <Image
        fill
        alt=""
        className="object-cover"
        placeholder={typeof image === "string" ? undefined : "blur"}
        sizes="192px"
        src={image}
      />
    </div>
  );
}
