import type { PlacedSticker } from "../types/photobooth.types";

export type GesturePoint = { x: number; y: number };
export const MIN_STICKER_WIDTH = 0.08;
export const MAX_STICKER_WIDTH = 0.65;
export const clampUnit = (value: number) => Math.max(0, Math.min(1, value));
export const normalizeRotation = (degrees: number) =>
  ((((degrees + 180) % 360) + 360) % 360) - 180;

export function transformStickerGesture(
  sticker: PlacedSticker,
  start: GesturePoint[],
  current: GesturePoint[],
  board: { width: number; height: number },
) {
  const rotation = sticker.rotation ?? 0;
  if (start.length < 2 || current.length < 2) {
    return {
      x: clampUnit(sticker.x + (current[0].x - start[0].x) / board.width),
      y: clampUnit(sticker.y + (current[0].y - start[0].y) / board.height),
      width: sticker.width,
      rotation,
    };
  }
  const initialVector = {
    x: start[1].x - start[0].x,
    y: start[1].y - start[0].y,
  };
  const vector = {
    x: current[1].x - current[0].x,
    y: current[1].y - current[0].y,
  };
  const initialDistance = Math.hypot(initialVector.x, initialVector.y);
  const scale =
    initialDistance > 4 ? Math.hypot(vector.x, vector.y) / initialDistance : 1;
  const width = Math.max(
    MIN_STICKER_WIDTH,
    Math.min(MAX_STICKER_WIDTH, sticker.width * scale),
  );
  const effectiveScale = width / sticker.width;
  const angle =
    initialDistance > 4
      ? Math.atan2(vector.y, vector.x) -
        Math.atan2(initialVector.y, initialVector.x)
      : 0;
  const initialMidpoint = {
    x: (start[0].x + start[1].x) / 2,
    y: (start[0].y + start[1].y) / 2,
  };
  const midpoint = {
    x: (current[0].x + current[1].x) / 2,
    y: (current[0].y + current[1].y) / 2,
  };
  // Keep the point between the fingers anchored while scaling/rotating in screen pixels.
  const offset = {
    x: sticker.x * board.width - initialMidpoint.x,
    y: sticker.y * board.height - initialMidpoint.y,
  };
  return {
    x: clampUnit(
      (midpoint.x +
        effectiveScale *
          (Math.cos(angle) * offset.x - Math.sin(angle) * offset.y)) /
        board.width,
    ),
    y: clampUnit(
      (midpoint.y +
        effectiveScale *
          (Math.sin(angle) * offset.x + Math.cos(angle) * offset.y)) /
        board.height,
    ),
    width,
    rotation: normalizeRotation(rotation + (angle * 180) / Math.PI),
  };
}
