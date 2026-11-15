import type { CapturedPhoto, StripBackground } from "../types/photobooth.types";
import { FILTER_OPTIONS } from "./constants";
import { PhotoFilter } from "../types/photobooth.types";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("No se pudo cargar una imagen de la tira."));
    img.src = src;
  });
}

export async function generateStrip(
  photos: CapturedPhoto[],
  background: StripBackground,
  filter: PhotoFilter,
): Promise<string> {
  if (!photos.length || photos.length > 4)
    throw new Error("La tira necesita entre 1 y 4 fotos.");
  await document.fonts.ready;
  const columns = photos.length === 4 ? 2 : 1;
  const padding = 28;
  const gap = 16;
  const photoWidth = 600;
  const photoHeight = 450;
  const footer = 100;
  const width = columns * photoWidth + padding * 2 + (columns - 1) * gap;
  const rows = Math.ceil(photos.length / columns);
  const height = rows * photoHeight + padding * 2 + (rows - 1) * gap + footer;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear la tira.");
  if (background.type === "solid") ctx.fillStyle = background.color;
  else {
    const image = await loadImage(background.src);
    // Scale tiles to a consistent physical size regardless of source dimensions.
    const tile = document.createElement("canvas");
    tile.width = 240;
    tile.height = 240;
    const tileCtx = tile.getContext("2d");
    if (!tileCtx) throw new Error("No se pudo crear el patrón.");
    tileCtx.drawImage(image, 0, 0, 240, 240);
    const pattern = ctx.createPattern(tile, "repeat");
    if (!pattern) throw new Error("No se pudo crear el patrón.");
    ctx.fillStyle = pattern;
  }
  ctx.fillRect(0, 0, width, height);
  const cssFilter =
    FILTER_OPTIONS.find((f) => f.value === filter)?.cssFilter ?? "none";
  for (let i = 0; i < photos.length; i++) {
    const img = await loadImage(photos[i].dataUrl);
    const sw = Math.min(img.width, (img.height * 4) / 3);
    const sh = (sw * 3) / 4;
    ctx.filter = cssFilter;
    ctx.drawImage(
      img,
      (img.width - sw) / 2,
      (img.height - sh) / 2,
      sw,
      sh,
      padding + (i % columns) * (photoWidth + gap),
      padding + Math.floor(i / columns) * (photoHeight + gap),
      photoWidth,
      photoHeight,
    );
  }
  ctx.filter = "none";
  ctx.fillStyle = "#fff";
  ctx.fillRect(padding, height - footer + 12, width - padding * 2, 54);
  ctx.fillStyle = "#ff0da2";
  ctx.font = "22px Silkscreen, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("the photobooth · @raspaorojo", width / 2, height - footer + 39);
  return canvas.toDataURL("image/png");
}
