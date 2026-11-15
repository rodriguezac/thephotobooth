// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateStrip } from "./canvasUtils";
import { PhotoFilter } from "../types/photobooth.types";
import { SOLID_OPTIONS } from "./constants";

const drawImage = vi.fn();
const context = {
  drawImage,
  fillRect: vi.fn(),
  fillText: vi.fn(),
  filter: "none",
  fillStyle: "",
  font: "",
  textAlign: "",
  textBaseline: "",
};
const canvases: HTMLCanvasElement[] = [];
beforeEach(() => {
  drawImage.mockClear();
  canvases.length = 0;
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: Promise.resolve() },
  });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function (this: HTMLCanvasElement) {
      canvases.push(this);
      return context as unknown as CanvasRenderingContext2D;
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/png;base64,test",
  );
  vi.stubGlobal(
    "Image",
    class {
      width = 1200;
      height = 900;
      onload: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    },
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("strip export", () => {
  it.each([1, 2, 3, 4])(
    "exports all %i photos in the selected layout without stretching",
    async (count) => {
      const photos = Array.from({ length: count }, () => ({
        dataUrl: "data:image/jpeg;base64,photo",
        takenAt: 1,
      }));
      expect(
        await generateStrip(photos, SOLID_OPTIONS[0], PhotoFilter.Normal),
      ).toBe("data:image/png;base64,test");
      expect(drawImage).toHaveBeenCalledTimes(count);
      expect(canvases[0].width).toBe(count === 4 ? 1272 : 656);
      const expectedRows = count === 4 ? 2 : count;
      expect(canvases[0].height).toBe(
        expectedRows * 450 + 56 + (expectedRows - 1) * 16 + 100,
      );
      for (const call of drawImage.mock.calls)
        expect(call.slice(-2)).toEqual([600, 450]);
      if (count === 4) {
        expect(drawImage.mock.calls.map((call) => call.slice(5, 7))).toEqual([
          [28, 28],
          [644, 28],
          [28, 494],
          [644, 494],
        ]);
      }
    },
  );
  it("applies the selected filter to every photo, then resets it for the branding", async () => {
    const filters: string[] = [];
    drawImage.mockImplementation(() => filters.push(context.filter));
    await generateStrip(
      [
        { dataUrl: "photo", takenAt: 1 },
        { dataUrl: "photo", takenAt: 2 },
      ],
      SOLID_OPTIONS[0],
      PhotoFilter.BW,
    );
    expect(filters).toEqual([
      "grayscale(100%) contrast(1.15)",
      "grayscale(100%) contrast(1.15)",
    ]);
    expect(context.filter).toBe("none");
  });
});
