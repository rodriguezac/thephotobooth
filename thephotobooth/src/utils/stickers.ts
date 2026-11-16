import type { StickerAsset } from "../types/photobooth.types";

const assets = [
  {
    id: "[HEART].PNG",
    label: "Heart",
    file: "[HEART].PNG",
  },
  {
    id: "[ESTRELLA].png",
    label: "Star",
    file: "[ESTRELLA].png",
  },
  {
    id: "[PHONE].PNG",
    label: "Phone",
    file: "[PHONE].PNG",
  },
  {
    id: "[SIMS].PNG",
    label: "Sims",
    file: "[SIMS].PNG",
  },
  {
    id: "[EYE].PNG",
    label: "Eye",
    file: "[EYE].PNG",
  },
  {
    id: "IMG_6072.PNG",
    label: "Extra sticker",
    file: "IMG_6072.PNG",
  },
  {
    id: "[0].PNG",
    label: "0",
    file: "[0].PNG",
  },
  {
    id: "[2].PNG",
    label: "1",
    file: "[2].PNG",
  },
  {
    id: "[1].PNG",
    label: "2",
    file: "[1].PNG",
  },
  {
    id: "[3].PNG",
    label: "3",
    file: "[3].PNG",
  },
  {
    id: "[4].PNG",
    label: "4",
    file: "[4].PNG",
  },
  {
    id: "[5].PNG",
    label: "5",
    file: "[5].PNG",
  },
  {
    id: "[6].PNG",
    label: "6",
    file: "[6].PNG",
  },
  {
    id: "[7].PNG",
    label: "7",
    file: "[7].PNG",
  },
  {
    id: "[8].PNG",
    label: "8",
    file: "[8].PNG",
  },
  {
    id: "[9].PNG",
    label: "9",
    file: "[9].PNG",
  },
  {
    id: "[CORNER].PNG",
    label: "Corner",
    file: "[CORNER].PNG",
  },
  {
    id: "[CRYSTAL01].PNG",
    label: "Crystal 1",
    file: "[CRYSTAL01].PNG",
  },
  {
    id: "[CRYSTAL02].PNG",
    label: "Crystal 2",
    file: "[CRYSTAL02].PNG",
  },
  {
    id: "[CRYSTAL03].PNG",
    label: "Crystal 3",
    file: "[CRYSTAL03].PNG",
  },
  {
    id: "[PATCH01].PNG",
    label: "Patch 1",
    file: "[PATCH01].PNG",
  },
  {
    id: "[PATCH02].PNG",
    label: "Patch 2",
    file: "[PATCH02].PNG",
  },
  {
    id: "[PATCH03].PNG",
    label: "Patch 3",
    file: "[PATCH03].PNG",
  },
  {
    id: "[PATCH04].PNG",
    label: "Patch 4",
    file: "[PATCH04].PNG",
  },
  {
    id: "[PATCH05].PNG",
    label: "Patch 5",
    file: "[PATCH05].PNG",
  },
  {
    id: "[PATCH06].PNG",
    label: "Patch 6",
    file: "[PATCH06].PNG",
  },
  {
    id: "[PIN01].PNG",
    label: "Pin 1",
    file: "[PIN01].PNG",
  },
  {
    id: "[PIN02].PNG",
    label: "Pin 2",
    file: "[PIN02].PNG",
  },
  {
    id: "[PIN03].PNG",
    label: "Pin 3",
    file: "[PIN03].PNG",
  },
  {
    id: "[PIN04].PNG",
    label: "Pin 4",
    file: "[PIN04].PNG",
  },
  {
    id: "[PIN05].PNG",
    label: "Pin 5",
    file: "[PIN05].PNG",
  },
  { id: "[STAR02].PNG", label: "Star 2", file: "[STAR02].PNG" },
  { id: "[STAR03].png", label: "Star 3", file: "[STAR03].png" },
  { id: "[PHONE02].PNG", label: "Phone 2", file: "[PHONE02].PNG" },
  { id: "[IHEARTME].png", label: "I Heart Me", file: "[IHEARTME].png" },
  { id: "[MYNAMEIS01].png", label: "My Name Is 1", file: "[MYNAMEIS01].png" },
  { id: "[MYNAMEIS02].png", label: "My Name Is 2", file: "[MYNAMEIS02].png" },
  { id: "[MYNAMEIS03].png", label: "My Name Is 3", file: "[MYNAMEIS03].png" },
  { id: "[SIGN01].PNG", label: "Sign", file: "[SIGN01].PNG" },
  { id: "[SUPERSTAR].png", label: "Superstar", file: "[SUPERSTAR].png" },
  { id: "[SWAG].png", label: "Swag", file: "[SWAG].png" },
  { id: "IMG_6115.PNG", label: "Extra sticker 2", file: "IMG_6115.PNG" },
  {
    id: "A.png",
    label: "Letter A",
    file: "A.png",
  },
  {
    id: "B.png",
    label: "Letter B",
    file: "B.png",
  },
  {
    id: "C.png",
    label: "Letter C",
    file: "C.png",
  },
  {
    id: "D.png",
    label: "Letter D",
    file: "D.png",
  },
  {
    id: "E.png",
    label: "Letter E",
    file: "E.png",
  },
  {
    id: "J.png",
    label: "Letter J",
    file: "J.png",
  },
  {
    id: "K.png",
    label: "Letter K",
    file: "K.png",
  },
  {
    id: "L.png",
    label: "Letter L",
    file: "L.png",
  },
  {
    id: "M.png",
    label: "Letter M",
    file: "M.png",
  },
  {
    id: "N.png",
    label: "Letter N",
    file: "N.png",
  },
  {
    id: "O.png",
    label: "Letter O",
    file: "O.png",
  },
  {
    id: "T.png",
    label: "Letter T",
    file: "T.png",
  },
  {
    id: "U.png",
    label: "Letter U",
    file: "U.png",
  },
  {
    id: "V.png",
    label: "Letter V",
    file: "V.png",
  },
  {
    id: "W.png",
    label: "Letter W",
    file: "W.png",
  },
  {
    id: "X.png",
    label: "Letter X",
    file: "X.png",
  },
  {
    id: "Y.png",
    label: "Letter Y",
    file: "Y.png",
  },
];

export const STICKER_OPTIONS: StickerAsset[] = assets.map(
  ({ id, label, file }) => ({
    id,
    label,
    src: `/stickers/${encodeURIComponent(file)}`,
  }),
);
