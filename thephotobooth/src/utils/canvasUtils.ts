import { applyPhotoEffect, hasPixelEffect } from "./photoEffects";
import { getStripLayout } from "./stripLayout";
import type {
  CapturedPhoto,
  PlacedSticker,
  StripBackground,
} from "../types/photobooth.types";
import { FILTER_OPTIONS } from "./constants";
import { PhotoFilter } from "../types/photobooth.types";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Could not load an image for the strip."));
    img.src = src;
  });
}

export async function generateStrip(
  photos: CapturedPhoto[],
  background: StripBackground,
  filter: PhotoFilter,
  stickers: PlacedSticker[] = [],
): Promise<string> {
  const {
    columns,
    padding,
    gap,
    photoWidth,
    photoHeight,
    footer,
    width,
    height,
  } = getStripLayout(photos.length);
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create the strip.");
  if (background.type === "solid") ctx.fillStyle = background.color;
  else {
    const image = await loadImage(background.src);
    // Scale tiles to a consistent physical size regardless of source dimensions.
    const tile = document.createElement("canvas");
    tile.width = 240;
    tile.height = 240;
    const tileCtx = tile.getContext("2d");
    if (!tileCtx) throw new Error("Could not create the pattern.");
    tileCtx.drawImage(image, 0, 0, 240, 240);
    const pattern = ctx.createPattern(tile, "repeat");
    if (!pattern) throw new Error("Could not create the pattern.");
    ctx.fillStyle = pattern;
  }
  ctx.fillRect(0, 0, width, height);
  const option = FILTER_OPTIONS.find((f) => f.value === filter);
  const cssFilter = option?.cssFilter ?? "none";
  const overlay = option?.overlay;
  const overlayImage = overlay ? await loadImage(overlay.src) : null;
  for (let i = 0; i < photos.length; i++) {
    const img = await loadImage(photos[i].dataUrl);
    const sw = Math.min(img.width, (img.height * 4) / 3);
    const sh = (sw * 3) / 4;
    const x = padding + (i % columns) * (photoWidth + gap);
    const y = padding + Math.floor(i / columns) * (photoHeight + gap);
    ctx.filter = cssFilter;
    ctx.drawImage(
      img,
      (img.width - sw) / 2,
      (img.height - sh) / 2,
      sw,
      sh,
      x,
      y,
      photoWidth,
      photoHeight,
    );
    if (hasPixelEffect(filter)) {
      const pixels = ctx.getImageData(x, y, photoWidth, photoHeight);
      applyPhotoEffect(pixels.data, photoWidth, photoHeight, filter);
      ctx.putImageData(pixels, x, y);
    }
    if (overlay && overlayImage) {
      ctx.filter = "none";
      ctx.globalCompositeOperation = overlay.blendMode;
      ctx.globalAlpha = overlay.opacity;
      ctx.drawImage(overlayImage, x, y, photoWidth, photoHeight);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }
  }
  ctx.filter = "none";
  ctx.fillStyle = "#fff";
  ctx.fillRect(padding, height - footer + 12, width - padding * 2, 54);
  ctx.fillStyle = "#ff0da2";
  ctx.font = "22px Silkscreen, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("the photobooth · @raspaorojo", width / 2, height - footer + 39);
  // Stickers sit above both photos and frame, in the same normalized positions as the editor.
  for (const sticker of stickers) {
    const image = await loadImage(sticker.src);
    const stickerWidth = sticker.width * width;
    const stickerHeight = stickerWidth / sticker.aspectRatio;
    if (sticker.rotation || sticker.flipX || sticker.flipY) {
      ctx.save();
      ctx.translate(sticker.x * width, sticker.y * height);
      ctx.rotate(((sticker.rotation ?? 0) * Math.PI) / 180);
      ctx.scale(sticker.flipX ? -1 : 1, sticker.flipY ? -1 : 1);
      ctx.drawImage(
        image,
        -stickerWidth / 2,
        -stickerHeight / 2,
        stickerWidth,
        stickerHeight,
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        image,
        sticker.x * width - stickerWidth / 2,
        sticker.y * height - stickerHeight / 2,
        stickerWidth,
        stickerHeight,
      );
    }
  }
  return canvas.toDataURL("image/png");
}
