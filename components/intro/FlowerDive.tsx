import Image from "next/image";

import { introConfig } from "@/components/intro/intro.config";

export interface FlowerDiveProps {
  mobile?: boolean;
  petalLayers: 1 | 2;
  showMiddleLayer: boolean;
}

const flowerBlur =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxZjMzMjYiLz48L3N2Zz4=";

export function FlowerDive({
  mobile = false,
  petalLayers,
  showMiddleLayer,
}: FlowerDiveProps) {
  const flowerSource = mobile
    ? introConfig.assets.mobileFlower
    : introConfig.assets.desktopFlower;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-intro-dive
    >
      <div
        className="absolute inset-0 overflow-hidden [clip-path:circle(0%_at_50%_50%)]"
        data-intro-flower-mask
      >
        <Image
          alt="Macro handcrafted chenille flower"
          blurDataURL={flowerBlur}
          className="object-cover"
          data-intro-flower
          fill
          placeholder="blur"
          priority
          sizes="100vw"
          src={flowerSource}
          style={{
            objectPosition: `${introConfig.focalPoint.x}% ${introConfig.focalPoint.y}%`,
            transformOrigin: `${introConfig.focalPoint.x}% ${introConfig.focalPoint.y}%`,
          }}
        />

        {showMiddleLayer ? (
          <Image
            alt=""
            aria-hidden="true"
            className="object-cover opacity-0 blur-md"
            data-intro-middle
            data-testid="flower-middle-layer"
            fill
            sizes="100vw"
            src={flowerSource}
            style={{
              objectPosition: `${introConfig.focalPoint.x}% ${introConfig.focalPoint.y}%`,
              transformOrigin: `${introConfig.focalPoint.x}% ${introConfig.focalPoint.y}%`,
            }}
          />
        ) : null}

        {introConfig.assets.petals
          .slice(0, petalLayers)
          .map((source, index) => (
            <Image
              key={source}
              alt=""
              aria-hidden="true"
              className="object-cover"
              data-intro-petal
              data-petal-depth={index + 1}
              data-testid="petal-layer"
              fill
              sizes="100vw"
              src={source}
            />
          ))}
      </div>

      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[36vmin] w-[36vmin] -translate-x-1/2 -translate-y-1/2 overflow-visible"
        data-intro-ring
      >
        <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            fill="none"
            r="48"
            stroke="var(--gold-light)"
            strokeDasharray="302"
            strokeDashoffset="302"
            strokeWidth="0.45"
          />
        </svg>
      </div>

      <blockquote
        aria-label="The making of forever"
        className="absolute inset-0 z-20 flex items-center justify-center text-center"
      >
        {introConfig.poem.map((line) => (
          <p
            key={line}
            className="absolute max-w-[85vw] font-display text-[clamp(1.55rem,4vw,4rem)] italic leading-tight text-cream opacity-0 [text-shadow:0_2px_22px_rgba(22,36,27,0.42)]"
            data-intro-poem-line
            data-testid="poem-line"
          >
            {line.split(/(\s+)/).map((word, index) =>
              /^\s+$/.test(word) ? (
                word
              ) : (
                <span
                  key={`${word}-${index}`}
                  className="inline-block"
                  data-intro-poem-word
                >
                  {word}
                </span>
              ),
            )}
          </p>
        ))}
      </blockquote>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,transparent_28%,rgba(10,20,14,0.68)_100%)] opacity-0"
        data-intro-vignette
      />
    </div>
  );
}
