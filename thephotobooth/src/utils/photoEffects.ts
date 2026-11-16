import { PhotoFilter } from "../types/photobooth.types";

export function hasPixelEffect(filter: PhotoFilter) {
  return [
    PhotoFilter.SepiaFilm,
    PhotoFilter.RosePop,
    PhotoFilter.PinkInk,
    PhotoFilter.BlueMoon,
  ].includes(filter);
}

// Shared by the live camera and PNG export; only photo pixels are changed.
export function applyPhotoEffect(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  filter: PhotoFilter,
) {
  if (!hasPixelEffect(filter)) return;
  const rose = [
    [91, 24, 48],
    [158, 47, 84],
    [211, 88, 139],
    [255, 217, 220],
  ];
  const moon = [
    [25, 25, 34],
    [47, 41, 244],
    [105, 107, 255],
    [255, 252, 147],
  ];
  for (let i = 0; i < data.length; i += 4) {
    const pixel = i / 4;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    // Stable grain avoids flickering between preview frames.
    let seed = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263);
    seed = Math.imul(seed ^ (seed >>> 13), 1274126177);
    const noise = (seed >>> 0) / 4294967295 - 0.5;
    const luminance =
      (data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722) / 255;
    const tone = Math.max(
      0,
      Math.min(1, (luminance - 0.5) * 1.25 + 0.5 + noise * 0.07),
    );
    let rgb: number[];
    if (filter === PhotoFilter.SepiaFilm) {
      const vignette =
        Math.max(0, (x / width - 0.5) ** 2 + (y / height - 0.5) ** 2 - 0.08) *
        0.22;
      const filmTone = Math.max(0, Math.min(1, (luminance - 0.5) * 1.55 + 0.5));
      const level = Math.max(0, filmTone - vignette) * 234 + 6 + noise * 42;
      rgb = [level * 1.06 + 7, level * 0.98 + 3, level * 0.84];
    } else if (filter === PhotoFilter.RosePop) {
      rgb = rose[tone < 0.25 ? 0 : tone < 0.5 ? 1 : tone < 0.75 ? 2 : 3];
    } else if (filter === PhotoFilter.PinkInk) {
      rgb = tone < 0.43 ? [17, 16, 24] : [193, 108, 147];
    } else {
      const position = Math.pow(tone, 0.85) * 3;
      const index = Math.min(2, Math.floor(position));
      const blend = position - index;
      rgb = moon[index].map(
        (channel, c) =>
          channel + (moon[index + 1][c] - channel) * blend + noise * 10,
      );
    }
    data[i] = rgb[0];
    data[i + 1] = rgb[1];
    data[i + 2] = rgb[2];
  }
}
