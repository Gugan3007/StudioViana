import { existsSync } from "node:fs";
import { join } from "node:path";

import type { Metadata, Viewport } from "next";
import { Lora, Poppins } from "next/font/google";
import type { ReactNode } from "react";

import { Atmosphere } from "@/components/atmosphere/Atmosphere";
import { GlobalOrderTouchpoints } from "@/components/layout/GlobalOrderTouchpoints";
import { Navbar } from "@/components/layout/Navbar";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { SkipLink } from "@/components/a11y/SkipLink";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { IntroProvider } from "@/lib/context/IntroContext";
import { MotionProvider } from "@/lib/context/MotionContext";
import { OverlayManager } from "@/components/overlay/OverlayManager";

import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Studio Viana — Handcrafted Chenille Florals",
  description: "Flowers that never fade, feelings that never end.",
  icons: { icon: "/brand/logo-placeholder.svg" },
};

export const viewport: Viewport = { themeColor: "#1F3326" };

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const audioAvailable = existsSync(
    join(process.cwd(), "public", "audio", "ambient.mp3"),
  );
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.dataset.js='true'",
          }}
        />
      </head>
      <body className={`${lora.variable} ${poppins.variable}`}>
        <SkipLink />
        <MotionProvider>
          <SmoothScrollProvider>
            <IntroProvider>
              <OverlayManager>
                <Atmosphere audioAvailable={audioAvailable}>
                  <Navbar />
                  {children}
                  <GlobalOrderTouchpoints />
                  <CustomCursor />
                </Atmosphere>
              </OverlayManager>
            </IntroProvider>
          </SmoothScrollProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
