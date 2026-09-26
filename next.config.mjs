import withBundleAnalyzerFactory from "@next/bundle-analyzer";

const withBundleAnalyzer = withBundleAnalyzerFactory({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

export const phaseSixCachePolicy = {
  editableImages: "public, max-age=604800, stale-while-revalidate=2592000",
  nextStatic: "managed by Next.js as public, max-age=31536000, immutable",
  sequence: "public, max-age=86400, stale-while-revalidate=604800",
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  async headers() {
    return [
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
