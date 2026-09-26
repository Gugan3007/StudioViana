"use client";

import { useState } from "react";

import { MandalaMark } from "@/components/decor/MandalaMark";
import { BackToTop } from "@/components/layout/BackToTop";
import { BigWordmark } from "@/components/layout/BigWordmark";
import { catalogueProducts } from "@/lib/data/products";
import { phaseFiveConfig, site } from "@/lib/data/site";
import { openProductDetail } from "@/lib/utils/orderEntry";

const groups = [
  {
    label: "Studio",
    links: [
      ["About", "#about"],
      ["Craft", "#craft-closeup"],
      ["Gallery", "#gallery"],
      ["Testimonials", "#testimonials"],
      ["FAQ", "#faq"],
    ],
  },
  {
    label: "Order",
    links: [
      ["Custom Order", "#order"],
      ["Pricing", "#pricing"],
      ["Corporate & Bulk", "#corporate"],
      ["Download Catalogue", phaseFiveConfig.cataloguePath],
    ],
  },
  {
    label: "Connect",
    links: [
      [site.instagramHandle, site.instagramUrl],
      ["WhatsApp", `https://wa.me/${site.whatsappNumber}`],
      ["Email", `mailto:${site.email}`],
    ],
  },
] as const;

function ProductLinks() {
  return (
    <ul className="mt-4 space-y-2.5">
      {catalogueProducts.map((product) => (
        <li key={product.slug}>
          <button
            aria-label={`View ${product.name}`}
            className="text-left text-sm font-light text-cream/65 transition-colors hover:text-gold-light"
            onClick={(event) =>
              openProductDetail(product.slug, event.currentTarget)
            }
            type="button"
          >
            {product.name}
          </button>
        </li>
      ))}
    </ul>
  );
}

function LinkList({
  links,
}: {
  links: readonly (readonly [string, string])[];
}) {
  return (
    <ul className="mt-4 space-y-2.5">
      {links.map(([label, href]) => (
        <li key={label}>
          <a
            className="text-sm font-light text-cream/65 transition-colors hover:text-gold-light"
            href={href}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            target={href.startsWith("http") ? "_blank" : undefined}
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const newsletterHref = `mailto:${site.email}?subject=${encodeURIComponent("Stay in bloom")}&body=${encodeURIComponent(`Please add ${email || "my email"} to Studio Viana updates.`)}`;
  return (
    <footer
      className="overflow-hidden bg-forest-deep text-cream"
      data-theme="dark"
    >
      <BigWordmark />
      <div className="mx-auto max-w-content px-gutter pb-8 pt-14">
        <div className="text-center">
          <MandalaMark className="mx-auto h-12 w-12 text-gold" />
          <p className="mt-3 font-display text-3xl">Studio Viana</p>
          <p className="mt-1 text-[0.55rem] uppercase tracking-[0.35em] text-gold-light">
            Curated with love
          </p>
        </div>

        <div className="mt-14 hidden grid-cols-4 gap-8 border-y border-gold/20 py-10 md:grid">
          <div>
            <h2 className="text-[0.58rem] uppercase tracking-[0.2em] text-gold-light">
              Collection
            </h2>
            <ProductLinks />
          </div>
          {groups.map((group) => (
            <div key={group.label}>
              <h2 className="text-[0.58rem] uppercase tracking-[0.2em] text-gold-light">
                {group.label}
              </h2>
              <LinkList links={group.links} />
            </div>
          ))}
        </div>

        <div className="mt-12 border-y border-gold/20 md:hidden">
          <details className="border-b border-gold/20" role="group">
            <summary className="flex min-h-14 cursor-pointer items-center justify-between text-xs uppercase tracking-[0.18em] text-gold-light">
              Collection <span>+</span>
            </summary>
            <div className="pb-6">
              <ProductLinks />
            </div>
          </details>
          {groups.map((group) => (
            <details
              key={group.label}
              className="border-b border-gold/20 last:border-0"
              role="group"
            >
              <summary className="flex min-h-14 cursor-pointer items-center justify-between text-xs uppercase tracking-[0.18em] text-gold-light">
                {group.label} <span>+</span>
              </summary>
              <div className="pb-6">
                <LinkList links={group.links} />
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 grid items-end gap-8 border-b border-gold/20 pb-12 md:grid-cols-[.6fr_1.4fr]">
          <h2 className="font-display text-4xl">Stay in bloom</h2>
          <label className="grid gap-2 text-[0.55rem] uppercase tracking-[0.16em] text-gold-light">
            <span>Email for Stay in bloom</span>
            <span className="flex border-b border-gold/55">
              <input
                aria-label="Email for Stay in bloom"
                className="min-h-12 flex-1 bg-transparent text-sm normal-case tracking-normal text-cream placeholder:text-cream/45"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                type="email"
                value={email}
              />
              <a
                aria-label="Join Stay in bloom"
                className="grid min-h-12 w-12 place-items-center text-xl text-gold"
                href={newsletterHref}
              >
                →
              </a>
            </span>
          </label>
        </div>

        <div className="py-12 text-center">
          <p className="font-display text-3xl italic text-cream/90">
            Thank you for visiting
          </p>
          <p className="mt-3 text-[0.58rem] uppercase tracking-[0.2em] text-cream/45">
            {site.secondaryLine}
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-gold/20 pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-[0.58rem] leading-5 tracking-[0.08em] text-cream/50">
            © 2026 Studio Viana · Handcrafted chenille florals · {site.location}
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
