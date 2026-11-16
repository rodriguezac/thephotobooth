import { describe, expect, it } from "vitest";
import { hasRearVideoInput } from "./cameraDevices";
const device = (label: string, modes?: string[], kind = "videoinput") =>
  ({
    label,
    kind,
    ...(modes ? { getCapabilities: () => ({ facingMode: modes }) } : {}),
  }) as MediaDeviceInfo;
describe("rear camera detection", () => {
  it("does not mistake multiple webcams or a rear microphone for a rear camera", () => {
    expect(
      hasRearVideoInput([
        device("Integrated Webcam"),
        device("USB Camera"),
        device("Rear microphone", undefined, "audioinput"),
      ]),
    ).toBe(false);
    expect(hasRearVideoInput([])).toBe(false);
  });
  it("detects explicit facing capabilities even when camera names are unavailable", () => {
    expect(
      hasRearVideoInput([device("", ["user"]), device("", ["environment"])]),
    ).toBe(true);
    expect(hasRearVideoInput([device("Back labelled webcam", ["user"])])).toBe(
      false,
    );
  });
  it("uses front/back camera labels when capabilities are unavailable, including iPad labels", () => {
    expect(
      hasRearVideoInput([device("Front Camera"), device("Back Camera")]),
    ).toBe(true);
    expect(hasRearVideoInput([device("Cámara trasera")])).toBe(true);
    expect(hasRearVideoInput([device("camera2 0, facing back")])).toBe(true);
    expect(hasRearVideoInput([device("Backlog USB Camera")])).toBe(false);
  });
});
