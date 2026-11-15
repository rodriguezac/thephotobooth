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
    throw new Error("Revisa el cloud name de Cloudinary.");
  if (!imageUrl.startsWith("data:image/png;base64,"))
    throw new Error("La tira no está lista para compartir.");
  const photo = await fetch(imageUrl, { signal }).then((response) =>
    response.blob(),
  );
  if (photo.size > 5 * 1024 * 1024)
    throw new Error("La foto supera el límite de 5 MB.");
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
        "Revisa el cloud name y que el upload preset sea Unsigned.",
      );
    throw new Error("No se pudo subir la foto. Intenta de nuevo.");
  }
  let sharedUrl: URL;
  try {
    sharedUrl = new URL(result?.secure_url);
  } catch {
    throw new Error("El alojamiento no devolvió un enlace válido.");
  }
  if (
    sharedUrl.protocol !== "https:" ||
    sharedUrl.hostname !== "res.cloudinary.com" ||
    !sharedUrl.pathname.startsWith(`/${config.cloudName}/image/upload/`)
  ) {
    throw new Error("El alojamiento no devolvió un enlace válido.");
  }
  return sharedUrl.href;
}
