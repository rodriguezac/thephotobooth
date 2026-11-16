import { describe, expect, it } from "vitest";
import { applyPhotoEffect } from "./photoEffects";
import { PhotoFilter } from "../types/photobooth.types";
const ramp = () =>
  new Uint8ClampedArray([
    0, 0, 0, 255, 100, 100, 100, 128, 170, 170, 170, 255, 255, 255, 255, 255,
  ]);
describe("reference-inspired photo effects", () => {
  it("posterizes the full tonal range into four rose colors and preserves transparency", () => {
    const pixels = ramp();
    applyPhotoEffect(pixels, 4, 1, PhotoFilter.RosePop);
    expect([...pixels]).toEqual([
      91, 24, 48, 255, 158, 47, 84, 128, 211, 88, 139, 255, 255, 217, 220, 255,
    ]);
  });
  it("creates black/pink ink and blue/yellow highlights rather than tinting everything one color", () => {
    const ink = ramp();
    applyPhotoEffect(ink, 4, 1, PhotoFilter.PinkInk);
    expect([...ink.slice(0, 3)]).toEqual([17, 16, 24]);
    expect([...ink.slice(12, 15)]).toEqual([193, 108, 147]);
    const moon = ramp();
    applyPhotoEffect(moon, 4, 1, PhotoFilter.BlueMoon);
    expect(moon[6]).toBeGreaterThan(moon[4] * 3);
    expect(moon[12]).toBeGreaterThan(240);
    expect(moon[13]).toBeGreaterThan(240);
    expect(moon[14]).toBeLessThan(170);
  });
  it("keeps sepia warm and the grain stable while leaving existing filters untouched", () => {
    const a = ramp(),
      b = ramp(),
      normal = ramp();
    applyPhotoEffect(a, 4, 1, PhotoFilter.SepiaFilm);
    applyPhotoEffect(b, 4, 1, PhotoFilter.SepiaFilm);
    expect(a).toEqual(b);
    expect(a[8]).toBeGreaterThan(a[9]);
    expect(a[9]).toBeGreaterThan(a[10]);
    expect(a[12]).toBeGreaterThan(a[0]);
    applyPhotoEffect(normal, 4, 1, PhotoFilter.Normal);
    expect(normal).toEqual(ramp());
  });
});
