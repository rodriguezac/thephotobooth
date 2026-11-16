// ============================================================
// STORE — usePhotoboothStore (Zustand)
// Maneja el estado global de toda la sesión del photobooth.
// Separado de la lógica de cámara (ver /hooks/useCamera.ts).
// ============================================================

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type {
  PhotoboothStore,
  PhotoboothState,
} from "../types/photobooth.types";

import { AppStep, PhotoFilter } from "../types/photobooth.types";

// ------------------------------------------------------------
// Estado inicial
// ------------------------------------------------------------
const initialState: PhotoboothState = {
  currentStep: AppStep.Welcome,
  photoCount: null,
  stripBg: null,
  customPattern: null,
  activeStyleTab: "patterns",
  filter: PhotoFilter.Normal,
  capturedPhotos: [],
  stickers: [],
  stripDataUrl: null,
  isCameraActive: false,
};

// ------------------------------------------------------------
// Store Zustand
// ------------------------------------------------------------
export const usePhotoboothStore = create<PhotoboothStore>()(
  devtools(
    (set, get) => ({
      // ---- Estado inicial ----------------------------------
      ...initialState,

      // ---- Navegación entre pasos -------------------------
      nextStep: () => {
        const { currentStep } = get();
        const next =
          currentStep === AppStep.Stickers
            ? AppStep.Result
            : (Math.min(currentStep + 1, AppStep.Result) as AppStep);
        set({ currentStep: next }, false, "nextStep");
      },

      prevStep: () => {
        const { currentStep, capturedPhotos, photoCount } = get();
        const hasFinishedStrip =
          photoCount !== null &&
          capturedPhotos.length > 0 &&
          capturedPhotos.length === photoCount;
        // Customization is a loop back to the result, not the start of a new shoot.
        const prev =
          currentStep === AppStep.Stickers
            ? AppStep.Filter
            : currentStep === AppStep.StripStyle && hasFinishedStrip
              ? AppStep.Result
              : (Math.max(currentStep - 1, AppStep.Welcome) as AppStep);
        set({ currentStep: prev }, false, "prevStep");
      },

      goToStep: (step: AppStep) => {
        set({ currentStep: step }, false, "goToStep");
      },

      // ---- Selecciones del usuario -------------------------
      setPhotoCount: (count) => {
        set(
          {
            photoCount: count,
            capturedPhotos: [],
            stickers: [],
            stripDataUrl: null,
          },
          false,
          "setPhotoCount",
        );
      },

      setStripBg: (bg) => {
        set({ stripBg: bg }, false, "setStripBg");
      },

      setCustomPattern: (pattern) => {
        set(
          { customPattern: pattern, stripBg: pattern },
          false,
          "setCustomPattern",
        );
      },

      setActiveStyleTab: (tab) => {
        set({ activeStyleTab: tab }, false, "setActiveStyleTab");
      },

      setFilter: (filter) => {
        set({ filter }, false, "setFilter");
      },

      addSticker: (sticker) =>
        set((state) => ({ stickers: [...state.stickers, sticker] })),
      updateSticker: (id, changes) =>
        set((state) => ({
          stickers: state.stickers.map((sticker) =>
            sticker.id === id ? { ...sticker, ...changes } : sticker,
          ),
        })),
      removeSticker: (id) =>
        set((state) => ({
          stickers: state.stickers.filter((sticker) => sticker.id !== id),
        })),

      // ---- Captura de fotos --------------------------------
      addCapturedPhoto: (photo) => {
        set(
          (state) => ({
            capturedPhotos: [...state.capturedPhotos, photo],
          }),
          false,
          "addCapturedPhoto",
        );
      },

      setStripDataUrl: (url) => {
        set({ stripDataUrl: url }, false, "setStripDataUrl");
      },

      // ---- Cámara ------------------------------------------
      setCameraActive: (active) => {
        set({ isCameraActive: active }, false, "setCameraActive");
      },

      repeatSession: () => {
        const { photoCount, stripBg } = get();
        set(
          {
            currentStep:
              photoCount && stripBg ? AppStep.Capture : AppStep.PhotoCount,
            capturedPhotos: [],
            stripDataUrl: null,
            isCameraActive: false,
          },
          false,
          "repeatSession",
        );
      },

      // ---- Reset de sesión --------------------------------
      resetSession: () => {
        set({ ...initialState }, false, "resetSession");
      },
    }),
    { name: "PhotoboothStore" },
  ),
);

// ------------------------------------------------------------
// Selectores atómicos (evita re-renders innecesarios)
// ------------------------------------------------------------
export const selectCurrentStep = (s: PhotoboothStore) => s.currentStep;
export const selectPhotoCount = (s: PhotoboothStore) => s.photoCount;
export const selectStripBg = (s: PhotoboothStore) => s.stripBg;
export const selectActiveStyleTab = (s: PhotoboothStore) => s.activeStyleTab;
export const selectFilter = (s: PhotoboothStore) => s.filter;
export const selectCapturedPhotos = (s: PhotoboothStore) => s.capturedPhotos;
export const selectStripDataUrl = (s: PhotoboothStore) => s.stripDataUrl;
export const selectIsCameraActive = (s: PhotoboothStore) => s.isCameraActive;
