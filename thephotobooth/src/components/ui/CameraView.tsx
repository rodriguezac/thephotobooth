import {
  usePhotoboothStore,
  selectFilter,
} from "../../store/usePhotoboothStore";
import { hasPixelEffect } from "../../utils/photoEffects";
import { ArtFilterPreview } from "./ArtFilterPreview";
import { useTranslation } from "../../i18n/useLanguage";
import type { ReactNode } from "react";
import type { useCamera } from "../../hooks/useCamera";

type Props = { camera: ReturnType<typeof useCamera>; children?: ReactNode };
export function CameraView({ camera, children }: Props) {
  const t = useTranslation();
  const filter = usePhotoboothStore(selectFilter);
  return (
    <div className="camera-frame">
      <img
        className="camera-body"
        src="/camera/camera.png"
        alt={t("Digital camera")}
      />
      <div className="camera-display">
        <div className="camera-viewport">
          <video
            ref={camera.videoRef}
            autoPlay
            muted
            playsInline
            onPlaying={camera.onPlaying}
            style={{ filter: camera.cssFilter }}
            aria-label={t("Live camera preview")}
          />
          {hasPixelEffect(filter) && camera.isStreaming && (
            <ArtFilterPreview
              videoRef={camera.videoRef}
              filter={filter}
              streaming={camera.isStreaming}
            />
          )}
          {camera.overlay && (
            <img
              className="camera-color-overlay"
              src={camera.overlay.src}
              alt=""
              aria-hidden="true"
              style={{
                opacity: camera.overlay.opacity,
                mixBlendMode: camera.overlay.blendMode,
              }}
            />
          )}
          {!camera.isStreaming && (
            <div className="camera-status" role="status">
              <span>
                {camera.error ? t("camera unavailable") : t("starting camera…")}
              </span>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
