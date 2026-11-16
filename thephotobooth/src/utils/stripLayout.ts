export function getStripLayout(photoCount: number) {
  if (!Number.isInteger(photoCount) || photoCount < 1 || photoCount > 4)
    throw new Error("A strip requires between 1 and 4 photos.");
  const columns = photoCount === 4 ? 2 : 1;
  const rows = Math.ceil(photoCount / columns);
  const padding = 28;
  const gap = 16;
  const photoWidth = 600;
  const photoHeight = 450;
  const footer = 100;
  return {
    columns,
    rows,
    padding,
    gap,
    photoWidth,
    photoHeight,
    footer,
    width: columns * photoWidth + padding * 2 + (columns - 1) * gap,
    height: rows * photoHeight + padding * 2 + (rows - 1) * gap + footer,
  };
}
