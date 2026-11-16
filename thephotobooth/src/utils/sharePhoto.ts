export type SharingConfig = { cloudName: string; uploadPreset: string };

export function getSharingConfig(): SharingConfig | null {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();
  return cloudName && uploadPreset ? { cloudName, uploadPreset } : null;
}

export async function uploadSharedPhoto(
  imageUrl: string,
  config: SharingConfig,
  signal: AbortSignal,
): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(config.cloudName))
    throw new Error("Check your Cloudinary cloud name.");
  if (!imageUrl.startsWith("data:image/png;base64,"))
    throw new Error("The strip is not ready to share.");
  const photo = await fetch(imageUrl, { signal }).then((response) =>
    response.blob(),
  );
  if (photo.size > 5 * 1024 * 1024)
    throw new Error("The photo exceeds the 5 MB limit.");
  const body = new FormData();
  body.append("file", photo, "the-photobooth.png");
  body.append("upload_preset", config.uploadPreset);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: "POST",
      body,
      signal,
    },
  );
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 400 || response.status === 401)
      throw new Error(
        "Check your cloud name and make sure the upload preset is Unsigned.",
      );
    throw new Error("Could not upload the photo. Please try again.");
  }
  let sharedUrl: URL;
  try {
    sharedUrl = new URL(result?.secure_url);
  } catch {
    throw new Error("The hosting service did not return a valid link.");
  }
  if (
    sharedUrl.protocol !== "https:" ||
    sharedUrl.hostname !== "res.cloudinary.com" ||
    !sharedUrl.pathname.startsWith(`/${config.cloudName}/image/upload/`)
  ) {
    throw new Error("The hosting service did not return a valid link.");
  }
  return sharedUrl.href;
}
