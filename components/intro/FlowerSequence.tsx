"use client";

import Image from "next/image";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import {
  getCanvasDpr,
  getSequenceLoadOrder,
  introConfig,
} from "@/components/intro/intro.config";
import {
  findNearestLoadedFrame,
  getCoverRect,
} from "@/components/intro/sequenceCanvas";
import {
  takePreloadedImage,
  type PreloadResult,
} from "@/lib/animations/preloadImages";

export interface FlowerSequenceHandle {
  resize(): void;
  setFrame(index: number): void;
}

export interface FlowerSequenceProps {
  frameUrls: readonly string[];
  preloadResult?: PreloadResult;
  focalPoint: { x: number; y: number };
  lowPower?: boolean;
  mobile?: boolean;
}

export const FlowerSequence = forwardRef<
  FlowerSequenceHandle,
  FlowerSequenceProps
>(function FlowerSequence(
  { focalPoint, frameUrls, lowPower = false, mobile = false, preloadResult },
  forwardedRef,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef(new Map<number, HTMLImageElement>());
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const frame = findNearestLoadedFrame(
      framesRef.current,
      currentFrameRef.current,
    );
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !frame) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const rect = getCoverRect({
      sourceWidth: frame.naturalWidth,
      sourceHeight: frame.naturalHeight,
      targetWidth: width,
      targetHeight: height,
      focalX: focalPoint.x / 100,
      focalY: focalPoint.y / 100,
    });

    context.clearRect(0, 0, width, height);
    context.drawImage(frame, rect.x, rect.y, rect.drawWidth, rect.drawHeight);
  }, [focalPoint.x, focalPoint.y]);

  const scheduleDraw = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      draw();
    });
  }, [draw]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const dpr = getCanvasDpr({
      devicePixelRatio: window.devicePixelRatio || 1,
      lowPower,
      mobile,
    });
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    scheduleDraw();
  }, [lowPower, mobile, scheduleDraw]);

  useImperativeHandle(
    forwardedRef,
    () => ({
      resize,
      setFrame(index: number) {
        const maximum = Math.max(0, frameUrls.length - 1);
        currentFrameRef.current = Math.min(
          maximum,
          Math.max(0, Math.round(index)),
        );
        if (canvasRef.current) {
          canvasRef.current.dataset.frame = String(currentFrameRef.current);
        }
        scheduleDraw();
      },
    }),
    [frameUrls.length, resize, scheduleDraw],
  );

  useEffect(() => {
    resize();
    const canvas = canvasRef.current;
    const observer = new ResizeObserver(resize);
    if (canvas?.parentElement) observer.observe(canvas.parentElement);
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [resize]);

  useEffect(() => {
    if (!preloadResult) return;

    let cancelled = false;
    let cursor = 0;
    const frames = framesRef.current;
    const indices = new Map(frameUrls.map((url, index) => [url, index]));
    const availableUrls = getSequenceLoadOrder(
      preloadResult.loaded.filter((url) => indices.has(url)),
    );

    async function load(url: string) {
      const index = indices.get(url);
      if (index === undefined) return;

      const preloadedImage = takePreloadedImage(url);
      if (preloadedImage) {
        frames.set(index, preloadedImage);
        scheduleDraw();
        return;
      }

      const image = new window.Image();
      image.decoding = "async";

      const loaded = await new Promise<boolean>((resolve) => {
        image.addEventListener("load", () => resolve(true), { once: true });
        image.addEventListener("error", () => resolve(false), { once: true });
        image.src = url;
      });

      if (!loaded || cancelled) return;

      try {
        await image.decode?.();
      } catch {
        return;
      }

      if (cancelled) return;
      frames.set(index, image);
      scheduleDraw();
    }

    async function worker() {
      while (!cancelled && cursor < availableUrls.length) {
        const url = availableUrls[cursor++];
        await load(url);
      }
    }

    const workers = lowPower ? 2 : 6;
    for (
      let index = 0;
      index < Math.min(workers, availableUrls.length);
      index += 1
    ) {
      void worker();
    }

    return () => {
      cancelled = true;
      frames.clear();
    };
  }, [frameUrls, lowPower, preloadResult, scheduleDraw]);

  return (
    <div className="absolute inset-0 overflow-hidden" data-intro-sequence>
      <Image
        alt=""
        aria-hidden="true"
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src={introConfig.assets.desktopFlower}
        style={{
          objectPosition: `${focalPoint.x}% ${focalPoint.y}%`,
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        data-frame="0"
        data-intro-sequence-canvas
      />
      <span className="sr-only">
        A close journey through the center of a handcrafted chenille flower.
      </span>
    </div>
  );
});
