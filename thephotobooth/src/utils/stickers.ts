import type { StickerAsset } from "../types/photobooth.types";

const assets = [
  {
    id: "[HEART].PNG",
    label: "Heart",
    file: "[HEART].webp",
  },
  {
    id: "[ESTRELLA].png",
    label: "Star",
    file: "[ESTRELLA].webp",
  },
  {
    id: "[PHONE].PNG",
    label: "Phone",
    file: "[PHONE].webp",
  },
  {
    id: "[SIMS].PNG",
    label: "Sims",
    file: "[SIMS].webp",
  },
  {
    id: "[EYE].PNG",
    label: "Eye",
    file: "[EYE].webp",
  },
  {
    id: "IMG_6072.PNG",
    label: "Extra sticker",
    file: "IMG_6072.webp",
  },
  {
    id: "[0].PNG",
    label: "0",
    file: "[0].webp",
  },
  {
    id: "[2].PNG",
    label: "1",
    file: "[2].webp",
  },
  {
    id: "[1].PNG",
    label: "2",
    file: "[1].webp",
  },
  {
    id: "[3].PNG",
    label: "3",
    file: "[3].webp",
  },
  {
    id: "[4].PNG",
    label: "4",
    file: "[4].webp",
  },
  {
    id: "[5].PNG",
    label: "5",
    file: "[5].webp",
  },
  {
    id: "[6].PNG",
    label: "6",
    file: "[6].webp",
  },
  {
    id: "[7].PNG",
    label: "7",
    file: "[7].webp",
  },
  {
    id: "[8].PNG",
    label: "8",
    file: "[8].webp",
  },
  {
    id: "[9].PNG",
    label: "9",
    file: "[9].webp",
  },
  {
    id: "[CORNER].PNG",
    label: "Corner",
    file: "[CORNER].webp",
  },
  {
    id: "[CRYSTAL01].PNG",
    label: "Crystal 1",
    file: "[CRYSTAL01].webp",
  },
  {
    id: "[CRYSTAL02].PNG",
    label: "Crystal 2",
    file: "[CRYSTAL02].webp",
  },
  {
    id: "[CRYSTAL03].PNG",
    label: "Crystal 3",
    file: "[CRYSTAL03].webp",
  },
  {
    id: "[PATCH01].PNG",
    label: "Patch 1",
    file: "[PATCH01].webp",
  },
  {
    id: "[PATCH02].PNG",
    label: "Patch 2",
    file: "[PATCH02].webp",
  },
  {
    id: "[PATCH03].PNG",
    label: "Patch 3",
    file: "[PATCH03].webp",
  },
  {
    id: "[PATCH04].PNG",
    label: "Patch 4",
    file: "[PATCH04].webp",
  },
  {
    id: "[PATCH05].PNG",
    label: "Patch 5",
    file: "[PATCH05].webp",
  },
  {
    id: "[PATCH06].PNG",
    label: "Patch 6",
    file: "[PATCH06].webp",
  },
  {
    id: "[PIN01].PNG",
    label: "Pin 1",
    file: "[PIN01].webp",
  },
  {
    id: "[PIN02].PNG",
    label: "Pin 2",
    file: "[PIN02].webp",
  },
  {
    id: "[PIN03].PNG",
    label: "Pin 3",
    file: "[PIN03].webp",
  },
  {
    id: "[PIN04].PNG",
    label: "Pin 4",
    file: "[PIN04].webp",
  },
  {
    id: "[PIN05].PNG",
    label: "Pin 5",
    file: "[PIN05].webp",
  },
  { id: "[STAR02].PNG", label: "Star 2", file: "[STAR02].webp" },
  { id: "[STAR03].png", label: "Star 3", file: "[STAR03].webp" },
  { id: "[PHONE02].PNG", label: "Phone 2", file: "[PHONE02].webp" },
  { id: "[IHEARTME].png", label: "I Heart Me", file: "[IHEARTME].webp" },
  { id: "[MYNAMEIS01].png", label: "My Name Is 1", file: "[MYNAMEIS01].webp" },
  { id: "[MYNAMEIS02].png", label: "My Name Is 2", file: "[MYNAMEIS02].webp" },
  { id: "[MYNAMEIS03].png", label: "My Name Is 3", file: "[MYNAMEIS03].webp" },
  { id: "[SIGN01].PNG", label: "Sign", file: "[SIGN01].webp" },
  { id: "[SUPERSTAR].png", label: "Superstar", file: "[SUPERSTAR].webp" },
  { id: "[SWAG].png", label: "Swag", file: "[SWAG].webp" },
  { id: "IMG_6115.PNG", label: "Extra sticker 2", file: "IMG_6115.webp" },
  ...Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ", (letter) => {
    const file = `${letter}.webp`;
    return { id: letter === "S" ? "S.PNG" : `${letter}.png`, label: `Letter ${letter}`, file };
  }),
  { id: "AND.png", label: "Ampersand", file: "AND.webp" },
  { id: "exclamation.png", label: "Exclamation mark", file: "exclamation.webp" },
];

export const STICKER_OPTIONS: StickerAsset[] = assets.map(
  ({ id, label, file }) => ({
    id,
    label,
    src: `/stickers/${encodeURIComponent(file)}`,
  }),
);
