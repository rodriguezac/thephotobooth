import type { CustomPattern } from "../types/photobooth.types";

export async function readCustomPattern(file: File): Promise<CustomPattern> {
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("Please choose an image from your gallery.");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 15 MB.");
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight)
      throw new Error("Invalid image");
    // Keep the full image and its aspect ratio, while bounding memory and export size.
    const scale = Math.min(
      1,
      1536 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return {
      type: "custom",
      id: crypto.randomUUID(),
      label: "Your image",
      name: file.name,
      src: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
    };
  } catch {
    throw new Error("Could not open this image. Try a JPG, PNG or WebP file.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
