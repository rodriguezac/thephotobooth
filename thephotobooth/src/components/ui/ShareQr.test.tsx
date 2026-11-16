// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShareQr } from "./ShareQr";
import { getSharingConfig, uploadSharedPhoto } from "../../utils/sharePhoto";
import QRCode from "qrcode";

vi.mock("../../utils/sharePhoto", () => ({ getSharingConfig: vi.fn(), uploadSharedPhoto: vi.fn() }));
vi.mock("qrcode", () => ({ default: { toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,qr") } }));
const image = "data:image/png;base64,photo";
const publicUrl = "https://res.cloudinary.com/test/image/upload/v1/photo.png";
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("QR sharing controls", () => {
  it("disables sharing clearly when hosting is not configured", () => {
    vi.mocked(getSharingConfig).mockReturnValue(null);
    render(<ShareQr imageUrl={image} />);
    expect((screen.getByRole("button", { name: "GET QR" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Connect photo hosting to enable QR sharing.")).toBeTruthy();
    expect(uploadSharedPhoto).not.toHaveBeenCalled();
  });
  it("only uploads on click and encodes the public photo URL; toggling reuses it", async () => {
    vi.mocked(getSharingConfig).mockReturnValue({ cloudName: "test", uploadPreset: "photos" });
    vi.mocked(uploadSharedPhoto).mockResolvedValue(publicUrl);
    render(<ShareQr imageUrl={image} />);
    expect(uploadSharedPhoto).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "GET QR" }));
    await waitFor(() => expect(screen.getByRole("link").getAttribute("href")).toBe(publicUrl));
    expect(QRCode.toDataURL).toHaveBeenCalledWith(publicUrl, expect.objectContaining({ margin: 4, color: { dark: "#ff0da2", light: "#ffffff" } }));
    fireEvent.click(screen.getByRole("button", { name: "HIDE QR" }));
    expect(screen.queryByRole("link")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "GET QR" }));
    expect(uploadSharedPhoto).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link").getAttribute("href")).toBe(publicUrl);
  });
  it("shows an upload error without creating a QR and allows retry", async () => {
    vi.mocked(getSharingConfig).mockReturnValue({ cloudName: "test", uploadPreset: "photos" });
    vi.mocked(uploadSharedPhoto).mockRejectedValueOnce(new Error("No connection")).mockResolvedValueOnce(publicUrl);
    render(<ShareQr imageUrl={image} />);
    fireEvent.click(screen.getByRole("button", { name: "GET QR" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("No connection"));
    expect(QRCode.toDataURL).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "GET QR" }));
    await waitFor(() => expect(screen.getByRole("link").getAttribute("href")).toBe(publicUrl));
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
