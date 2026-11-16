import { create } from "zustand";
import { es } from "./es";

export type Language = "en" | "es";
const STORAGE_KEY = "photobooth-language";
function savedLanguage(): Language {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "es" ? "es" : "en";
  } catch {
    return "en";
  }
}
export const useLanguage = create<{
  language: Language;
  setLanguage: (language: Language) => void;
}>((set) => ({
  language: savedLanguage(),
  setLanguage: (language) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* Still works when storage is unavailable. */
    }
    set({ language });
  },
}));

type Params = Record<string, string | number>;
export function translate(
  language: Language,
  message: string,
  params: Params = {},
): string {
  const text = language === "es" ? (es[message] ?? message) : message;
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    String(params[key] ?? match),
  );
}
const english = (message: string, params?: Params) =>
  translate("en", message, params);
const spanish = (message: string, params?: Params) =>
  translate("es", message, params);
export function useTranslation() {
  return useLanguage((state) => state.language) === "es" ? spanish : english;
}
