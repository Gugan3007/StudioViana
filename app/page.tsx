import { IntroSection } from "@/components/intro/IntroSection";
import { SectionDivider } from "@/components/decor/SectionDivider";
import { CollectionSection } from "@/components/sections/collection/CollectionSection";
import { ProcessSection } from "@/components/sections/craft/ProcessSection";
import { UpClose } from "@/components/sections/craft/UpClose";
import { GallerySection } from "@/components/sections/gallery/GallerySection";
import { AboutStudio } from "@/components/sections/home/AboutStudio";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { WhatWeDo } from "@/components/sections/home/WhatWeDo";
import { InstagramStrip } from "@/components/sections/instagram/InstagramStrip";
import { VelocityMarquee } from "@/components/sections/instagram/VelocityMarquee";
import { PhaseFiveSections } from "@/components/sections/phase-five/PhaseFiveSections";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";
import { faqItems } from "@/lib/data/faq";
import { catalogueProducts } from "@/lib/data/products";
import { createStructuredData } from "@/lib/seo/schema";

export default function Home() {
  const structuredData = createStructuredData(catalogueProducts, faqItems);
  return (
    <main className="overflow-clip">
      {structuredData.map((entry, index) => (
        <script
          key={`${String(entry["@type"])}-${index}`}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(entry).replace(/</g, "\\u003c"),
          }}
          type="application/ld+json"
        />
      ))}
      <IntroSection />
      <HomeHero />
      <AboutStudio />
      <WhatWeDo />
      <CollectionSection />
      <UpClose />
      <SectionDivider from="forest" to="cream" />
      <ProcessSection />
      <GallerySection />
      <Testimonials />
      <InstagramStrip />
      <VelocityMarquee />
      <PhaseFiveSections />
    </main>
  );
}
