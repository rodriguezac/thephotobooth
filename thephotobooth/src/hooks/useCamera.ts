import { useRef, useEffect, useCallback, useState } from "react";
import type { CapturedPhoto } from "../types/photobooth.types";
import { usePhotoboothStore, selectFilter } from "../store/usePhotoboothStore";
import { hasRearVideoInput } from "../utils/cameraDevices";
import { FILTER_OPTIONS } from "../utils/constants";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef(0);
  const deviceScanRef = useRef(0);
  const rejectedRearRef = useRef(false);
  const [hasRearCamera, setHasRearCamera] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filter = usePhotoboothStore(selectFilter);
  const facingMode = usePhotoboothStore((state) => state.cameraFacing);
  const setFacingMode = usePhotoboothStore((state) => state.setCameraFacing);
  const activeOption = FILTER_OPTIONS.find((f) => f.value === filter);
  const cssFilter = activeOption?.cssFilter ?? "none";

  const refreshCameras = useCallback(async () => {
    const scan = ++deviceScanRef.current;
    const request = requestRef.current;
    let devices: MediaDeviceInfo[] = [];
    try {
      devices = (await navigator.mediaDevices?.enumerateDevices?.()) ?? [];
    } catch {
      /* Keep a working front camera if device information is unavailable. */
    }
    if (scan !== deviceScanRef.current || request !== requestRef.current)
      return;
    const rearAvailable =
      !rejectedRearRef.current &&
      hasRearVideoInput(devices, streamRef.current?.getVideoTracks()[0]);
    setHasRearCamera(rearAvailable);
    if (
      !rearAvailable &&
      usePhotoboothStore.getState().cameraFacing === "environment"
    ) {
      usePhotoboothStore.getState().setCameraFacing("user");
    }
  }, []);

  const stopCamera = useCallback(() => {
    requestRef.current++;
    deviceScanRef.current++;
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
          "Open the app on localhost or HTTPS to use the camera.",
        );
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 960 },
          facingMode:
            facingMode === "environment"
              ? { exact: "environment" }
              : { ideal: "user" },
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
      // Permission has been granted, so the browser can expose available camera metadata.
      void refreshCameras();
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          if (request !== requestRef.current) return;
          stopCamera();
          setError("The camera was disconnected. Reconnect it and try again.");
          void refreshCameras();
        };
      });
    } catch (err) {
      if (request !== requestRef.current) return;
      stopCamera();
      const name =
        err && typeof err === "object" && "name" in err ? String(err.name) : "";
      if (
        facingMode === "environment" &&
        (name === "NotFoundError" || name === "OverconstrainedError")
      ) {
        rejectedRearRef.current = true;
        setHasRearCamera(false);
        setFacingMode("user");
        return;
      }
      setError(
        name === "NotAllowedError"
          ? "Camera permission denied. Allow camera access in your browser and device privacy settings."
          : name === "NotFoundError"
            ? facingMode === "environment"
              ? "This camera is not available. Try the front camera."
              : "No camera found. Connect one and try again."
            : name === "OverconstrainedError"
              ? "This camera is not available. Try the front camera."
              : name === "NotReadableError"
                ? "The camera is busy or unavailable. Close other apps using it and try again."
                : err instanceof Error && name === "Error"
                  ? err.message
                  : "Could not start the camera. Please try again.",
      );
    }
  }, [stopCamera, facingMode, setFacingMode, refreshCameras]);

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
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
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
  }, [facingMode]);

  useEffect(() => {
    void startCamera();
    return stopCamera;
  }, [startCamera, stopCamera]);

  useEffect(() => {
    const media = navigator.mediaDevices;
    const onDeviceChange = () => {
      rejectedRearRef.current = false;
      void refreshCameras();
    };
    media?.addEventListener?.("devicechange", onDeviceChange);
    return () => media?.removeEventListener?.("devicechange", onDeviceChange);
  }, [refreshCameras]);

  return {
    videoRef,
    hasRearCamera,
    facingMode,
    setFacingMode,
    isMirrored: facingMode === "user",
    isStreaming,
    isStarting,
    error,
    cssFilter,
    overlay: activeOption?.overlay,
    startCamera,
    stopCamera,
    capture,
    onPlaying,
  };
}
