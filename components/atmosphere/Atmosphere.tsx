"use client";

import type { ReactNode } from "react";

import { AmbientAudio } from "@/components/atmosphere/AmbientAudio";
import { DynamicThemeColor } from "@/components/atmosphere/DynamicThemeColor";
import { FilmGrain } from "@/components/atmosphere/FilmGrain";
import { ScrollProgress } from "@/components/atmosphere/ScrollProgress";

interface AtmosphereProps {
  audioAvailable: boolean;
  children?: ReactNode;
}

function AtmosphereLayers({ children }: { children?: ReactNode }) {
  return (
    <>
      {children}
      <FilmGrain />
      <ScrollProgress />
      <DynamicThemeColor />
    </>
  );
}

export function Atmosphere({ audioAvailable, children }: AtmosphereProps) {
  if (!audioAvailable) return <AtmosphereLayers>{children}</AtmosphereLayers>;
  return (
    <AmbientAudio>
      <AtmosphereLayers>{children}</AtmosphereLayers>
    </AmbientAudio>
  );
}
