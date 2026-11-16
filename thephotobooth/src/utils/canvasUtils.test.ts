// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateStrip } from "./canvasUtils";
import { PhotoFilter } from "../types/photobooth.types";
import { SOLID_OPTIONS } from "./constants";

const drawImage = vi.fn();
const context = {
  drawImage,
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray([100, 100, 100, 255]),
  })),
  putImageData: vi.fn(),
  save: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  restore: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  filter: "none",
  globalAlpha: 1,
  globalCompositeOperation: "source-over",
  fillStyle: "",
  font: "",
  textAlign: "",
  textBaseline: "",
};
const canvases: HTMLCanvasElement[] = [];
beforeEach(() => {
  drawImage.mockReset();
  context.getImageData.mockClear();
  context.putImageData.mockClear();
  context.save.mockClear();
  context.translate.mockClear();
  context.rotate.mockClear();
  context.scale.mockClear();
  context.restore.mockClear();
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
  it("applies art effects inside photo bounds and keeps frame and stickers outside the pixel effect", async () => {
    await generateStrip(
      [{ dataUrl: "photo", takenAt: 1 }],
      SOLID_OPTIONS[0],
      PhotoFilter.RosePop,
    );
    expect(context.getImageData).toHaveBeenCalledExactlyOnceWith(
      28,
      28,
      600,
      450,
    );
    expect(context.putImageData).toHaveBeenCalledWith(
      expect.objectContaining({
        data: new Uint8ClampedArray([158, 47, 84, 255]),
      }),
      28,
      28,
    );
  });
  it("exports rotation and mirroring around the sticker center", async () => {
    await generateStrip(
      [{ dataUrl: "photo", takenAt: 1 }],
      SOLID_OPTIONS[0],
      PhotoFilter.Normal,
      [
        {
          id: "p",
          assetId: "phone",
          src: "phone.png",
          label: "Phone",
          x: 0.25,
          y: 0.6,
          width: 0.2,
          aspectRatio: 2,
          rotation: 90,
          flipX: true,
          flipY: true,
        },
      ],
    );
    expect(context.save).toHaveBeenCalledOnce();
    expect(context.translate.mock.calls[0][0]).toBeCloseTo(164);
    expect(context.translate.mock.calls[0][1]).toBeCloseTo(363.6);
    expect(context.rotate).toHaveBeenCalledWith(Math.PI / 2);
    expect(context.scale).toHaveBeenCalledWith(-1, -1);
    const last = drawImage.mock.calls[drawImage.mock.calls.length - 1];
    expect(last[1]).toBeCloseTo(-65.6);
    expect(last[2]).toBeCloseTo(-32.8);
    expect(context.restore).toHaveBeenCalledOnce();
  });
  it("exports stickers above the frame at the editor's proportional size and position", async () => {
    const sticker = {
      id: "one",
      assetId: "heart",
      src: "sticker.png",
      label: "Heart",
      x: 0.25,
      y: 0.6,
      width: 0.2,
      aspectRatio: 2,
    };
    await generateStrip(
      [{ dataUrl: "photo", takenAt: 1 }],
      SOLID_OPTIONS[0],
      PhotoFilter.BW,
      [sticker],
    );
    const call = drawImage.mock.calls[drawImage.mock.calls.length - 1];
    expect(call[1]).toBeCloseTo(98.4);
    expect(call[2]).toBeCloseTo(330.8);
    expect(call[3]).toBeCloseTo(131.2);
    expect(call[4]).toBeCloseTo(65.6);
    expect(context.filter).toBe("none");
    expect(context.globalAlpha).toBe(1);
  });
  it("composites 2016 only inside each photo and resets blending before drawing the frame", async () => {
    const layers: {
      args: unknown[];
      filter: string;
      alpha: number;
      blend: string;
    }[] = [];
    drawImage.mockImplementation((...args: unknown[]) =>
      layers.push({
        args,
        filter: context.filter,
        alpha: context.globalAlpha,
        blend: context.globalCompositeOperation,
      }),
    );
    await generateStrip(
      Array.from({ length: 4 }, () => ({ dataUrl: "photo", takenAt: 1 })),
      SOLID_OPTIONS[0],
      PhotoFilter.Year2016,
    );
    const overlays = layers.filter((layer) => layer.args.length === 5);
    expect(overlays.map((layer) => layer.args.slice(1))).toEqual([
      [28, 28, 600, 450],
      [644, 28, 600, 450],
      [28, 494, 600, 450],
      [644, 494, 600, 450],
    ]);
    expect(
      overlays.every(
        (layer) =>
          layer.filter === "none" &&
          layer.alpha === 0.7 &&
          layer.blend === "soft-light",
      ),
    ).toBe(true);
    expect(context.globalAlpha).toBe(1);
    expect(context.globalCompositeOperation).toBe("source-over");
    expect(context.filter).toBe("none");
  });
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
