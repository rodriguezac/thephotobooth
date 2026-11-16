import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { PhotoFilter } from "../../types/photobooth.types";
import { applyPhotoEffect } from "../../utils/photoEffects";

export function ArtFilterPreview({
  videoRef,
  filter,
  streaming,
}: {
  videoRef: RefObject<HTMLVideoElement>;
  filter: PhotoFilter;
  streaming: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !streaming) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    let frame = 0;
    let lastFrame = -Infinity;
    const draw = (time: number) => {
      const video = videoRef.current;
      if (
        video &&
        video.readyState >= 2 &&
        video.videoWidth &&
        video.videoHeight &&
        time - lastFrame >= 1000 / 24
      ) {
        lastFrame = time;
        const sw = Math.min(video.videoWidth, (video.videoHeight * 4) / 3);
        const sh = (sw * 3) / 4;
        ctx.drawImage(
          video,
          (video.videoWidth - sw) / 2,
          (video.videoHeight - sh) / 2,
          sw,
          sh,
          0,
          0,
          canvas.width,
          canvas.height,
        );
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyPhotoEffect(image.data, canvas.width, canvas.height, filter);
        ctx.putImageData(image, 0, 0);
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [filter, streaming, videoRef]);
  return (
    <canvas
      ref={canvasRef}
      width="320"
      height="240"
      className="camera-art-preview"
      aria-hidden="true"
    />
  );
}
