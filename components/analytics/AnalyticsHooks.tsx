"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Provider-neutral seam for launch analytics. It sends nothing until the owner
 * installs a consented analytics client that defines `window.dataLayer`.
 */
export function AnalyticsHooks() {
  useEffect(() => {
    const capture = (event: Event) => {
      if (!window.dataLayer) return;
      window.dataLayer.push({
        event: "studio_viana",
        ...((event as CustomEvent<Record<string, unknown>>).detail ?? {}),
      });
    };
    window.addEventListener("studio-viana:analytics", capture);
    return () => window.removeEventListener("studio-viana:analytics", capture);
  }, []);
  return null;
}
