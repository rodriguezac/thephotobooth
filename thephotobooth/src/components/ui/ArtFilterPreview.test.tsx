// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ArtFilterPreview } from "./ArtFilterPreview";
import { PhotoFilter } from "../../types/photobooth.types";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("live art filter", () => {
  it("uses the photo palette on a center crop, limits the frame rate and cancels drawing on unmount", () => {
    const video = document.createElement("video");
    Object.defineProperties(video, {
      readyState: { value: 4 },
      videoWidth: { value: 1600 },
      videoHeight: { value: 900 },
    });
    const pixels = { data: new Uint8ClampedArray([100, 100, 100, 255]) };
    const ctx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => pixels),
      putImageData: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );
    let nextFrame!: FrameRequestCallback;
    let id = 0;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      nextFrame = callback;
      return ++id;
    });
    const cancel = vi
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation(() => {});
    const view = render(
      <ArtFilterPreview
        videoRef={{ current: video }}
        filter={PhotoFilter.RosePop}
        streaming
      />,
    );
    act(() => nextFrame(0));
    expect(ctx.drawImage).toHaveBeenCalledWith(
      video,
      200,
      0,
      1200,
      900,
      0,
      0,
      320,
      240,
    );
    expect([...pixels.data]).toEqual([158, 47, 84, 255]);
    expect(ctx.putImageData).toHaveBeenCalledWith(pixels, 0, 0);
    act(() => nextFrame(10));
    expect(ctx.drawImage).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(cancel).toHaveBeenCalledWith(id);
  });
});
