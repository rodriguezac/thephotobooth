// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StripStyleScreen } from "./StripStyleScreen";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { readCustomPattern } from "../../../utils/customPattern";
import { SOLID_OPTIONS } from "../../../utils/constants";
import type { CustomPattern } from "../../../types/photobooth.types";

vi.mock("../../../utils/customPattern", () => ({ readCustomPattern: vi.fn() }));
const pattern: CustomPattern = {
  type: "custom",
  id: "upload",
  name: "test.png",
  label: "Your image",
  src: "data:image/png;base64,pattern",
  width: 800,
  height: 400,
};
const upload = () =>
  fireEvent.change(screen.getByLabelText("Choose pattern image"), {
    target: { files: [new File(["image"], "test.png", { type: "image/png" })] },
  });
beforeEach(() => {
  vi.clearAllMocks();
  usePhotoboothStore.getState().resetSession();
});
afterEach(cleanup);
describe("custom strip style", () => {
  it("selects the uploaded image, retains it across categories and Repeat, and clears it for a new session", async () => {
    vi.mocked(readCustomPattern).mockResolvedValue(pattern);
    render(<StripStyleScreen />);
    fireEvent.change(screen.getByLabelText("Style category"), {
      target: { value: "custom" },
    });
    expect(
      (screen.getByRole("button", { name: "next →" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    upload();
    const card = await screen.findByRole("button", {
      name: "Use your image as a pattern",
    });
    expect(card.getAttribute("aria-pressed")).toBe("true");
    fireEvent.change(screen.getByLabelText("Style category"), {
      target: { value: "solids" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Rose" }));
    fireEvent.change(screen.getByLabelText("Style category"), {
      target: { value: "custom" },
    });
    expect(usePhotoboothStore.getState().stripBg).toBe(pattern);
    act(() => usePhotoboothStore.getState().repeatSession());
    expect(usePhotoboothStore.getState().customPattern).toBe(pattern);
    expect(usePhotoboothStore.getState().stripBg).toBe(pattern);
    act(() => usePhotoboothStore.getState().resetSession());
    expect(usePhotoboothStore.getState().customPattern).toBeNull();
  });
  it("ignores an upload completed after leaving its category and does not block the next selection", async () => {
    let complete!: (pattern: CustomPattern) => void;
    vi.mocked(readCustomPattern).mockReturnValue(
      new Promise((resolve) => {
        complete = resolve;
      }),
    );
    render(<StripStyleScreen />);
    fireEvent.change(screen.getByLabelText("Style category"), {
      target: { value: "custom" },
    });
    upload();
    expect(screen.getByRole("status").textContent).toBe(
      "Preparing your pattern…",
    );
    fireEvent.change(screen.getByLabelText("Style category"), {
      target: { value: "solids" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Rose" }));
    await act(async () => complete(pattern));
    expect(usePhotoboothStore.getState().customPattern).toBeNull();
    expect(usePhotoboothStore.getState().stripBg).toBe(SOLID_OPTIONS[0]);
    expect(
      (screen.getByRole("button", { name: "next →" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });
  it("keeps the last valid pattern when a replacement fails", async () => {
    usePhotoboothStore.getState().setCustomPattern(pattern);
    usePhotoboothStore.getState().setActiveStyleTab("custom");
    vi.mocked(readCustomPattern).mockRejectedValue(
      new Error("Could not open this image. Try a JPG, PNG or WebP file."),
    );
    render(<StripStyleScreen />);
    upload();
    await screen.findByRole("alert");
    expect(usePhotoboothStore.getState().stripBg).toBe(pattern);
    expect(usePhotoboothStore.getState().customPattern).toBe(pattern);
  });
});
