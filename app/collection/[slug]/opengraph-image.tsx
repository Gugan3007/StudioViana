import { ImageResponse } from "next/og";

import { getProductBySlug } from "@/lib/data/products";

export const alt = "Studio Viana handcrafted floral collection";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

export default async function ProductOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const product = getProductBySlug((await params).slug);
  const preview =
    product && typeof product.heroImage !== "string"
      ? product.heroImage.blurDataURL
      : undefined;
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#F7F0E6",
        color: "#2A2A26",
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          background: product?.accent ?? "#B8925A",
          display: "flex",
          width: 28,
        }}
      />
      {preview ? (
        <div
          style={{
            backgroundImage: `linear-gradient(rgba(31,51,38,.08), rgba(31,51,38,.18)), url(${preview})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            display: "flex",
            width: 430,
          }}
        />
      ) : null}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 84px",
        }}
      >
        <div style={{ color: "#7A5D33", fontSize: 22, letterSpacing: ".22em" }}>
          STUDIO VIANA · COLLECTION {product?.number ?? ""}
        </div>
        <div
          style={{
            fontFamily: "serif",
            fontSize: 104,
            letterSpacing: "-.045em",
            lineHeight: 0.92,
            marginTop: 28,
            maxWidth: 960,
          }}
        >
          {product?.name ?? "Handcrafted Florals"}
        </div>
        <div style={{ color: "#6B665E", fontSize: 28, marginTop: 38 }}>
          {product?.priceLabel ?? "Made to order"}
        </div>
      </div>
    </div>,
    size,
  );
}
