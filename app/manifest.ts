import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#F7F0E6",
    description: "Handcrafted chenille florals, made to hold a feeling.",
    display: "standalone",
    icons: [
      { sizes: "any", src: "/icon.svg", type: "image/svg+xml" },
      { sizes: "180x180", src: "/apple-icon", type: "image/png" },
    ],
    name: "Studio Viana",
    short_name: "Viana",
    start_url: "/",
    theme_color: "#1F3326",
  };
}
