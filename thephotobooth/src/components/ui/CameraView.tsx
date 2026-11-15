import type { ReactNode } from "react";
import type { useCamera } from "../../hooks/useCamera";

type Props = { camera: ReturnType<typeof useCamera>; children?: ReactNode };
export function CameraView({ camera, children }: Props) {
  return (
    <div className="camera-frame">
      <img
        className="camera-body"
        src="/camera/blue-cam.png"
        alt="Blue digital camera"
      />
      <div className="camera-display">
        <video
          ref={camera.videoRef}
          autoPlay
          muted
          playsInline
          onPlaying={camera.onPlaying}
          style={{ filter: camera.cssFilter }}
          aria-label="Live camera preview"
        />
        {!camera.isStreaming && (
          <div className="camera-status" role="status">
            <span>
              {camera.error ? "camera unavailable" : "starting camera…"}
            </span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
