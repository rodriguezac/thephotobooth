// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DownloadStrip } from "./DownloadStrip";

const first = "data:image/png;base64,aGVsbG8=";
const second = "data:image/png;base64,d29ybGQ=";
const share = vi.fn();
const canShare = vi.fn();
const revoke = vi.fn();
let nextUrl = 0;
function ipad() {
  Object.defineProperty(navigator, "platform", {
    configurable: true,
    value: "MacIntel",
  });
  Object.defineProperty(navigator, "maxTouchPoints", {
    configurable: true,
    value: 5,
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  nextUrl = 0;
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => `blob:photo-${++nextUrl}`),
    revokeObjectURL: revoke,
  });
  Object.defineProperty(navigator, "platform", {
    configurable: true,
    value: "Linux",
  });
  Object.defineProperty(navigator, "maxTouchPoints", {
    configurable: true,
    value: 0,
  });
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: share,
  });
  Object.defineProperty(navigator, "canShare", {
    configurable: true,
    value: canShare,
  });
  share.mockResolvedValue(undefined);
  canShare.mockReturnValue(true);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("saving photo strips", () => {
  it("prepares a Blob download and revokes old URLs when the image changes or the screen closes", () => {
    const view = render(<DownloadStrip imageUrl={first} />);
    const download = screen.getByRole("link", { name: "DOWNLOAD" });
    expect(download.getAttribute("href")).toBe("blob:photo-1");
    expect(download.getAttribute("download")).toBe("the-photobooth.png");
    expect(share).not.toHaveBeenCalled();
    view.rerender(<DownloadStrip imageUrl={second} />);
    expect(download.getAttribute("href")).toBe("blob:photo-2");
    expect(revoke).toHaveBeenCalledWith("blob:photo-1");
    view.unmount();
    expect(revoke).toHaveBeenCalledWith("blob:photo-2");
  });
  it("calls native iPad saving directly during the click with an already prepared PNG file", async () => {
    ipad();
    render(<DownloadStrip imageUrl={first} />);
    fireEvent.click(screen.getByRole("link", { name: "DOWNLOAD" }));
    expect(share).toHaveBeenCalledTimes(1);
    const [data] = share.mock.calls[0];
    expect(data.files[0]).toBeInstanceOf(File);
    expect(data.files[0].name).toBe("the-photobooth.png");
    expect(data.files[0].type).toBe("image/png");
    expect(data.files[0].size).toBe(5);
    await waitFor(() =>
      expect(
        screen
          .getByRole("link", { name: "DOWNLOAD" })
          .getAttribute("aria-disabled"),
      ).toBe("false"),
    );
  });
  it("offers a long-press image and a new-tab link when iPad file sharing is unavailable or fails", async () => {
    ipad();
    canShare.mockReturnValue(false);
    const view = render(<DownloadStrip imageUrl={first} />);
    fireEvent.click(screen.getByRole("link", { name: "DOWNLOAD" }));
    expect(
      screen
        .getByRole("img", { name: "Your photo strip, ready to save" })
        .getAttribute("src"),
    ).toBe("blob:photo-1");
    expect(
      screen.getByRole("link", { name: "Open image ↗" }).getAttribute("target"),
    ).toBe("_blank");
    expect(share).not.toHaveBeenCalled();
    view.rerender(<DownloadStrip imageUrl={second} />);
    expect(screen.queryByRole("img")).toBeNull();
    canShare.mockReturnValue(true);
    share.mockRejectedValueOnce(new DOMException("Blocked", "NotAllowedError"));
    fireEvent.click(screen.getByRole("link", { name: "DOWNLOAD" }));
    expect(
      await screen.findByRole("img", {
        name: "Your photo strip, ready to save",
      }),
    ).toBeTruthy();
  });
  it("does not treat cancelling the save menu as a failure or start another save while it is open", async () => {
    ipad();
    let cancel!: (error: unknown) => void;
    share.mockReturnValue(
      new Promise((_resolve, reject) => {
        cancel = reject;
      }),
    );
    render(<DownloadStrip imageUrl={first} />);
    const download = screen.getByRole("link", { name: "DOWNLOAD" });
    fireEvent.click(download);
    fireEvent.click(download);
    expect(share).toHaveBeenCalledTimes(1);
    cancel(new DOMException("Cancelled", "AbortError"));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "DOWNLOAD" })).toBeTruthy(),
    );
    expect(screen.queryByRole("img")).toBeNull();
  });
});
