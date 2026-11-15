import { useRef, useEffect, useCallback, useState } from "react";
import type { CapturedPhoto } from "../types/photobooth.types";
import { usePhotoboothStore, selectFilter } from "../store/usePhotoboothStore";
import { FILTER_OPTIONS } from "../utils/constants";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filter = usePhotoboothStore(selectFilter);
  const cssFilter =
    FILTER_OPTIONS.find((f) => f.value === filter)?.cssFilter ?? "none";

  const stopCamera = useCallback(() => {
    requestRef.current++;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsStreaming(false);
    setIsStarting(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    const request = requestRef.current;
    setError(null);
    setIsStarting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Abre la app en localhost o HTTPS para usar la cámara.",
        );
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 960 },
          facingMode: "user",
        },
        audio: false,
      });
      // A permission response can arrive after unmount or a newer request.
      if (request !== requestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stopCamera();
        return;
      }
      video.srcObject = stream;
      await video.play();
      if (request !== requestRef.current) return;
      // 'playing' can precede the play promise; dimensions guard captures too.
      setIsStreaming(video.readyState >= 2 && video.videoWidth > 0);
      setIsStarting(false);
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          if (request !== requestRef.current) return;
          stopCamera();
          setError("La cámara se desconectó. Conéctala y vuelve a intentar.");
        };
      });
    } catch (err) {
      if (request !== requestRef.current) return;
      stopCamera();
      const name =
        err && typeof err === "object" && "name" in err ? String(err.name) : "";
      setError(
        name === "NotAllowedError"
          ? "Permiso denegado. Permite la cámara en los ajustes de este sitio y revisa Privacidad > Cámara en tu Mac."
          : name === "NotFoundError"
            ? "No encontramos una cámara. Conecta una y vuelve a intentar."
            : name === "NotReadableError"
              ? "La cámara está ocupada o no está disponible. Cierra otras apps que la usen e intenta de nuevo."
              : err instanceof Error && name === "Error"
                ? err.message
                : "No se pudo iniciar la cámara. Vuelve a intentar.",
      );
    }
  }, [stopCamera]);

  const onPlaying = useCallback(() => {
    if (
      streamRef.current &&
      videoRef.current &&
      videoRef.current.videoWidth > 0
    ) {
      setIsStreaming(true);
      setIsStarting(false);
    }
  }, []);

  const capture = useCallback((): CapturedPhoto | null => {
    const video = videoRef.current;
    if (
      !video ||
      !streamRef.current?.active ||
      video.readyState < 2 ||
      !video.videoWidth ||
      !video.videoHeight
    )
      return null;
    const canvas = document.createElement("canvas");
    // Match the camera display's 4:3 center crop without stretching.
    canvas.width = 1200;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const ratio = 4 / 3;
    const sw = Math.min(video.videoWidth, video.videoHeight * ratio);
    const sh = sw / ratio;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
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
    // Keep originals so filters remain editable after shooting.
    return {
      dataUrl: canvas.toDataURL("image/jpeg", 0.95),
      takenAt: Date.now(),
    };
  }, []);

  useEffect(() => {
    void startCamera();
    return stopCamera;
  }, [startCamera, stopCamera]);

  return {
    videoRef,
    isStreaming,
    isStarting,
    error,
    cssFilter,
    startCamera,
    stopCamera,
    capture,
    onPlaying,
  };
}
