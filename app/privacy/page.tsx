import type { Metadata } from "next";
import Link from "next/link";

import { createPageMetadata } from "@/lib/seo/metadata";

const description =
  "A draft overview of how Studio Viana handles enquiries and order information.";

export const metadata: Metadata = createPageMetadata({
  description,
  path: "/privacy",
  title: "Privacy",
});

export default function PrivacyPage() {
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
          Privacy
        </h1>
        <p className="mt-8 text-lg leading-8 text-muted">{description}</p>
        <div className="mt-12 grid gap-10 leading-8 text-muted">
          <section>
            <h2 className="font-display text-3xl text-charcoal">
              Information we receive
            </h2>
            <p className="mt-3">
              When you enquire or place an order, you may share contact,
              delivery and customisation details needed to prepare and fulfil
              your request.
            </p>
          </section>
          <section>
            <h2 className="font-display text-3xl text-charcoal">
              How it is used
            </h2>
            <p className="mt-3">
              Order information is used to respond, confirm requirements,
              coordinate delivery and support the studio relationship. Final
              retention and processor terms must be confirmed before launch.
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
