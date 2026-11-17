// ============================================================
// DATA — Constantes de la app (patrones, sólidos, filtros)
// Estas listas son datos puros, sin lógica de UI.
// ============================================================

import type {
  PatternStyle,
  SolidStyle,
  PhotoFilterOption,
  PhotoCountOption,
} from "../types/photobooth.types";

import { PhotoFilter } from "../types/photobooth.types";

// ------------------------------------------------------------
// Opciones de cantidad de fotos
// ------------------------------------------------------------
export const PHOTO_COUNT_OPTIONS: PhotoCountOption[] = [
  { value: 1, label: "1", caption: "solo shot" },
  { value: 2, label: "2", caption: "duo" },
  { value: 3, label: "3", caption: "trio" },
  { value: 4, label: "4", caption: "squad goals" },
];

// ------------------------------------------------------------
// Patrones (imágenes de /public/patrones/)
// ------------------------------------------------------------
// IDs match all numbered files available in public/patrones.
export const PATTERN_OPTIONS: PatternStyle[] = Array.from(
  { length: 27 },
  (_, i) => i + 1,
).map((id) => ({
  type: "pattern",
  id,
  src: `/patrones/${id}.webp`,
  label: `Pattern ${id}`,
}));

// ------------------------------------------------------------
// Colores sólidos para el strip
// ------------------------------------------------------------
export const SOLID_OPTIONS: SolidStyle[] = [
  { type: "solid", name: "rose", color: "#df7a9a", label: "Rose" },
  { type: "solid", name: "blush", color: "#fdb9cf", label: "Blush" },
  { type: "solid", name: "petal", color: "#f9ced8", label: "Petal" },
  { type: "solid", name: "cream", color: "#fff5cf", label: "Cream" },
  { type: "solid", name: "orange", color: "#ff914d", label: "Orange" },
  { type: "solid", name: "lime", color: "#c0c63a", label: "Lime" },
  { type: "solid", name: "sage", color: "#cad6ba", label: "Sage" },
  { type: "solid", name: "sky", color: "#c2e7ed", label: "Sky" },
  { type: "solid", name: "ice", color: "#cdf8ff", label: "Ice" },
  { type: "solid", name: "white", color: "#ffffff", label: "White" },
  { type: "solid", name: "lavender", color: "#cbb8f0", label: "Lavender" },
  { type: "solid", name: "lilac", color: "#e6c6ee", label: "Lilac" },
  { type: "solid", name: "periwinkle", color: "#9dade7", label: "Periwinkle" },
  { type: "solid", name: "mint", color: "#bde5d5", label: "Mint" },
  { type: "solid", name: "peach", color: "#ffd1b5", label: "Peach" },
  { type: "solid", name: "coral", color: "#ff7f87", label: "Coral" },
  { type: "solid", name: "cherry", color: "#b91f45", label: "Cherry" },
  { type: "solid", name: "cobalt", color: "#3155c7", label: "Cobalt" },
  { type: "solid", name: "cocoa", color: "#6b453c", label: "Cocoa" },
  { type: "solid", name: "charcoal", color: "#26232c", label: "Charcoal" },
];

// ------------------------------------------------------------
// Filtros fotográficos con sus CSS filter strings
// ------------------------------------------------------------
export const FILTER_OPTIONS: PhotoFilterOption[] = [
  {
    value: PhotoFilter.SepiaFilm,
    label: "Sepia Film",
    description: "Warm monochrome, film grain and soft vignette",
    cssFilter: "none",
  },
  {
    value: PhotoFilter.RosePop,
    label: "Rose Pop",
    description: "Posterized burgundy, pink and cream",
    cssFilter: "none",
  },
  {
    value: PhotoFilter.PinkInk,
    label: "Pink Ink",
    description: "Grainy black and dusty pink duotone",
    cssFilter: "none",
  },
  {
    value: PhotoFilter.BlueMoon,
    label: "Blue Moon",
    description: "Electric blue shadows and pale yellow highlights",
    cssFilter: "none",
  },
  {
    value: PhotoFilter.Normal,
    label: "Normal",
    description: "No filter",
    cssFilter: "none",
  },
  {
    value: PhotoFilter.Year2016,
    label: "2016",
    description: "Pink and violet nostalgia, warm highlights and soft texture",
    cssFilter: "contrast(1.14) brightness(1.03) saturate(1.16) sepia(0.1)",
    overlay: {
      src: "/filters/2016-gradient.png",
      opacity: 0.7,
      blendMode: "soft-light",
    },
  },
  {
    value: PhotoFilter.Sepia,
    label: "Sepia",
    description: "Warm golden tones",
    cssFilter: "sepia(80%) contrast(1.1) brightness(1.05)",
  },
  {
    value: PhotoFilter.BW,
    label: "B&W",
    description: "Classic black and white",
    cssFilter: "grayscale(100%) contrast(1.15)",
  },
  {
    value: PhotoFilter.Vintage,
    label: "Vintage",
    description: "90s Film",
    cssFilter:
      "sepia(30%) saturate(1.4) hue-rotate(-15deg) contrast(1.05) brightness(0.95)",
  },
  {
    value: PhotoFilter.Cool,
    label: "Cool",
    description: "Polaroid look",
    cssFilter:
      "saturate(0.85) hue-rotate(15deg) brightness(1.1) contrast(0.95)",
  },
];
