import { useTranslation } from "../../../i18n/useLanguage";
import { getStripLayout } from "../../../utils/stripLayout";
import { useEffect, useRef } from "react";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { AppStep } from "../../../types/photobooth.types";
import { useStripPreview } from "../../../hooks/useStripPreview";
import { Watermark } from "../../ui/Watermark";
export function ResultScreen() {
  const t = useTranslation();
  const {
    capturedPhotos,
    stripBg,
    filter,
    stickers,
    goToStep,
    repeatSession,
    resetSession,
  } = usePhotoboothStore();
  const zoomRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previewRef = useRef<HTMLButtonElement>(null);
  const zoomAnimation = useRef<Animation | null>(null);

  const getZoomOrigin = () => {
    const source = triggerRef.current?.getBoundingClientRect();
    const target = previewRef.current?.getBoundingClientRect();
    if (!source || !target || !target.width || !target.height) return "none";
    return `translate(${source.x + source.width / 2 - target.x - target.width / 2}px, ${source.y + source.height / 2 - target.y - target.height / 2}px) scale(${source.width / target.width}, ${source.height / target.height})`;
  };
  const zoomDuration = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 420;

  const openZoom = () => {
    const dialog = zoomRef.current;
    if (!dialog || dialog.open) return;
    dialog.classList.remove("is-closing");
    dialog.showModal();
    zoomAnimation.current?.cancel();
    zoomAnimation.current =
      previewRef.current?.animate(
        [{ transform: getZoomOrigin() }, { transform: "none" }],
        { duration: zoomDuration(), easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      ) ?? null;
  };
  const closeZoom = () => {
    const dialog = zoomRef.current;
    const preview = previewRef.current;
    if (!dialog?.open || !preview || dialog.classList.contains("is-closing"))
      return;
    // Preserve the current size if the entrance is interrupted.
    const currentTransform = window.getComputedStyle(preview).transform;
    zoomAnimation.current?.cancel();
    const origin = getZoomOrigin();
    dialog.classList.add("is-closing");
    zoomAnimation.current = preview.animate(
      [{ transform: currentTransform }, { transform: origin }],
      {
        duration: zoomDuration(),
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
      },
    );
    void zoomAnimation.current.finished.then(
      () => {
        dialog.close();
        zoomAnimation.current?.cancel();
        dialog.classList.remove("is-closing");
      },
      () => {},
    );
  };
  useEffect(() => () => zoomAnimation.current?.cancel(), []);
  const { url, error, retry } = useStripPreview(
    capturedPhotos,
    stripBg,
    filter,
    stickers,
  );
  const layout = getStripLayout(capturedPhotos.length || 1);
  return (
    <section className="screen result-screen">
      <header className="screen-heading">
        <h1>{t("5. taDa")}</h1>
      </header>
      <div className="result-layout">
        <div
          className={`printer ${capturedPhotos.length === 4 ? "printer-wide" : ""}`}
        >
          <img
            className="printer-slot"
            src="/extras/ranura.webp"
            alt={t("Photo printer")}
          />
          <div
            className="print-window"
            style={{ aspectRatio: `${layout.width} / ${layout.height}` }}
          >
            {url ? (
              <button
                ref={triggerRef}
                className="strip-zoom-trigger"
                aria-label={t("Enlarge photo strip")}
                onClick={openZoom}
              >
                <img
                  className="finished-strip"
                  src={url}
                  alt={t("Your finished strip with {count} photos", {
                    count: capturedPhotos.length,
                  })}
                />
              </button>
            ) : (
              <p className="printing" role="status">
                {error ? t("oops :(") : t("printing…")}
              </p>
            )}
          </div>
        </div>
        <div className="result-actions">
          <a
            className={`pill ${url ? "" : "disabled"}`}
            id="btn-download"
            href={url ?? undefined}
            download="the-photobooth.png"
            aria-disabled={!url}
            onClick={(e) => {
              if (!url) e.preventDefault();
            }}
          >
            {t("DOWNLOAD")}
          </a>
          <button
            className="pill outline"
            id="btn-repeat"
            onClick={repeatSession}
          >
            {t("REPEAT")}
          </button>
          <button
            className="pill outline"
            id="btn-customize"
            onClick={() => goToStep(AppStep.StripStyle)}
          >
            {t("CUSTOMIZE")}
          </button>
          <button
            className="pill outline"
            id="btn-main-menu"
            onClick={resetSession}
          >
            {t("MAIN MENU")}
          </button>
          {error && (
            <div className="camera-error" role="alert">
              <p>{t(error)}</p>
              <button className="text-button" onClick={retry}>
                {t("retry")}
              </button>
            </div>
          )}
        </div>
      </div>
      <dialog
        ref={zoomRef}
        className={`strip-zoom ${capturedPhotos.length === 4 ? "strip-zoom-wide" : ""}`}
        aria-label={t("Enlarged photo strip")}
        onCancel={(event) => {
          event.preventDefault();
          closeZoom();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeZoom();
        }}
      >
        {url && (
          <button
            ref={previewRef}
            className="strip-zoom-close"
            aria-label={t("Close enlarged photo strip")}
            onClick={closeZoom}
          >
            <img src={url} alt={t("Enlarged photo strip")} />
          </button>
        )}
      </dialog>
      <Watermark />
    </section>
  );
}
