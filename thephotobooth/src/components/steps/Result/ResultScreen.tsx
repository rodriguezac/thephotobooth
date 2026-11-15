import { useEffect, useRef, useState } from "react";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { AppStep } from "../../../types/photobooth.types";
import { generateStrip } from "../../../utils/canvasUtils";
import { ShareQr } from "../../ui/ShareQr";
import { Watermark } from "../../ui/Watermark";
export function ResultScreen() {
  const { capturedPhotos, stripBg, filter, goToStep, resetSession } =
    usePhotoboothStore();
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
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    setError(null);
    if (!stripBg || !capturedPhotos.length) {
      setError("No hay fotos para crear la tira. Vuelve a empezar.");
      return;
    }
    generateStrip(capturedPhotos, stripBg, filter)
      .then((result) => {
        if (!cancelled) setUrl(result);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo crear la tira. Intenta de nuevo.");
      });
    return () => {
      cancelled = true;
    };
  }, [capturedPhotos, stripBg, filter, attempt]);
  return (
    <section className="screen result-screen">
      <header className="screen-heading">
        <h1>5. taDa</h1>
      </header>
      <div className="result-layout">
        <div
          className={`printer ${capturedPhotos.length === 4 ? "printer-wide" : ""}`}
        >
          <img
            className="printer-slot"
            src="/extras/ranura.webp"
            alt="Photo printer"
          />
          <div className="print-window">
            {url ? (
              <button
                ref={triggerRef}
                className="strip-zoom-trigger"
                aria-label="Enlarge photo strip"
                onClick={openZoom}
              >
                <img
                  className="finished-strip"
                  src={url}
                  alt={`Your finished strip with ${capturedPhotos.length} photos`}
                />
              </button>
            ) : (
              <p className="printing" role="status">
                {error ? "oops :(" : "printing…"}
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
            DOWNLOAD
          </a>
          <button
            className="pill outline"
            id="btn-repeat"
            onClick={resetSession}
          >
            REPEAT
          </button>
          <button
            className="pill outline"
            id="btn-customize"
            onClick={() => goToStep(AppStep.StripStyle)}
          >
            CUSTOMIZE
          </button>
          <ShareQr key={url ?? "pending"} imageUrl={url} />
          {error && (
            <div className="camera-error" role="alert">
              <p>{error}</p>
              <button
                className="text-button"
                onClick={() => setAttempt((a) => a + 1)}
              >
                retry
              </button>
            </div>
          )}
        </div>
      </div>
      <dialog
        ref={zoomRef}
        className={`strip-zoom ${capturedPhotos.length === 4 ? "strip-zoom-wide" : ""}`}
        aria-label="Enlarged photo strip"
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
            aria-label="Close enlarged photo strip"
            onClick={closeZoom}
          >
            <img src={url} alt="Enlarged photo strip" />
          </button>
        )}
      </dialog>
      <Watermark />
    </section>
  );
}
