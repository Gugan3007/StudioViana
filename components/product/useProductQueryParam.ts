"use client";

import { useCallback, useEffect, useState } from "react";

import { getProductBySlug } from "@/lib/data/products";

function readProductParam() {
  if (typeof window === "undefined") return null;
  const candidate = new URLSearchParams(window.location.search).get("product");
  return getProductBySlug(candidate)?.slug ?? null;
}

function writeProductParam(slug: string | null, mode: "push" | "replace") {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set("product", slug);
  else url.searchParams.delete("product");
  window.history[mode === "push" ? "pushState" : "replaceState"](
    { ...window.history.state, studioVianaProduct: slug },
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

export function useProductQueryParam() {
  const [productSlug, setProductSlug] = useState<string | null>(
    readProductParam,
  );

  useEffect(() => {
    const syncFromLocation = () => {
      const next = readProductParam();
      const raw = new URLSearchParams(window.location.search).get("product");
      if (raw && !next) writeProductParam(null, "replace");
      setProductSlug(next);
    };
    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, []);

  const openProduct = useCallback((slug: string) => {
    const valid = getProductBySlug(slug)?.slug;
    if (!valid) return;
    writeProductParam(valid, "push");
    setProductSlug(valid);
  }, []);

  const replaceProduct = useCallback((slug: string) => {
    const valid = getProductBySlug(slug)?.slug;
    if (!valid) return;
    writeProductParam(valid, "replace");
    setProductSlug(valid);
  }, []);

  const closeProduct = useCallback(() => {
    writeProductParam(null, "replace");
    setProductSlug(null);
  }, []);

  return { closeProduct, openProduct, productSlug, replaceProduct };
}
