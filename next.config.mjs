import withBundleAnalyzerFactory from "@next/bundle-analyzer";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const withBundleAnalyzer = withBundleAnalyzerFactory({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

export const phaseSixCachePolicy = {
  editableImages: "public, max-age=604800, stale-while-revalidate=2592000",
  nextStatic: "managed by Next.js as public, max-age=31536000, immutable",
  sequence: "public, max-age=86400, stale-while-revalidate=604800",
};

const scriptSources = ["'self'", "'unsafe-inline'"];
if (process.env.NODE_ENV === "development") scriptSources.push("'unsafe-eval'");

export const phaseSevenSecurityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "base-uri 'self'",
      "connect-src 'self'",
      "default-src 'self'",
      "font-src 'self' data:",
      "form-action 'self' mailto:",
      "frame-ancestors 'none'",
      "img-src 'self' data: blob:",
      "manifest-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      `script-src ${scriptSources.join(" ")}`,
      "style-src 'self' 'unsafe-inline'",
      "worker-src 'self' blob:",
    ].join("; "),
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  devIndicators: false,
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    root: projectRoot,
  },
  async headers() {
    return [
      {
        headers: phaseSevenSecurityHeaders,
        source: "/:path*",
      },
      {
        headers: [
          {
            key: "Cache-Control",
            value: phaseSixCachePolicy.editableImages,
          },
        ],
        source: "/images/:path*",
      },
      {
        headers: [
          {
            key: "Cache-Control",
            value: phaseSixCachePolicy.sequence,
          },
        ],
        source: "/sequence/:path*",
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
