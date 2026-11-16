// A second webcam alone is not evidence of a rear-facing camera.
export function hasRearVideoInput(
  devices: MediaDeviceInfo[],
  track?: MediaStreamTrack,
) {
  try {
    if (
      track?.getSettings?.().facingMode === "environment" ||
      track?.getCapabilities?.().facingMode?.includes("environment")
    )
      return true;
  } catch {
    /* Device metadata can be restricted by the browser. */
  }
  return devices.some((device) => {
    if (device.kind !== "videoinput") return false;
    try {
      const modes = (device as InputDeviceInfo).getCapabilities?.().facingMode;
      if (modes?.length) return modes.includes("environment");
    } catch {
      /* Safari may expose the camera label without capabilities. */
    }
    return /\b(back|rear|environment|traser[ao]|posterior)\b|arrière|rückkamera|背面|后置|後置|후면/i.test(
      device.label,
    );
  });
}
