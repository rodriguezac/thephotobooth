// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readCustomPattern } from "./customPattern";

const drawImage = vi.fn();
const decode = vi.fn();
const revoke = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  decode.mockResolvedValue(undefined);
  vi.stubGlobal(
    "Image",
    class {
      src = "";
      naturalWidth = 4000;
      naturalHeight = 2000;
      decode = decode;
    },
  );
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:test"),
    revokeObjectURL: revoke,
  });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/png;base64,local-pattern",
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("gallery pattern", () => {
  it("normalizes a large image locally without cropping or stretching and releases its temporary URL", async () => {
    const pattern = await readCustomPattern(
      new File(["image"], "gallery.jpg", { type: "image/jpeg" }),
    );
    expect(pattern).toMatchObject({
      type: "custom",
      name: "gallery.jpg",
      width: 1536,
      height: 768,
      src: "data:image/png;base64,local-pattern",
    });
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1536, 768);
    expect(revoke).toHaveBeenCalledWith("blob:test");
  });
  it("rejects non-images and oversized images before decoding", async () => {
    await expect(
      readCustomPattern(
        new File(["text"], "notes.txt", { type: "text/plain" }),
      ),
    ).rejects.toThrow("Please choose an image");
    await expect(
      readCustomPattern({ type: "image/png", size: 16 * 1024 * 1024 } as File),
    ).rejects.toThrow("smaller than 15 MB");
    expect(decode).not.toHaveBeenCalled();
  });
  it("handles an unsupported or corrupt image without retaining the file URL", async () => {
    decode.mockRejectedValueOnce(new Error("Invalid image"));
    await expect(
      readCustomPattern(new File(["bad"], "bad.png", { type: "image/png" })),
    ).rejects.toThrow("Try a JPG, PNG or WebP");
    expect(revoke).toHaveBeenCalledWith("blob:test");
  });
});
