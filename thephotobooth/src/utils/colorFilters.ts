// The color-only CSS operations used by FILTER_OPTIONS, applied in sRGB.
// CanvasRenderingContext2D.filter is unavailable in some mobile browsers.
// Matrices follow https://www.w3.org/TR/filter-effects-1/#FilterPrimitivesOverview
const cache = new Map<string, number[][]>();
const clamp = (value: number) => Math.max(0, Math.min(255, value));

function colorMatrices(css: string): number[][] {
  const cached = cache.get(css);
  if (cached) return cached;
  const matrices = Array.from(css.matchAll(/([\w-]+)\(([^)]+)\)/g), ([, name, raw]) => {
    const amount = parseFloat(raw) / (raw.endsWith("%") ? 100 : 1);
    if (name === "brightness" || name === "contrast") {
      const offset = name === "contrast" ? 127.5 * (1 - amount) : 0;
      return [amount, 0, 0, offset, 0, amount, 0, offset, 0, 0, amount, offset];
    }
    if (name === "sepia") {
      const a = Math.min(1, amount);
      return [
        1 - 0.607 * a, 0.769 * a, 0.189 * a, 0,
        0.349 * a, 1 - 0.314 * a, 0.168 * a, 0,
        0.272 * a, 0.534 * a, 1 - 0.869 * a, 0,
      ];
    }
    if (name === "grayscale") {
      const a = Math.min(1, amount);
      return [
        1 - 0.7874 * a, 0.7152 * a, 0.0722 * a, 0,
        0.2126 * a, 1 - 0.2848 * a, 0.0722 * a, 0,
        0.2126 * a, 0.7152 * a, 1 - 0.9278 * a, 0,
      ];
    }
    if (name === "saturate") {
      const a = amount;
      return [
        0.213 + 0.787 * a, 0.715 - 0.715 * a, 0.072 - 0.072 * a, 0,
        0.213 - 0.213 * a, 0.715 + 0.285 * a, 0.072 - 0.072 * a, 0,
        0.213 - 0.213 * a, 0.715 - 0.715 * a, 0.072 + 0.928 * a, 0,
      ];
    }
    if (name === "hue-rotate") {
      const c = Math.cos(amount * Math.PI / 180);
      const s = Math.sin(amount * Math.PI / 180);
      return [
        0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928, 0,
        0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.140, 0.072 - c * 0.072 - s * 0.283, 0,
        0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072, 0,
      ];
    }
    throw new Error(`Unsupported photo color filter: ${name}`);
  });
  cache.set(css, matrices);
  return matrices;
}

export function applyColorFilter(data: Uint8ClampedArray, css: string) {
  const matrices = colorMatrices(css);
  if (!matrices.length) return;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];
    for (const m of matrices) {
      const nextR = clamp(m[0] * r + m[1] * g + m[2] * b + m[3]);
      const nextG = clamp(m[4] * r + m[5] * g + m[6] * b + m[7]);
      b = clamp(m[8] * r + m[9] * g + m[10] * b + m[11]);
      r = nextR;
      g = nextG;
    }
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}
