// ============================================================
// TYPES & INTERFACES — The Photobooth
// Todos los contratos de datos de la aplicación.
// ============================================================

// ------------------------------------------------------------
// Paso de la aplicación (flujo de 6 pantallas)
// ------------------------------------------------------------
export enum AppStep {
  Welcome = 0,
  PhotoCount = 1,
  StripStyle = 2,
  Filter = 3,
  Capture = 4,
  Result = 5,
  Stickers = 6,
}

// ------------------------------------------------------------
// Cantidad de fotos
// ------------------------------------------------------------
export type PhotoCount = 1 | 2 | 3 | 4;

export interface PhotoCountOption {
  /** Número de fotos */
  value: PhotoCount;
  /** Etiqueta visual, p.ej. "1 Photo" */
  label: string;
  /** Descripción secundaria, p.ej. "solo shot" */
  caption: string;
}

// ------------------------------------------------------------
// Estilo del strip — Patrones
// ------------------------------------------------------------
export interface PatternStyle {
  type: "pattern";
  /** ID del archivo de patrón */
  id: number;
  /** Ruta pública a la imagen, p.ej. "/patrones/1.png" */
  src: string;
  label: string;
}

// ------------------------------------------------------------
// Estilo del strip — Sólidos
// ------------------------------------------------------------
export interface SolidStyle {
  type: "solid";
  /** Nombre semántico del color, p.ej. "rose" */
  name: string;
  /** Valor hexadecimal del color */
  color: string;
  label: string;
}

export interface CustomPattern {
  type: "custom";
  id: string;
  src: string;
  label: string;
  name: string;
  width: number;
  height: number;
}

/** Unión discriminada del fondo del strip */
export type StripBackground = PatternStyle | SolidStyle | CustomPattern;

// ------------------------------------------------------------
// Pestaña de selección de estilo
// ------------------------------------------------------------
export type StyleTab = "patterns" | "solids" | "custom";

// ------------------------------------------------------------
// Filtros fotográficos
// ------------------------------------------------------------
export enum PhotoFilter {
  Normal = "normal",
  Sepia = "sepia",
  BW = "bw",
  Vintage = "vintage",
  Cool = "cool",
  Year2016 = "2016",
  SepiaFilm = "sepia-film",
  RosePop = "rose-pop",
  PinkInk = "pink-ink",
  BlueMoon = "blue-moon",
}

export interface PhotoFilterOption {
  value: PhotoFilter;
  label: string;
  description: string;
  /** CSS filter string que se aplicará al elemento <video> / <canvas> */
  cssFilter: string;
  overlay?: { src: string; opacity: number; blendMode: "soft-light" };
}

// ------------------------------------------------------------
// Foto capturada
// ------------------------------------------------------------
export interface CapturedPhoto {
  /** data-URL de la imagen capturada (JPEG/PNG en base64) */
  dataUrl: string;
  /** Timestamp de la captura */
  takenAt: number;
}

// ------------------------------------------------------------
// Estado global del store
// ------------------------------------------------------------
export interface StickerAsset {
  id: string;
  src: string;
  label: string;
}

export interface PlacedSticker {
  id: string;
  assetId: string;
  src: string;
  label: string;
  /** Center position and width relative to the full strip. */
  x: number;
  y: number;
  width: number;
  aspectRatio: number;
  rotation?: number;
  flipX?: boolean;
  flipY?: boolean;
}

export interface PhotoboothState {
  stickers: PlacedSticker[];
  /** Paso actual en el flujo */
  currentStep: AppStep;

  /** Cantidad de fotos seleccionadas */
  photoCount: PhotoCount | null;

  /** Fondo del strip seleccionado */
  stripBg: StripBackground | null;
  customPattern: CustomPattern | null;

  /** Pestaña activa en la pantalla de estilo */
  activeStyleTab: StyleTab;

  /** Filtro fotográfico seleccionado */
  filter: PhotoFilter;

  /** Fotos capturadas durante el paso Capture */
  capturedPhotos: CapturedPhoto[];

  /** Data-URL del strip final generado */
  stripDataUrl: string | null;

  /** Indica si la cámara está activa */
  isCameraActive: boolean;
  cameraFacing: "user" | "environment";
}

// ------------------------------------------------------------
// Acciones del store
// ------------------------------------------------------------
export interface PhotoboothActions {
  addSticker: (sticker: PlacedSticker) => void;
  updateSticker: (
    id: string,
    changes: Partial<
      Pick<PlacedSticker, "x" | "y" | "width" | "rotation" | "flipX" | "flipY">
    >,
  ) => void;
  removeSticker: (id: string) => void;
  /** Avanza al siguiente paso */
  nextStep: () => void;

  /** Retrocede al paso anterior */
  prevStep: () => void;

  /** Navega directamente a un paso específico */
  goToStep: (step: AppStep) => void;

  /** Selecciona la cantidad de fotos */
  setPhotoCount: (count: PhotoCount) => void;

  /** Selecciona el fondo del strip */
  setStripBg: (bg: StripBackground) => void;
  setCustomPattern: (pattern: CustomPattern) => void;

  /** Cambia la pestaña activa en selección de estilo */
  setActiveStyleTab: (tab: StyleTab) => void;

  /** Selecciona el filtro fotográfico */
  setFilter: (filter: PhotoFilter) => void;

  /** Agrega una foto capturada */
  addCapturedPhoto: (photo: CapturedPhoto) => void;

  /** Establece la data-URL del strip final */
  setStripDataUrl: (url: string) => void;

  /** Activa/desactiva el estado de la cámara */
  setCameraActive: (active: boolean) => void;
  setCameraFacing: (facing: "user" | "environment") => void;

  /** Retake photos while keeping the current style, filter and stickers. */
  repeatSession: () => void;

  /** Reinicia toda la sesión */
  resetSession: () => void;
}

/** Tipo completo del store: estado + acciones */
export type PhotoboothStore = PhotoboothState & PhotoboothActions;
