import { ImageResponse } from "next/og";

export const alt = "Studio Viana — handcrafted chenille florals";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#1F3326",
        color: "#F7F0E6",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        letterSpacing: "-0.04em",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          border: "1px solid rgba(184,146,90,.6)",
          inset: 36,
          position: "absolute",
        }}
      />
      <div style={{ color: "#B8925A", fontSize: 24, letterSpacing: ".28em" }}>
        CURATED WITH LOVE
      </div>
      <div style={{ fontFamily: "serif", fontSize: 116, marginTop: 24 }}>
        Studio Viana
      </div>
      <div style={{ color: "#D6B98A", fontSize: 29, marginTop: 28 }}>
        Flowers that never fade, feelings that never end.
      </div>
    </div>,
    size,
  );
}
