// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { getSharingConfig, uploadSharedPhoto } from "./sharePhoto";

const config = { cloudName: "photo-test", uploadPreset: "photobooth" };
const image = "data:image/png;base64,cG5n";
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("public photo sharing", () => {
  it("stays unavailable until both public settings are configured", () => {
    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "");
    vi.stubEnv("VITE_CLOUDINARY_UPLOAD_PRESET", "");
    expect(getSharingConfig()).toBeNull();
    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "photo-test");
    expect(getSharingConfig()).toBeNull();
    vi.stubEnv("VITE_CLOUDINARY_UPLOAD_PRESET", "photobooth");
    expect(getSharingConfig()).toEqual(config);
  });
  it("uploads the final PNG and returns its public HTTPS URL", async () => {
    const remoteUrl = "https://res.cloudinary.com/photo-test/image/upload/v1/photobooth/unique.png";
    const fetchMock = vi.fn().mockResolvedValueOnce({ blob: async () => new Blob(["png"], { type: "image/png" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ secure_url: remoteUrl }) });
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;
    expect(await uploadSharedPhoto(image, config, signal)).toBe(remoteUrl);
    expect(fetchMock.mock.calls[1][0]).toBe("https://api.cloudinary.com/v1_1/photo-test/image/upload");
    const request = fetchMock.mock.calls[1][1];
    expect(request.body.get("upload_preset")).toBe("photobooth");
    expect(request.body.get("file").type).toBe("image/png");
    expect(request.signal).toBe(signal);
  });
  it.each(["http://localhost:5173/photo.png", "https://other.example/photo.png", "https://res.cloudinary.com/other/image/upload/photo.png"])("rejects invalid returned URL %s", async secure_url => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ blob: async () => new Blob(["png"]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ secure_url }) }));
    await expect(uploadSharedPhoto(image, config, new AbortController().signal)).rejects.toThrow("valid link");
  });
  it("reports an invalid upload preset so the user can fix it", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ blob: async () => new Blob(["png"]) })
      .mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({}) }));
    await expect(uploadSharedPhoto(image, config, new AbortController().signal)).rejects.toThrow("Unsigned");
  });
});
