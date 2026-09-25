import { ImageReveal } from "@/components/animations/ImageReveal";
import { Reveal } from "@/components/animations/Reveal";
import { SplitTextReveal } from "@/components/animations/SplitTextReveal";
import { MagnoliaLineArt } from "@/components/decor/MagnoliaLineArt";
import { ValuesStrip } from "@/components/sections/home/ValuesStrip";
import { WordScrubText } from "@/components/sections/home/WordScrubText";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { SectionLabel } from "@/components/ui/SectionLabel";
import lilacPearlDome from "@/public/images/products/lilac-pearl-dome.jpg";

const firstParagraph =
  "At Studio Viana, we believe every gift should tell a story. Each bloom that leaves our hands is shaped stem by stem, petal by petal — never printed, never mass-produced.";

const secondParagraph =
  "Our handcrafted chenille flowers are thoughtfully designed to make your most treasured moments even more beautiful, and to stay that way — long after fresh flowers would have wilted.";

export function AboutStudio() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="scroll-mt-[84px] bg-cream text-charcoal"
    >
      <div className="grid lg:grid-cols-[45%_55%]">
        <div className="relative min-h-[70svh] overflow-hidden lg:min-h-[58rem]">
          <ImageReveal
            alt="Lilac and pearl handcrafted chenille bouquet in an ivory ceramic vase"
            className="absolute inset-0 aspect-auto h-full w-full"
            direction="top"
            imageClassName="object-[50%_48%]"
            parallaxSpeed={0.15}
            placeholder="blur"
            sizes="(min-width: 1024px) 45vw, 100vw"
            src={lilacPearlDome}
          />
          <span className="absolute bottom-5 left-5 z-10 bg-forest/80 px-4 py-2 text-[0.58rem] uppercase tracking-[0.24em] text-cream backdrop-blur-md sm:bottom-8 sm:left-8">
            The Grand Bouquet
          </span>
        </div>

        <div className="relative overflow-hidden px-gutter py-[clamp(5rem,10vw,9rem)] lg:flex lg:min-h-[58rem] lg:items-center lg:px-[clamp(4rem,7vw,8rem)]">
          <div className="relative z-10 max-w-[42rem]">
            <span
              aria-hidden="true"
              className="block h-16 font-display text-[5.5rem] leading-none text-gold"
            >
              “
            </span>
            <SectionLabel className="mt-2">About the Studio</SectionLabel>
            <div className="mt-7">
              <SplitTextReveal
                as="h2"
                className="font-display text-[clamp(2.55rem,4.4vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.04em] text-charcoal"
                id="about-heading"
                type="lines"
              >
                {"Where flowers become\nforever memories."}
              </SplitTextReveal>
            </div>
            <GoldDivider animate className="mt-9" />

            <div className="mt-9 grid max-w-[39rem] gap-6 text-[0.98rem] font-light leading-8 text-muted">
              <WordScrubText>{firstParagraph}</WordScrubText>
              <WordScrubText>{secondParagraph}</WordScrubText>
            </div>

            <Reveal className="mt-10 w-fit">
              <p className="font-display text-2xl italic text-charcoal">
                Dr. Sadhana
              </p>
              <svg
                aria-hidden="true"
                className="mt-1 h-3 w-44 text-gold"
                viewBox="0 0 180 12"
              >
                <path
                  d="M3 8C49 1 112 2 176 7"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
              <p className="mt-2 text-[0.6rem] uppercase tracking-[0.26em] text-muted">
                FOUNDER, STUDIO VIANA
              </p>
            </Reveal>
          </div>

          <MagnoliaLineArt className="pointer-events-none absolute -bottom-10 -right-10 w-[clamp(15rem,30vw,27rem)] opacity-30" />
        </div>
      </div>

      <ValuesStrip />
    </section>
  );
}
