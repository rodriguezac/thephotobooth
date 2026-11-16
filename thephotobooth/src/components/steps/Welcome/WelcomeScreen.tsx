import {
  useLanguage,
  useTranslation,
  type Language,
} from "../../../i18n/useLanguage";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { AppStep } from "../../../types/photobooth.types";
export function WelcomeScreen() {
  const t = useTranslation();
  const { language, setLanguage } = useLanguage();
  const goToStep = usePhotoboothStore((s) => s.goToStep);
  return (
    <section className="welcome">
      <label className="language-picker">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18" />
        </svg>
        <span className="sr-only">Language / Idioma</span>
        <select
          aria-label="Language / Idioma"
          value={language}
          onChange={(event) => setLanguage(event.target.value as Language)}
        >
          <option value="en" lang="en">
            English
          </option>
          <option value="es" lang="es">
            Español
          </option>
        </select>
      </label>
      <div className="paper-note">
        <img src="/extras/paper.png" alt="" />
        <div className="paper-copy">
          <h1>The Photobooth</h1>
          <button
            className="pill"
            id="btn-start"
            onClick={() => goToStep(AppStep.PhotoCount)}
          >
            {t("START")}
          </button>
        </div>
      </div>
    </section>
  );
}
