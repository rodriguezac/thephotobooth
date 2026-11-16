// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilterScreen } from "./FilterScreen";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { AppStep, PhotoFilter } from "../../../types/photobooth.types";
import { PATTERN_OPTIONS, SOLID_OPTIONS } from "../../../utils/constants";
import { generateStrip } from "../../../utils/canvasUtils";

vi.mock("../../../utils/canvasUtils", () => ({ generateStrip: vi.fn() }));
const getUserMedia = vi.fn();
const photos = [{ dataUrl: "data:image/jpeg;base64,test", takenAt: 1 }];
const preview = "data:image/png;base64,preview";
beforeEach(() => {
  vi.clearAllMocks();
  usePhotoboothStore.getState().resetSession();
  usePhotoboothStore.getState().goToStep(AppStep.Filter);
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia } });
  vi.mocked(generateStrip).mockResolvedValue(preview);
});
afterEach(cleanup);
function completedSession() {
  usePhotoboothStore.setState({ photoCount: 1, capturedPhotos: photos, stripBg: PATTERN_OPTIONS[5] });
}

describe("customize filters", () => {
  it("shows captured photos with the new style, updates filters and returns to result without opening the camera", async () => {
    completedSession();
    const view = render(<FilterScreen />);
    const image = await screen.findByRole("img", { name: "Your strip with the selected style and filter" });
    expect(image.getAttribute("src")).toBe(preview);
    expect(generateStrip).toHaveBeenLastCalledWith(photos, PATTERN_OPTIONS[5], PhotoFilter.Normal);
    expect(view.container.querySelector("video")).toBeNull();
    expect(getUserMedia).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Photo filter"), { target: { value: "2016" } });
    await waitFor(() => expect(generateStrip).toHaveBeenLastCalledWith(photos, PATTERN_OPTIONS[5], PhotoFilter.Year2016));
    await screen.findByRole("img", { name: "Your strip with the selected style and filter" });
    fireEvent.click(screen.getByRole("button", { name: "next →" }));
    expect(usePhotoboothStore.getState().currentStep).toBe(AppStep.Stickers);
    expect(usePhotoboothStore.getState().capturedPhotos).toBe(photos);
    expect(getUserMedia).not.toHaveBeenCalled();
  });
  it("ignores an older preview if filters change before generation finishes", async () => {
    completedSession();
    let finishOld!: (url: string) => void;
    vi.mocked(generateStrip).mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve; })).mockResolvedValueOnce("data:image/png;base64,new");
    render(<FilterScreen />);
    fireEvent.change(screen.getByLabelText("Photo filter"), { target: { value: "sepia" } });
    const image = await screen.findByRole("img", { name: "Your strip with the selected style and filter" });
    expect(image.getAttribute("src")).toBe("data:image/png;base64,new");
    await act(async () => finishOld("data:image/png;base64,old"));
    expect(image.getAttribute("src")).toBe("data:image/png;base64,new");
    fireEvent.click(screen.getByRole("button", { name: "← back" }));
    expect(usePhotoboothStore.getState().currentStep).toBe(AppStep.StripStyle);
  });
  it("keeps the live camera for a new session before photos are taken", async () => {
    usePhotoboothStore.setState({ photoCount: 1, stripBg: SOLID_OPTIONS[0] });
    getUserMedia.mockRejectedValueOnce(new DOMException("No camera in test", "NotFoundError"));
    const view = render(<FilterScreen />);
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
    expect(view.container.querySelector("video")).not.toBeNull();
    expect(generateStrip).not.toHaveBeenCalled();
    await screen.findByRole("alert");
  });
});
