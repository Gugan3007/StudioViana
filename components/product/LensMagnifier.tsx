"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";

import { gsap } from "@/lib/animations/gsap";
import { useFinePointer } from "@/lib/animations/useFinePointer";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import type { ProductImage } from "@/lib/data/products";
import { setCursorState } from "@/lib/store/cursorStore";
import { cn } from "@/lib/utils";

interface LensMagnifierProps {
  children: ReactNode;
  image: ProductImage;
}

export function LensMagnifier({ children, image }: LensMagnifierProps) {
  const root = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const hasFinePointer = useFinePointer();
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [staticZoom, setStaticZoom] = useState(false);
  const source = typeof image === "string" ? image : image.src;

  useIsomorphicLayoutEffect(() => {
    if (!hasFinePointer || shouldReduceMotion || !lens.current) return;
    // quickTo owns the lens transform so pointer movement never causes React
    // renders. Background position is written directly from local percentages.
    const moveX = gsap.quickTo(lens.current, "x", {
      duration: 0.22,
      ease: "power3.out",
    });
    const moveY = gsap.quickTo(lens.current, "y", {
      duration: 0.22,
      ease: "power3.out",
    });
    const handleMove = (event: PointerEvent) => {
      if (!root.current || !lens.current) return;
      const bounds = root.current.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const renderedImage = root.current.querySelector("img");
      const sourceWidth =
        typeof image === "string"
          ? renderedImage?.naturalWidth || bounds.width
          : image.width;
      const sourceHeight =
        typeof image === "string"
          ? renderedImage?.naturalHeight || bounds.height
          : image.height;
      const coverScale = Math.max(
        bounds.width / sourceWidth,
        bounds.height / sourceHeight,
      );
      const renderedWidth = sourceWidth * coverScale;
      const renderedHeight = sourceHeight * coverScale;
      const cropX = (renderedWidth - bounds.width) / 2;
      const cropY = (renderedHeight - bounds.height) / 2;
      const zoom = 2.2;
      const lensRadius = lens.current.offsetWidth / 2 || 88;
      moveX(x - 88);
      moveY(y - 88);
      lens.current.style.backgroundSize = `${renderedWidth * zoom}px ${renderedHeight * zoom}px`;
      lens.current.style.backgroundPosition = `${lensRadius - (x + cropX) * zoom}px ${lensRadius - (y + cropY) * zoom}px`;
    };
    const element = root.current;
    element?.addEventListener("pointermove", handleMove);
    return () => element?.removeEventListener("pointermove", handleMove);
  }, [hasFinePointer, image, shouldReduceMotion]);

  return (
    <div
      ref={root}
      className="relative h-full w-full overflow-hidden"
      data-cursor={hasFinePointer && !shouldReduceMotion ? "zoom" : "view"}
      onClick={() => {
        if (shouldReduceMotion || !hasFinePointer) {
          setStaticZoom((current) => !current);
        }
      }}
      onPointerEnter={() => {
        if (!hasFinePointer || shouldReduceMotion) return;
        setVisible(true);
        setCursorState("zoom");
      }}
      onPointerLeave={() => {
        setVisible(false);
        setCursorState("default");
      }}
    >
      <div
        className={cn(
          "h-full w-full transition-transform duration-500",
          staticZoom && "scale-[1.35]",
        )}
      >
        {children}
      </div>
      {hasFinePointer && !shouldReduceMotion ? (
        <div
          ref={lens}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-20 h-44 w-44 rounded-full border border-gold bg-cream shadow-soft transition-opacity duration-200"
          data-lens
          style={{
            backgroundImage: `url("${source}")`,
            backgroundRepeat: "no-repeat",
            opacity: visible ? 1 : 0,
          }}
        />
      ) : null}
    </div>
  );
}
