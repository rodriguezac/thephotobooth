import { StripCreditLink } from "../../ui/StripCreditLink";
import { useTranslation } from "../../../i18n/useLanguage";
import { useEffect, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent } from "react";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import type {
  PlacedSticker,
  StickerAsset,
} from "../../../types/photobooth.types";
import { AppStep } from "../../../types/photobooth.types";
import { useSwipePagination } from "../../../hooks/useSwipePagination";
import { useStickerGestures } from "../../../hooks/useStickerGestures";
import { normalizeRotation } from "../../../utils/stickerGestures";
import { useStripPreview } from "../../../hooks/useStripPreview";
import { getStripLayout } from "../../../utils/stripLayout";
import { STICKER_OPTIONS } from "../../../utils/stickers";
import { NavArrows } from "../../ui/NavArrows";
import { Watermark } from "../../ui/Watermark";

const PAGE_SIZE = 12;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const DRAG_TYPE = "application/x-photobooth-sticker";

export function StickerScreen() {
  const t = useTranslation();
  const {
    capturedPhotos,
    stripBg,
    filter,
    stickers,
    addSticker,
    updateSticker,
    removeSticker,
    prevStep,
    goToStep,
  } = usePhotoboothStore();
  // Keep the base image fixed while dragging. Stickers are composited only for final output.
  const { url, error, retry } = useStripPreview(
    capturedPhotos,
    stripBg,
    filter,
  );
  const boardRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const gestures = useStickerGestures(boardRef, selectedId, setSelectedId);
  const [page, setPage] = useState(0);
  const [assetError, setAssetError] = useState<string | null>(null);
  const selected = stickers.find((sticker) => sticker.id === selectedId);
  const layout = getStripLayout(capturedPhotos.length || 1);
  const angle = ((selected?.rotation ?? 0) * Math.PI) / 180;
  const halfHeight = selected
    ? (selected.width *
        (Math.abs(Math.sin(angle)) +
          Math.abs(Math.cos(angle)) / selected.aspectRatio) *
        layout.width) /
      layout.height /
      2
    : 0;
  const toolbarTop =
    selected && selected.y - halfHeight < 0.12
      ? `clamp(8px, calc(${(selected.y + halfHeight) * 100}% + 12px), calc(100% - 56px))`
      : `clamp(8px, calc(${((selected?.y ?? 0) - halfHeight) * 100}% - 56px), calc(100% - 56px))`;
  const pageCount = Math.ceil(STICKER_OPTIONS.length / PAGE_SIZE);
  const swipePages = useSwipePagination((direction) =>
    setPage((current) => Math.max(0, Math.min(pageCount - 1, current + direction))),
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const placeSticker = async (asset: StickerAsset, x = 0.5, y = 0.5) => {
    setAssetError(null);
    try {
      const image = new Image();
      image.src = asset.src;
      await image.decode();
      if (!mounted.current) return;
      const aspectRatio = image.naturalWidth / image.naturalHeight;
      const width = Math.min(
        0.28,
        ((0.3 * layout.height) / layout.width) * aspectRatio,
      );
      const id = crypto.randomUUID();
      addSticker({
        id,
        assetId: asset.id,
        src: asset.src,
        label: asset.label,
        x: clamp(x),
        y: clamp(y),
        width,
        aspectRatio,
        rotation: 0,
        flipX: false,
        flipY: false,
      });
      setSelectedId(id);
      if (window.matchMedia("(max-width: 700px)").matches) {
        boardRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "center",
        });
      }
    } catch {
      if (mounted.current)
        setAssetError("Could not load that sticker. Please try again.");
    }
  };

  const dropSticker = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const asset = STICKER_OPTIONS.find(
      (item) => item.id === event.dataTransfer.getData(DRAG_TYPE),
    );
    if (!asset || !url) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    void placeSticker(
      asset,
      (event.clientX - bounds.left) / bounds.width,
      (event.clientY - bounds.top) / bounds.height,
    );
  };
  const duplicateSticker = (sticker: PlacedSticker) => {
    gestures.cancelGesture();
    const copy = {
      ...sticker,
      id: crypto.randomUUID(),
      x: clamp(sticker.x + (sticker.x > 0.92 ? -0.04 : 0.04)),
      y: clamp(sticker.y + (sticker.y > 0.92 ? -0.04 : 0.04)),
    };
    addSticker(copy);
    setSelectedId(copy.id);
  };

  const keyboardMove = (
    event: KeyboardEvent<HTMLButtonElement>,
    sticker: PlacedSticker,
  ) => {
    const step = event.shiftKey ? 0.05 : 0.01;
    const changes = {
      ArrowLeft: { x: clamp(sticker.x - step) },
      ArrowRight: { x: clamp(sticker.x + step) },
      ArrowUp: { y: clamp(sticker.y - step) },
      ArrowDown: { y: clamp(sticker.y + step) },
    };
    if (event.key in changes) {
      event.preventDefault();
      updateSticker(sticker.id, changes[event.key as keyof typeof changes]);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      gestures.cancelGesture();
      removeSticker(sticker.id);
      setSelectedId(null);
    }
  };

  return (
    <section className="screen stickers-screen">
      <header className="screen-heading">
        <h1>{t("4. add stickers")}</h1>
        <p className="sticker-hint">
          {t(
            "Drag a sticker onto the strip or tap to add it. Use one finger to move it, or two fingers to resize and rotate.",
          )}
        </p>
      </header>
      <div className="sticker-layout">
        <div
          className={`sticker-board ${selectedId ? "has-selection" : ""}`}
          ref={boardRef}
          role="group"
          aria-label={t("Strip sticker editor")}
          style={{ aspectRatio: `${layout.width} / ${layout.height}` }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDrop={dropSticker}
          onPointerDown={gestures.onPointerDown}
          onPointerMove={gestures.onPointerMove}
          onPointerUp={gestures.onPointerUp}
          onPointerCancel={gestures.onPointerCancel}
          onLostPointerCapture={gestures.onLostPointerCapture}
        >
          {url ? (
            <img
              className="sticker-base"
              src={url}
              alt={t("Your strip before stickers")}
              draggable={false}
            />
          ) : (
            <p className="printing" role="status">
              {error ? t("oops :(") : t("loading strip…")}
            </p>
          )}
          {url && <StripCreditLink photoCount={capturedPhotos.length || 1} />}
          {url &&
            stickers.map((sticker) => (
              <div
                key={sticker.id}
                className={`sticker-piece ${selectedId === sticker.id ? "is-selected" : ""}`}
                style={{
                  left: `${sticker.x * 100}%`,
                  top: `${sticker.y * 100}%`,
                  width: `${sticker.width * 100}%`,
                  aspectRatio: sticker.aspectRatio,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotation ?? 0}deg)`,
                }}
              >
                <button
                  type="button"
                  data-sticker-id={sticker.id}
                  className="sticker-move"
                  aria-label={t("Move {sticker}", {
                    sticker: t(sticker.label),
                  })}
                  aria-pressed={selectedId === sticker.id}
                  onFocus={() => setSelectedId(sticker.id)}
                  onClick={() => setSelectedId(sticker.id)}
                  onKeyDown={(event) => keyboardMove(event, sticker)}
                >
                  <img
                    src={sticker.src}
                    alt=""
                    draggable={false}
                    style={{
                      transform: `scale(${sticker.flipX ? -1 : 1}, ${sticker.flipY ? -1 : 1})`,
                    }}
                  />
                </button>
              </div>
            ))}
          {selected && url && (
            <div
              className="sticker-selection-tools"
              role="group"
              aria-label={t("Sticker actions")}
              style={{
                left: `clamp(8px, calc(${selected.x * 100}% - 48px), calc(100% - 104px))`,
                top: toolbarTop,
              }}
            >
              <button
                type="button"
                className="sticker-corner-action sticker-duplicate"
                aria-label={t("Duplicate sticker")}
                title={t("Duplicate sticker")}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => duplicateSticker(selected)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <rect x="8" y="8" width="12" height="12" rx="2" />
                  <path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
                </svg>
              </button>
              <button
                type="button"
                className="sticker-corner-action sticker-delete"
                aria-label={t("Delete sticker")}
                title={t("Delete sticker")}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => {
                  gestures.cancelGesture();
                  removeSticker(selected.id);
                  setSelectedId(null);
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <aside className="sticker-tools" aria-label={t("Sticker collection")}>
          <div className="sticker-palette swipe-pages" {...swipePages}>
            {STICKER_OPTIONS.slice(
              page * PAGE_SIZE,
              (page + 1) * PAGE_SIZE,
            ).map((asset) => (
              <button
                key={asset.id}
                type="button"
                className="sticker-option"
                aria-label={t("Add {sticker}", { sticker: t(asset.label) })}
                disabled={!url}
                draggable={Boolean(url)}
                onDragStart={(event) => {
                  event.dataTransfer.setData(DRAG_TYPE, asset.id);
                  event.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => void placeSticker(asset)}
              >
                <img src={asset.src} alt="" draggable={false} loading="lazy" />
              </button>
            ))}
          </div>
          <nav className="style-pagination swipe-pages" aria-label={t("Sticker pages")} {...swipePages}>
            <button
              className="page-arrow"
              aria-label={t("Previous stickers page")}
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹
            </button>
            <span className="page-indicator" aria-live="polite">
              {page + 1} / {pageCount}
            </span>
            <button
              className="page-arrow"
              aria-label={t("Next stickers page")}
              disabled={page === pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
          </nav>
          <div className="sticker-controls">
            {selected ? (
              <>
                <label htmlFor="sticker-size">{t("size")}</label>
                <div className="sticker-range-control">
                  <input
                    id="sticker-size"
                    type="range"
                    min="8"
                    max="65"
                    value={Math.round(selected.width * 100)}
                    aria-valuetext={t("{size}% of strip width", {
                      size: Math.round(selected.width * 100),
                    })}
                    onChange={(event) =>
                      updateSticker(selected.id, {
                        width: Number(event.target.value) / 100,
                      })
                    }
                  />
                  <output
                    htmlFor="sticker-size"
                    title={t("Percentage of strip width")}
                  >
                    {Math.round(selected.width * 100)}%
                  </output>
                </div>
                <label htmlFor="sticker-rotation">{t("rotation")}</label>
                <div className="sticker-range-control">
                  <input
                    id="sticker-rotation"
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={Math.round(selected.rotation ?? 0)}
                    onChange={(event) =>
                      updateSticker(selected.id, {
                        rotation: Number(event.target.value),
                      })
                    }
                  />
                  <output htmlFor="sticker-rotation">
                    {Math.round(selected.rotation ?? 0)}°
                  </output>
                </div>
                <div className="sticker-transform-actions">
                  <button
                    className="pill outline"
                    onClick={() =>
                      updateSticker(selected.id, {
                        rotation: normalizeRotation(
                          (selected.rotation ?? 0) - 15,
                        ),
                      })
                    }
                  >
                    {t("rotate left")}
                  </button>
                  <button
                    className="pill outline"
                    onClick={() =>
                      updateSticker(selected.id, {
                        rotation: normalizeRotation(
                          (selected.rotation ?? 0) + 15,
                        ),
                      })
                    }
                  >
                    {t("rotate right")}
                  </button>
                  <button
                    className="pill outline"
                    aria-pressed={Boolean(selected.flipX)}
                    onClick={() =>
                      updateSticker(selected.id, { flipX: !selected.flipX })
                    }
                  >
                    {t("flip horizontal")}
                  </button>
                  <button
                    className="pill outline"
                    aria-pressed={Boolean(selected.flipY)}
                    onClick={() =>
                      updateSticker(selected.id, { flipY: !selected.flipY })
                    }
                  >
                    {t("flip vertical")}
                  </button>
                </div>
                <button
                  className="text-button"
                  onClick={() =>
                    updateSticker(selected.id, {
                      rotation: 0,
                      flipX: false,
                      flipY: false,
                    })
                  }
                >
                  {t("reset orientation")}
                </button>
                <div className="sticker-transform-actions">
                  <button
                    className="pill outline"
                    onClick={() => {
                      gestures.cancelGesture();
                      setSelectedId(null);
                    }}
                  >
                    {t("done")}
                  </button>
                  <button
                    className="pill outline"
                    onClick={() => {
                      gestures.cancelGesture();
                      removeSticker(selected.id);
                      setSelectedId(null);
                    }}
                  >
                    {t("remove sticker")}
                  </button>
                </div>
              </>
            ) : (
              <p className="sticker-hint">
                {t(
                  "Select a sticker to resize, rotate or flip it. Tap Done when finished.",
                )}
              </p>
            )}
          </div>
          {assetError && (
            <p className="share-error" role="alert">
              {t(assetError)}
            </p>
          )}
          {error && (
            <div className="camera-error" role="alert">
              <p>{t(error)}</p>
              <button className="pill outline" onClick={retry}>
                {t("retry preview")}
              </button>
            </div>
          )}
        </aside>
      </div>
      {selected && (
        <button
          className="pill sticker-touch-done"
          aria-label={t("Done editing sticker")}
          onClick={() => {
            gestures.cancelGesture();
            setSelectedId(null);
          }}
        >
          {t("done")}
        </button>
      )}
      <NavArrows
        onBack={prevStep}
        onNext={() => goToStep(AppStep.Result)}
        canProceed={Boolean(url)}
      />
      <Watermark />
    </section>
  );
}
