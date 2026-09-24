export interface CoverRectInput {
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
  focalX: number;
  focalY: number;
}

export interface CoverRect {
  x: number;
  y: number;
  drawWidth: number;
  drawHeight: number;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function getCoverRect({
  sourceWidth,
  sourceHeight,
  targetWidth,
  targetHeight,
  focalX,
  focalY,
}: CoverRectInput): CoverRect {
  if (
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    targetWidth <= 0 ||
    targetHeight <= 0
  ) {
    return { x: 0, y: 0, drawWidth: 0, drawHeight: 0 };
  }

  const scale = Math.max(
    targetWidth / sourceWidth,
    targetHeight / sourceHeight,
  );
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const overflowX = Math.max(0, drawWidth - targetWidth);
  const overflowY = Math.max(0, drawHeight - targetHeight);

  return {
    x: -overflowX * clamp(focalX, 0, 1),
    y: -overflowY * clamp(focalY, 0, 1),
    drawWidth,
    drawHeight,
  };
}

export function findNearestLoadedFrame<T>(
  frames: ReadonlyMap<number, T>,
  requestedIndex: number,
): T | null {
  const exact = frames.get(requestedIndex);
  if (exact !== undefined) return exact;

  let nearestIndex: number | null = null;

  for (const index of frames.keys()) {
    if (
      nearestIndex === null ||
      Math.abs(index - requestedIndex) <
        Math.abs(nearestIndex - requestedIndex) ||
      (Math.abs(index - requestedIndex) ===
        Math.abs(nearestIndex - requestedIndex) &&
        index < nearestIndex)
    ) {
      nearestIndex = index;
    }
  }

  return nearestIndex === null ? null : (frames.get(nearestIndex) ?? null);
}
