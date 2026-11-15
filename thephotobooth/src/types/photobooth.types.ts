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
  /** ID del patrón (1–10) */
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

/** Unión discriminada del fondo del strip */
export type StripBackground = PatternStyle | SolidStyle;

// ------------------------------------------------------------
// Pestaña de selección de estilo
// ------------------------------------------------------------
export type StyleTab = "patterns" | "solids";

// ------------------------------------------------------------
// Filtros fotográficos
// ------------------------------------------------------------
export enum PhotoFilter {
  Normal = "normal",
  Sepia = "sepia",
  BW = "bw",
  Vintage = "vintage",
  Cool = "cool",
}

export interface PhotoFilterOption {
  value: PhotoFilter;
  label: string;
  description: string;
  /** CSS filter string que se aplicará al elemento <video> / <canvas> */
  cssFilter: string;
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
export interface PhotoboothState {
  /** Paso actual en el flujo */
  currentStep: AppStep;

  /** Cantidad de fotos seleccionadas */
  photoCount: PhotoCount | null;

  /** Fondo del strip seleccionado */
  stripBg: StripBackground | null;

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
}

// ------------------------------------------------------------
// Acciones del store
// ------------------------------------------------------------
export interface PhotoboothActions {
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

  /** Reinicia toda la sesión */
  resetSession: () => void;
}

/** Tipo completo del store: estado + acciones */
export type PhotoboothStore = PhotoboothState & PhotoboothActions;
