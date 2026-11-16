// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { useLanguage, translate } from "./useLanguage";
import { usePhotoboothStore } from "../store/usePhotoboothStore";
import { AppStep } from "../types/photobooth.types";
import { PATTERN_OPTIONS } from "../utils/constants";

vi.mock("../hooks/useStripPreview", () => ({
  useStripPreview: () => ({
    url: "data:image/png;base64,test",
    error: null,
    retry: vi.fn(),
  }),
}));
beforeEach(() => {
  // Node's experimental localStorage has no methods in this runner; use a browser-like storage double.
  const saved = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => saved.set(key, value),
  });
  useLanguage.getState().setLanguage("en");
  usePhotoboothStore.getState().resetSession();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  useLanguage.getState().setLanguage("en");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("language selection", () => {
  it("switches the home and subsequent steps, saves the preference and retains it after returning home", () => {
    render(<App />);
    expect(document.title).toBe("The Photobooth");
    fireEvent.change(screen.getByLabelText("Language / Idioma"), {
      target: { value: "es" },
    });
    expect(document.documentElement.lang).toBe("es");
    expect(window.localStorage.getItem("photobooth-language")).toBe("es");
    fireEvent.click(screen.getByRole("button", { name: "EMPEZAR" }));
    expect(
      screen.getByRole("heading", { name: "1. elige la cantidad de fotos" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "3 fotos" }));
    fireEvent.click(screen.getByRole("button", { name: "siguiente →" }));
    expect(
      screen.getByRole("heading", { name: "2. elige el estilo de tu tira" }),
    ).toBeTruthy();
    expect(screen.getByRole("option", { name: "patrones" })).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Patrón 1" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "← atrás" }));
    fireEvent.click(screen.getByRole("button", { name: "← atrás" }));
    expect(screen.getByRole("button", { name: "EMPEZAR" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Language / Idioma"), {
      target: { value: "en" },
    });
    expect(screen.getByRole("button", { name: "START" })).toBeTruthy();
    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe("The Photobooth");
  });

  it("translates results and sticker tools without changing existing photos or stickers", () => {
    const photos = [{ dataUrl: "data:image/jpeg;base64,test", takenAt: 1 }];
    const stickers = [
      {
        id: "test",
        assetId: "heart",
        src: "/stickers/[HEART].PNG",
        label: "Heart",
        x: 0.5,
        y: 0.5,
        width: 0.28,
        aspectRatio: 1,
      },
    ];
    usePhotoboothStore.setState({
      currentStep: AppStep.Result,
      photoCount: 1,
      stripBg: PATTERN_OPTIONS[0],
      capturedPhotos: photos,
      stickers,
    });
    render(<App />);
    act(() => useLanguage.getState().setLanguage("es"));
    expect(screen.getByRole("link", { name: "DESCARGAR" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "PERSONALIZAR" })).toBeTruthy();
    act(() => usePhotoboothStore.getState().goToStep(AppStep.Stickers));
    fireEvent.click(screen.getByRole("button", { name: "Mover Corazón" }));
    expect(screen.getByLabelText("tamaño")).toBeTruthy();
    expect(screen.getByLabelText("rotación")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Duplicar sticker" }),
    ).toBeTruthy();
    expect(usePhotoboothStore.getState().capturedPhotos).toBe(photos);
    expect(usePhotoboothStore.getState().stickers).toBe(stickers);
    act(() => usePhotoboothStore.getState().resetSession());
    expect(screen.getByRole("button", { name: "EMPEZAR" })).toBeTruthy();
  });

  it("translates error messages and interpolated labels", () => {
    expect(translate("es", "No camera found. Connect one and try again.")).toBe(
      "No se encontró una cámara. Conecta una e inténtalo de nuevo.",
    );
    expect(
      translate("es", "Page {page} of {total}", { page: 2, total: 4 }),
    ).toBe("Página 2 de 4");
    expect(
      translate("en", "Page {page} of {total}", { page: 2, total: 4 }),
    ).toBe("Page 2 of 4");
  });
});
