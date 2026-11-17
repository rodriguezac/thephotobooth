import { describe, expect, it } from "vitest";
import { applyColorFilter } from "./colorFilters";
import { FILTER_OPTIONS } from "./constants";
import { PhotoFilter } from "../types/photobooth.types";

describe("portable photo color filters", () => {
  it("turns colored pixels into equal B&W channels and preserves alpha", () => {
    const pixels = new Uint8ClampedArray([220, 90, 35, 128, 20, 150, 230, 255]);
    applyColorFilter(pixels, FILTER_OPTIONS.find(f => f.value === PhotoFilter.BW)!.cssFilter);
    expect([...pixels]).toEqual([112, 112, 112, 128, 128, 128, 128, 255]);
  });
  it("applies sepia before contrast and brightness with warm golden tones", () => {
    const pixels = new Uint8ClampedArray([220, 90, 35, 128]);
    applyColorFilter(pixels, FILTER_OPTIONS.find(f => f.value === PhotoFilter.Sepia)!.cssFilter);
    expect([...pixels]).toEqual([187, 141, 99, 128]);
  });
  it.each([PhotoFilter.Sepia, PhotoFilter.BW, PhotoFilter.Vintage, PhotoFilter.Cool, PhotoFilter.Year2016])(
    "changes colored photo pixels for %s without touching transparency",
    filter => {
      const original = new Uint8ClampedArray([220, 90, 35, 64, 20, 150, 230, 255]);
      const pixels = original.slice();
      applyColorFilter(pixels, FILTER_OPTIONS.find(f => f.value === filter)!.cssFilter);
      expect(pixels).not.toEqual(original);
      expect(pixels[3]).toBe(64);
      expect(pixels[7]).toBe(255);
    },
  );
  it("keeps normal unchanged and clamps highlights and shadows", () => {
    const pixels = new Uint8ClampedArray([100, 150, 200, 128]);
    applyColorFilter(pixels, "none");
    expect([...pixels]).toEqual([100, 150, 200, 128]);
    applyColorFilter(pixels, "contrast(10)");
    expect([...pixels]).toEqual([0, 255, 255, 128]);
  });
});
