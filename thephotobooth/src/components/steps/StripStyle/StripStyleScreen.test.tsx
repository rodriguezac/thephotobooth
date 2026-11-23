// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { StripStyleScreen } from "./StripStyleScreen";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { AppStep, PhotoFilter } from "../../../types/photobooth.types";
import { PATTERN_OPTIONS } from "../../../utils/constants";

beforeEach(() => {
  usePhotoboothStore.getState().resetSession();
  usePhotoboothStore.getState().goToStep(AppStep.StripStyle);
});
afterEach(cleanup);

describe("style pagination", () => {
  it("swipes through patterns and solids within their bounds without selecting tiles or changing steps", () => {
    render(<StripStyleScreen />);
    const swipe = (left = true) => {
      const grid = screen.getByRole("group", { name: /options$/ });
      const start = { identifier: 1, clientX: left ? 240 : 70, clientY: 100 };
      const end = { ...start, clientX: left ? 70 : 240 };
      fireEvent.touchStart(grid, { touches: [start] });
      fireEvent.touchMove(grid, { touches: [end] });
      fireEvent.touchEnd(grid, { touches: [], changedTouches: [end] });
    };
    swipe(false);
    expect(screen.getByLabelText("Page 1 of 3")).toBeTruthy();
    swipe(); swipe(); swipe();
    expect(screen.getByLabelText("Page 3 of 3")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Pattern 21" }));
    expect(usePhotoboothStore.getState().stripBg).toBeNull();
    swipe(false);
    expect(screen.getByLabelText("Page 2 of 3")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Style category"), { target: { value: "solids" } });
    swipe(); swipe();
    expect(screen.getByLabelText("Page 2 of 2")).toBeTruthy();
    swipe(false);
    expect(screen.getByLabelText("Page 1 of 2")).toBeTruthy();
    expect(usePhotoboothStore.getState().currentStep).toBe(AppStep.StripStyle);
  });
  it("returns from customization to the result with all original photos and edits intact", () => {
    const photos = Array.from({ length: 3 }, (_, i) => ({
      dataUrl: `photo-${i}`,
      takenAt: i,
    }));
    usePhotoboothStore.setState({
      photoCount: 3,
      capturedPhotos: photos,
      stripBg: PATTERN_OPTIONS[0],
      filter: PhotoFilter.Year2016,
    });
    render(<StripStyleScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Pattern 6" }));
    fireEvent.click(screen.getByRole("button", { name: "next →" }));
    expect(usePhotoboothStore.getState().currentStep).toBe(AppStep.Filter);
    act(() => usePhotoboothStore.getState().prevStep());
    expect(usePhotoboothStore.getState().currentStep).toBe(AppStep.StripStyle);
    fireEvent.click(screen.getByRole("button", { name: "← back" }));
    const state = usePhotoboothStore.getState();
    expect(state.currentStep).toBe(AppStep.Result);
    expect(state.capturedPhotos).toBe(photos);
    expect(state.photoCount).toBe(3);
    expect(state.stripBg).toEqual(PATTERN_OPTIONS[5]);
    expect(state.filter).toBe(PhotoFilter.Year2016);
  });
  it("pages through all available patterns while keeping step navigation separate", () => {
    render(<StripStyleScreen />);
    expect(
      within(
        screen.getByRole("group", { name: "patterns options" }),
      ).getAllByRole("button"),
    ).toHaveLength(10);
    expect(
      (
        screen.getByRole("button", {
          name: "Previous styles page",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Next styles page" }));
    expect(
      within(
        screen.getByRole("group", { name: "patterns options" }),
      ).getAllByRole("button"),
    ).toHaveLength(10);
    expect(screen.getByRole("button", { name: "Pattern 20" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pattern 15" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pattern 16" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next styles page" }));
    expect(
      within(
        screen.getByRole("group", { name: "patterns options" }),
      ).getAllByRole("button"),
    ).toHaveLength(7);
    expect(screen.getByRole("button", { name: "Pattern 27" })).toBeTruthy();
    expect(
      (
        screen.getByRole("button", {
          name: "Next styles page",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(usePhotoboothStore.getState().currentStep).toBe(AppStep.StripStyle);
    fireEvent.click(screen.getByRole("button", { name: "Pattern 27" }));
    fireEvent.click(screen.getByRole("button", { name: "next →" }));
    expect(usePhotoboothStore.getState().currentStep).toBe(AppStep.Filter);
  });
  it("keeps each category's page and the selected background when browsing", () => {
    render(<StripStyleScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Next styles page" }));
    fireEvent.click(screen.getByRole("button", { name: "Pattern 20" }));
    fireEvent.change(screen.getByLabelText("Style category"), {
      target: { value: "solids" },
    });
    expect(screen.getByLabelText("Page 1 of 2")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next styles page" }));
    expect(screen.getByRole("button", { name: "Charcoal" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Style category"), {
      target: { value: "patterns" },
    });
    expect(
      screen
        .getByRole("button", { name: "Pattern 20" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(
      screen.getByRole("button", { name: "Previous styles page" }),
    );
    expect(usePhotoboothStore.getState().stripBg).toEqual(
      PATTERN_OPTIONS.find((pattern) => pattern.id === 20),
    );
    fireEvent.click(screen.getByRole("button", { name: "← back" }));
    expect(usePhotoboothStore.getState().currentStep).toBe(AppStep.PhotoCount);
  });
  it("opens the selected style's page on return", () => {
    usePhotoboothStore
      .getState()
      .setStripBg(PATTERN_OPTIONS[PATTERN_OPTIONS.length - 1]);
    render(<StripStyleScreen />);
    expect(screen.getByLabelText("Page 3 of 3")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Pattern 27" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });
});
