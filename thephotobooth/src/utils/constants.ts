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
export const PATTERN_OPTIONS: PatternStyle[] = Array.from(
  { length: 10 },
  (_, i) => ({
    type: "pattern" as const,
    id: i + 1,
    src: `/patrones/${i + 1}.png`,
    label: `Pattern ${i + 1}`,
  }),
);

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
];

// ------------------------------------------------------------
// Filtros fotográficos con sus CSS filter strings
// ------------------------------------------------------------
export const FILTER_OPTIONS: PhotoFilterOption[] = [
  {
    value: PhotoFilter.Normal,
    label: "Normal",
    description: "Sin filtro",
    cssFilter: "none",
  },
  {
    value: PhotoFilter.Sepia,
    label: "Sepia",
    description: "Tono dorado cálido",
    cssFilter: "sepia(80%) contrast(1.1) brightness(1.05)",
  },
  {
    value: PhotoFilter.BW,
    label: "B&W",
    description: "Blanco y negro clásico",
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
