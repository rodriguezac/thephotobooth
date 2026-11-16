// @vitest-environment jsdom
import { StrictMode } from "react";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePhotoboothStore } from "../store/usePhotoboothStore";
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
let enumerateDevices: ReturnType<typeof vi.fn>;
beforeEach(() => {
  usePhotoboothStore.getState().resetSession();
  getUserMedia = vi.fn();
  enumerateDevices = vi.fn().mockResolvedValue([
    { kind: "videoinput", label: "Front Camera" },
    { kind: "videoinput", label: "Back Camera" },
  ]);
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia, enumerateDevices },
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
  it("releases the front camera before starting the back camera and mirrors only selfies", async () => {
    const front = mockStream(),
      back = mockStream(),
      frontAgain = mockStream();
    getUserMedia
      .mockResolvedValueOnce(front)
      .mockResolvedValueOnce(back)
      .mockResolvedValueOnce(frontAgain);
    const ctx = { translate: vi.fn(), scale: vi.fn(), drawImage: vi.fn() };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/jpeg;base64,test",
    );
    render(<Camera />);
    await waitFor(() => expect(camera.isStreaming).toBe(true));
    act(() => camera.setFacingMode("environment"));
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(camera.isStreaming).toBe(true));
    expect(front.track.stop).toHaveBeenCalledOnce();
    expect(getUserMedia).toHaveBeenLastCalledWith(
      expect.objectContaining({
        video: expect.objectContaining({
          facingMode: { exact: "environment" },
        }),
      }),
    );
    expect(camera.isMirrored).toBe(false);
    expect(camera.capture()).not.toBeNull();
    expect(ctx.scale).not.toHaveBeenCalled();
    act(() => camera.setFacingMode("user"));
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(camera.isStreaming).toBe(true));
    expect(back.track.stop).toHaveBeenCalledOnce();
    expect(camera.isMirrored).toBe(true);
    camera.capture();
    expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
  });
  it("returns to the front camera and hides the back option if the rear camera becomes unavailable", async () => {
    getUserMedia
      .mockResolvedValueOnce(mockStream())
      .mockRejectedValueOnce(
        new DOMException("Missing back camera", "OverconstrainedError"),
      )
      .mockResolvedValueOnce(mockStream());
    render(<Camera />);
    await waitFor(() => expect(camera.hasRearCamera).toBe(true));
    // Some browsers keep listing a camera even after it cannot be opened.
    act(() => camera.setFacingMode("environment"));
    await waitFor(() => expect(camera.facingMode).toBe("user"));
    await waitFor(() => expect(camera.isStreaming).toBe(true));
    expect(camera.hasRearCamera).toBe(false);
    expect(getUserMedia).toHaveBeenCalledTimes(3);
  });
  it("does not offer a back camera for a laptop with multiple ordinary webcams", async () => {
    enumerateDevices.mockResolvedValue([
      { kind: "videoinput", label: "Integrated Webcam" },
      { kind: "videoinput", label: "USB Camera" },
    ]);
    getUserMedia.mockResolvedValue(mockStream());
    render(<Camera />);
    await waitFor(() => expect(enumerateDevices).toHaveBeenCalled());
    expect(camera.hasRearCamera).toBe(false);
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });
  it("updates rear camera availability on device changes without restarting a working front stream", async () => {
    let changed!: () => void;
    const remove = vi.fn();
    Object.assign(navigator.mediaDevices, {
      addEventListener: vi.fn((_name: string, listener: () => void) => {
        changed = listener;
      }),
      removeEventListener: remove,
    });
    getUserMedia.mockResolvedValue(mockStream());
    const view = render(<Camera />);
    await waitFor(() => expect(camera.hasRearCamera).toBe(true));
    enumerateDevices.mockResolvedValue([
      { kind: "videoinput", label: "Integrated Webcam" },
    ]);
    await act(async () => changed());
    expect(camera.hasRearCamera).toBe(false);
    expect(camera.isStreaming).toBe(true);
    expect(getUserMedia).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(remove).toHaveBeenCalledWith("devicechange", changed);
  });
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
    await waitFor(() =>
      expect(camera.error).toContain("Camera permission denied"),
    );
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
