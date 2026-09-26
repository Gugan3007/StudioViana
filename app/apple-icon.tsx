import { ImageResponse } from "next/og";

export const size = { height: 180, width: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#1F3326",
        borderRadius: 38,
        color: "#B8925A",
        display: "flex",
        fontFamily: "serif",
        fontSize: 112,
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      V
    </div>,
    size,
  );
}
