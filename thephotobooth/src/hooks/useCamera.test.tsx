// @vitest-environment jsdom
import { StrictMode } from "react";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCamera } from "./useCamera";

let camera: ReturnType<typeof useCamera>;
function Camera() {
  camera = useCamera();
  return <video ref={camera.videoRef} onPlaying={camera.onPlaying} />;
}
function mockStream() {
  const track = { stop: vi.fn(), onended: null };
  return {
    active: true,
    getTracks: () => [track],
    getVideoTracks: () => [track],
    track,
  };
}
let getUserMedia: ReturnType<typeof vi.fn>;
beforeEach(() => {
  getUserMedia = vi.fn();
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", {
    configurable: true,
    get: () => 1280,
  });
  Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", {
    configurable: true,
    get: () => 960,
  });
  Object.defineProperty(HTMLMediaElement.prototype, "readyState", {
    configurable: true,
    get: () => 4,
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("camera lifecycle", () => {
  it("stops an obsolete permission response during StrictMode remount and releases the active stream", async () => {
    let resolveOld!: (value: unknown) => void;
    const old = mockStream();
    const active = mockStream();
    getUserMedia
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockResolvedValueOnce(active);
    const view = render(
      <StrictMode>
        <Camera />
      </StrictMode>,
    );
    await waitFor(() => expect(camera.isStreaming).toBe(true));
    await act(async () => resolveOld(old));
    expect(old.track.stop).toHaveBeenCalledOnce();
    expect(view.container.querySelector("video")?.srcObject).toBe(active);
    view.unmount();
    expect(active.track.stop).toHaveBeenCalledOnce();
  });
  it("releases a stream whose permission arrived after leaving the screen", async () => {
    let resolve!: (value: unknown) => void;
    const stream = mockStream();
    getUserMedia.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const view = render(<Camera />);
    view.unmount();
    await act(async () => resolve(stream));
    expect(stream.track.stop).toHaveBeenCalledOnce();
  });
  it("reports denied permissions and can retry successfully", async () => {
    getUserMedia.mockRejectedValueOnce(
      new DOMException("denied", "NotAllowedError"),
    );
    render(<Camera />);
    await waitFor(() => expect(camera.error).toContain("Camera permission denied"));
    expect(camera.isStreaming).toBe(false);
    const stream = mockStream();
    getUserMedia.mockResolvedValueOnce(stream);
    await act(async () => camera.startCamera());
    expect(camera.isStreaming).toBe(true);
    expect(camera.error).toBe(null);
  });
  it("does not capture before the video has dimensions", async () => {
    getUserMedia.mockResolvedValue(mockStream());
    render(<Camera />);
    await waitFor(() => expect(camera.isStreaming).toBe(true));
    Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", {
      configurable: true,
      get: () => 0,
    });
    expect(camera.capture()).toBe(null);
  });
});
