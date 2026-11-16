import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../../i18n/useLanguage";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { readCustomPattern } from "../../../utils/customPattern";

export function CustomPatternPicker({
  onPendingChange,
}: {
  onPendingChange: (pending: boolean) => void;
}) {
  const t = useTranslation();
  const { customPattern, stripBg, setStripBg, setCustomPattern } =
    usePhotoboothStore();
  const request = useRef(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(
    () => () => {
      request.current++;
    },
    [],
  );
  const chooseImage = async (file: File) => {
    const attempt = ++request.current;
    setError(null);
    setPending(true);
    onPendingChange(true);
    try {
      const pattern = await readCustomPattern(file);
      if (attempt === request.current) setCustomPattern(pattern);
    } catch (cause) {
      if (attempt === request.current)
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not open this image. Try a JPG, PNG or WebP file.",
        );
    } finally {
      if (attempt === request.current) {
        setPending(false);
        onPendingChange(false);
      }
    }
  };
  const longest = customPattern
    ? Math.max(customPattern.width, customPattern.height)
    : 1;
  return (
    <div className="custom-pattern-picker">
      <p className="sticker-hint">
        {t(
          "Choose an image from your gallery to repeat as a pattern. Your image stays on this device.",
        )}
      </p>
      <label className="pill outline custom-pattern-upload">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6" />
        </svg>
        {t(customPattern ? "Replace image" : "Upload image")}
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          aria-label={t("Choose pattern image")}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void chooseImage(file);
          }}
        />
      </label>
      <small className="custom-pattern-note">
        {t("Up to 15 MB. JPG, PNG and WebP recommended.")}
      </small>
      {pending && (
        <p className="sticker-hint" role="status">
          {t("Preparing your pattern…")}
        </p>
      )}
      {error && (
        <p className="camera-error" role="alert">
          {t(error)}
        </p>
      )}
      {customPattern && (
        <button
          type="button"
          className="custom-pattern-card"
          aria-label={t("Use your image as a pattern")}
          aria-pressed={
            stripBg?.type === "custom" && stripBg.id === customPattern.id
          }
          onClick={() => setStripBg(customPattern)}
        >
          <span
            className="custom-pattern-preview"
            style={{
              backgroundImage: `url("${customPattern.src}")`,
              backgroundSize: `${(96 * customPattern.width) / longest}px ${(96 * customPattern.height) / longest}px`,
            }}
          />
          <span>{t("Your image")}</span>
          {stripBg?.type === "custom" && stripBg.id === customPattern.id && (
            <b className="selection-mark" aria-hidden="true">
              ✓
            </b>
          )}
        </button>
      )}
    </div>
  );
}
