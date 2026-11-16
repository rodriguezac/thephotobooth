import { describe, expect, it } from "vitest";
import { normalizeRotation, transformStickerGesture } from "./stickerGestures";

const sticker = {
  id: "s",
  assetId: "s",
  src: "sticker.png",
  label: "Sticker",
  x: 0.5,
  y: 0.5,
  width: 0.2,
  aspectRatio: 2,
  rotation: 0,
};
const board = { width: 300, height: 600 };

describe("sticker gesture geometry", () => {
  it("translates with one finger in strip coordinates", () => {
    const value = transformStickerGesture(
      sticker,
      [{ x: 150, y: 300 }],
      [{ x: 180, y: 240 }],
      board,
    );
    expect(value.x).toBeCloseTo(0.6);
    expect(value.y).toBeCloseTo(0.4);
    expect(value.width).toBe(0.2);
    expect(value.rotation).toBe(0);
  });
  it("pinches and rotates around the midpoint on a tall strip", () => {
    const value = transformStickerGesture(
      sticker,
      [
        { x: 100, y: 300 },
        { x: 200, y: 300 },
      ],
      [
        { x: 150, y: 200 },
        { x: 150, y: 400 },
      ],
      board,
    );
    expect(value.width).toBeCloseTo(0.4);
    expect(value.rotation).toBeCloseTo(90);
    expect(value.x).toBeCloseTo(0.5);
    expect(value.y).toBeCloseTo(0.5);
  });
  it("moves the pinch anchor with both fingers instead of jumping to the strip center", () => {
    const value = transformStickerGesture(
      sticker,
      [
        { x: 150, y: 300 },
        { x: 250, y: 300 },
      ],
      [
        { x: 180, y: 360 },
        { x: 380, y: 360 },
      ],
      board,
    );
    expect(value.width).toBeCloseTo(0.4);
    expect(value.x).toBeCloseTo(0.6);
    expect(value.y).toBeCloseTo(0.6);
  });
  it("bounds the scale and handles the angle seam without a full turn", () => {
    const value = transformStickerGesture(
      sticker,
      [
        { x: 140, y: 300 },
        { x: 160, y: 300 },
      ],
      [
        { x: -500, y: 300 },
        { x: 800, y: 300 },
      ],
      board,
    );
    expect(value.width).toBe(0.65);
    expect(normalizeRotation(179 + 2)).toBe(-179);
    expect(normalizeRotation(-181)).toBe(179);
  });
});
