// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StickerScreen } from "./StickerScreen";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { AppStep } from "../../../types/photobooth.types";
import { SOLID_OPTIONS } from "../../../utils/constants";

vi.mock("../../../hooks/useStripPreview", () => ({
  useStripPreview: () => ({
    url: "data:image/png;base64,preview",
    error: null,
    retry: vi.fn(),
  }),
}));
beforeEach(() => {
  usePhotoboothStore.getState().resetSession();
  usePhotoboothStore.setState({
    currentStep: AppStep.Stickers,
    photoCount: 1,
    stripBg: SOLID_OPTIONS[0],
    capturedPhotos: [{ dataUrl: "photo", takenAt: 1 }],
  });
  vi.stubGlobal(
    "PointerEvent",
    class extends MouseEvent {
      pointerId: number;
      pointerType: string;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
        this.pointerType = init.pointerType ?? "touch";
      }
    },
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false })),
  );
  vi.stubGlobal(
    "Image",
    class {
      naturalWidth = 200;
      naturalHeight = 100;
      src = "";
      decode() {
        return Promise.resolve();
      }
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("sticker editor", () => {
  it("shows the size and duplicates the selected sticker with independent transforms", async () => {
    render(<StickerScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Add Phone" }));
    await screen.findByRole("button", { name: "Move Phone" });
    fireEvent.change(screen.getByLabelText("size"), {
      target: { value: "40" },
    });
    expect(screen.getByText("40%")).toBeTruthy();
    expect(screen.getByLabelText("size").getAttribute("aria-valuetext")).toBe(
      "40% of strip width",
    );
    fireEvent.change(screen.getByLabelText("rotation"), {
      target: { value: "-10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "flip horizontal" }));
    const original = usePhotoboothStore.getState().stickers[0];
    const duplicate = screen.getByRole("button", { name: "Duplicate sticker" });
    expect(
      screen
        .getByRole("group", { name: "Strip sticker editor" })
        .contains(duplicate),
    ).toBe(true);
    fireEvent.pointerDown(duplicate, {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
    });
    expect(usePhotoboothStore.getState().stickers[0]).toEqual(original);
    fireEvent.click(duplicate);
    const copy = usePhotoboothStore.getState().stickers[1];
    expect(copy.id).not.toBe(original.id);
    expect(copy).toMatchObject({
      assetId: original.assetId,
      src: original.src,
      width: 0.4,
      aspectRatio: original.aspectRatio,
      rotation: -10,
      flipX: true,
      flipY: false,
    });
    expect(copy.x).toBeCloseTo(0.54);
    expect(copy.y).toBeCloseTo(0.54);
    fireEvent.change(screen.getByLabelText("size"), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText("rotation"), {
      target: { value: "-10" },
    });
    const tools = screen.getByRole("group", { name: "Sticker actions" });
    expect(tools.querySelectorAll("button")).toHaveLength(2);
    expect(tools.closest(".sticker-piece")).toBeNull();
    expect(
      screen
        .getAllByRole("button", { name: "Move Phone" })
        .map((button) => button.getAttribute("aria-pressed")),
    ).toEqual(["false", "true"]);
    fireEvent.click(screen.getByRole("button", { name: "rotate right" }));
    expect(usePhotoboothStore.getState().stickers[1].rotation).toBe(5);
    expect(usePhotoboothStore.getState().stickers[0]).toEqual(original);
    const deleteIcon = screen.getByRole("button", { name: "Delete sticker" });
    expect(
      screen
        .getByRole("group", { name: "Strip sticker editor" })
        .contains(deleteIcon),
    ).toBe(true);
    fireEvent.pointerDown(deleteIcon, {
      pointerId: 2,
      pointerType: "touch",
      button: 0,
    });
    fireEvent.click(deleteIcon);
    expect(usePhotoboothStore.getState().stickers).toEqual([original]);
    expect(screen.queryByRole("button", { name: "Delete sticker" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Duplicate sticker" }),
    ).toBeNull();
  });
  it("offers precise rotation and both flip directions without moving the sticker", async () => {
    render(<StickerScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Add Phone" }));
    await screen.findByRole("button", { name: "Move Phone" });
    fireEvent.change(screen.getByLabelText("rotation"), {
      target: { value: "45" },
    });
    fireEvent.click(screen.getByRole("button", { name: "rotate right" }));
    fireEvent.click(screen.getByRole("button", { name: "flip horizontal" }));
    fireEvent.click(screen.getByRole("button", { name: "flip vertical" }));
    expect(usePhotoboothStore.getState().stickers[0]).toMatchObject({
      x: 0.5,
      y: 0.5,
      rotation: 60,
      flipX: true,
      flipY: true,
    });
    fireEvent.click(screen.getByRole("button", { name: "reset orientation" }));
    expect(usePhotoboothStore.getState().stickers[0]).toMatchObject({
      rotation: 0,
      flipX: false,
      flipY: false,
    });
    fireEvent.click(screen.getByRole("button", { name: "done" }));
    expect(
      screen
        .getByRole("group", { name: "Strip sticker editor" })
        .classList.contains("has-selection"),
    ).toBe(false);
  });
  it("handles two touch pointers, resumes a one-finger drag and releases cancelled gestures", async () => {
    render(<StickerScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Add Heart" }));
    const heart = await screen.findByRole("button", { name: "Move Heart" });
    const board = screen.getByRole("group", { name: "Strip sticker editor" });
    vi.spyOn(board, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 300,
      bottom: 300,
      width: 300,
      height: 300,
      toJSON: () => ({}),
    });
    fireEvent.pointerDown(heart, {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
      clientX: 150,
      clientY: 150,
    });
    fireEvent.pointerDown(board, {
      pointerId: 2,
      pointerType: "touch",
      button: 0,
      clientX: 250,
      clientY: 150,
    });
    fireEvent.pointerMove(board, {
      pointerId: 2,
      pointerType: "touch",
      clientX: 150,
      clientY: 350,
    });
    expect(usePhotoboothStore.getState().stickers[0].width).toBeCloseTo(0.56);
    expect(usePhotoboothStore.getState().stickers[0].rotation).toBeCloseTo(90);
    fireEvent.pointerUp(board, { pointerId: 2, pointerType: "touch" });
    fireEvent.pointerMove(board, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 180,
      clientY: 150,
    });
    expect(usePhotoboothStore.getState().stickers[0].x).toBeCloseTo(0.6);
    expect(usePhotoboothStore.getState().stickers[0].width).toBeCloseTo(0.56);
    fireEvent.pointerCancel(board, { pointerId: 1, pointerType: "touch" });
    fireEvent.pointerMove(board, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 250,
      clientY: 150,
    });
    expect(usePhotoboothStore.getState().stickers[0].x).toBeCloseTo(0.6);
  });
  it("adds, moves with the keyboard, resizes and deletes a sticker", async () => {
    render(<StickerScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Add Heart" }));
    const heart = await screen.findByRole("button", { name: "Move Heart" });
    expect(usePhotoboothStore.getState().stickers).toHaveLength(1);
    expect(usePhotoboothStore.getState().stickers[0].aspectRatio).toBe(2);
    fireEvent.keyDown(heart, { key: "ArrowRight", shiftKey: true });
    expect(usePhotoboothStore.getState().stickers[0].x).toBeCloseTo(0.55);
    fireEvent.change(screen.getByLabelText("size"), {
      target: { value: "40" },
    });
    expect(usePhotoboothStore.getState().stickers[0].width).toBe(0.4);
    fireEvent.click(screen.getByRole("button", { name: "remove sticker" }));
    expect(usePhotoboothStore.getState().stickers).toHaveLength(0);
  });
  it("keeps stickers across Back, filter changes and Next, and clears them only for a new shoot", async () => {
    render(<StickerScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Add Heart" }));
    await waitFor(() =>
      expect(usePhotoboothStore.getState().stickers).toHaveLength(1),
    );
    const sticker = usePhotoboothStore.getState().stickers[0];
    fireEvent.click(screen.getByRole("button", { name: "← back" }));
    expect(usePhotoboothStore.getState().currentStep).toBe(AppStep.Filter);
    expect(usePhotoboothStore.getState().stickers[0]).toEqual(sticker);
    fireEvent.click(screen.getByRole("button", { name: "next →" }));
    expect(usePhotoboothStore.getState().currentStep).toBe(AppStep.Result);
    expect(usePhotoboothStore.getState().stickers[0]).toEqual(sticker);
    act(() => usePhotoboothStore.getState().setPhotoCount(2));
    expect(usePhotoboothStore.getState().stickers).toHaveLength(0);
  });
});
