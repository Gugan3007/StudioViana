"use client";

import { useEffect, useState } from "react";

const finePointerQuery = "(hover: hover) and (pointer: fine)";

export function useFinePointer() {
  const [hasFinePointer, setHasFinePointer] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(finePointerQuery);
    const update = () => setHasFinePointer(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return hasFinePointer;
}
