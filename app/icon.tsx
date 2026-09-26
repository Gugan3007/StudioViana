import { ImageResponse } from "next/og";

export const size = { height: 32, width: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#1F3326",
        borderRadius: 7,
        color: "#B8925A",
        display: "flex",
        fontFamily: "serif",
        fontSize: 22,
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
