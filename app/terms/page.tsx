import type { Metadata } from "next";
import Link from "next/link";

import { createPageMetadata } from "@/lib/seo/metadata";

const description =
  "Draft order, customisation and delivery terms for Studio Viana handcrafted florals.";

export const metadata: Metadata = createPageMetadata({
  description,
  path: "/terms",
  title: "Terms",
});

export default function TermsPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-cream px-gutter pb-24 pt-32 text-charcoal"
      tabIndex={-1}
    >
      <article className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[#7a5d33]">
          Draft · legal review required
        </p>
        <h1 className="mt-5 font-display text-[clamp(3.5rem,8vw,7rem)] leading-none">
          Terms
        </h1>
        <p className="mt-8 text-lg leading-8 text-muted">{description}</p>
        <div className="mt-12 grid gap-10 leading-8 text-muted">
          <section>
            <h2 className="font-display text-3xl text-charcoal">
              Made to order
            </h2>
            <p className="mt-3">
              Colours, flower forms and finishes are handcrafted. Small
              variations are part of the character of each piece and final
              requirements are confirmed before work begins.
            </p>
          </section>
          <section>
            <h2 className="font-display text-3xl text-charcoal">
              Payment and delivery
            </h2>
            <p className="mt-3">
              Final payment, cancellation, lead-time and delivery policies
              require owner confirmation before these draft terms are used for
              launch.
            </p>
          </section>
        </div>
        <Link
          className="body-link mt-14 inline-flex min-h-12 items-center"
          href="/"
        >
          ← Return to Studio Viana
        </Link>
      </article>
    </main>
  );
}
