// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResultScreen } from "./ResultScreen";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { AppStep, PhotoFilter } from "../../../types/photobooth.types";
import { SOLID_OPTIONS } from "../../../utils/constants";

vi.mock("../../../hooks/useStripPreview", () => ({
  useStripPreview: () => ({
    url: "data:image/png;base64,preview",
    error: null,
    retry: vi.fn(),
  }),
}));
const stickers = [
  {
    id: "s",
    assetId: "phone",
    src: "/stickers/phone.png",
    label: "Phone",
    x: 0.3,
    y: 0.6,
    width: 0.25,
    aspectRatio: 1,
    rotation: 45,
    flipX: true,
  },
];
beforeEach(() => {
  usePhotoboothStore.getState().resetSession();
  usePhotoboothStore.setState({
    currentStep: AppStep.Result,
    photoCount: 3,
    stripBg: SOLID_OPTIONS[13],
    activeStyleTab: "solids",
    filter: PhotoFilter.Year2016,
    stickers,
    capturedPhotos: [{ dataUrl: "old photo", takenAt: 1 }],
    stripDataUrl: "old strip",
    isCameraActive: false,
  });
});
afterEach(cleanup);

describe("result session actions", () => {
  it("links every web credit, including the strip and enlarged view, without nesting links inside buttons", () => {
    const view = render(<ResultScreen />);
    const credits = view.container.querySelectorAll(
      'a[href="https://www.instagram.com/raspaorojo/"]',
    );
    expect(credits).toHaveLength(3);
    credits.forEach((link) => {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    });
    expect(view.container.querySelector("button a")).toBeNull();
  });
  it("Repeat retakes photos while preserving every chosen setting", () => {
    render(<ResultScreen />);
    fireEvent.click(screen.getByRole("button", { name: "REPEAT" }));
    const state = usePhotoboothStore.getState();
    expect(state.currentStep).toBe(AppStep.Capture);
    expect(state.capturedPhotos).toEqual([]);
    expect(state.stripDataUrl).toBeNull();
    expect(state.photoCount).toBe(3);
    expect(state.stripBg).toEqual(SOLID_OPTIONS[13]);
    expect(state.filter).toBe(PhotoFilter.Year2016);
    expect(state.activeStyleTab).toBe("solids");
    expect(state.stickers).toBe(stickers);
  });
  it("Main Menu returns to Start with a fresh session", () => {
    render(<ResultScreen />);
    fireEvent.click(screen.getByRole("button", { name: "MAIN MENU" }));
    const state = usePhotoboothStore.getState();
    expect(state.currentStep).toBe(AppStep.Welcome);
    expect(state.photoCount).toBeNull();
    expect(state.stripBg).toBeNull();
    expect(state.filter).toBe(PhotoFilter.Normal);
    expect(state.capturedPhotos).toEqual([]);
    expect(state.stickers).toEqual([]);
    expect(state.stripDataUrl).toBeNull();
  });
});
