import { useEffect, useRef, useState } from "react";
import { useCamera } from "../../../hooks/useCamera";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { AppStep } from "../../../types/photobooth.types";
import { CameraView } from "../../ui/CameraView";
import { CameraError } from "../../ui/CameraError";
import { Watermark } from "../../ui/Watermark";

const phrases = [
  "you look amazing!",
  "a little main character energy",
  "keep that smile :)",
  "one for the memories",
];
export function CaptureScreen() {
  const { photoCount, capturedPhotos, addCapturedPhoto, goToStep, prevStep } =
    usePhotoboothStore();
  const camera = useCamera();
  const { isStreaming, capture } = camera;
  const [countdown, setCountdown] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [phrase, setPhrase] = useState(0);
  const busy = useRef(false);
  const taken = capturedPhotos.length;
  const needed = photoCount ?? 1;

  useEffect(() => {
    const timer = window.setInterval(
      () => setPhrase((p) => (p + 1) % phrases.length),
      2000,
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (!isStreaming) {
      busy.current = false;
      setRunning(false);
      setCountdown(null);
      return;
    }
    if (taken >= needed) {
      const timer = setTimeout(() => goToStep(AppStep.Result), 450);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(
      () => {
        if (countdown === null) setCountdown(3);
        else if (countdown > 1) setCountdown(countdown - 1);
        else {
          const photo = capture();
          if (photo) addCapturedPhoto(photo);
          else {
            busy.current = false;
            setRunning(false);
          }
          setCountdown(null);
        }
      },
      countdown === null ? 400 : 1000,
    );
    return () => clearTimeout(timer);
  }, [
    running,
    countdown,
    taken,
    needed,
    isStreaming,
    capture,
    addCapturedPhoto,
    goToStep,
  ]);

  return (
    <section className="screen camera-screen capture-screen">
      <header className="screen-heading">
        <h1>4. smile :D</h1>
      </header>
      <CameraView camera={camera}>
        {countdown !== null && (
          <span className="countdown" role="status">
            {countdown}
          </span>
        )}
        {running && countdown === null && taken > 0 && (
          <span className="camera-flash" key={taken} />
        )}
      </CameraView>
      <CameraError
        error={camera.error}
        retry={() => void camera.startCamera()}
      />
      <div className="capture-controls">
        <button
          className="pill"
          id="btn-capture"
          disabled={!camera.isStreaming || running}
          onClick={() => {
            if (busy.current) return;
            busy.current = true;
            setRunning(true);
          }}
        >
          {running
            ? taken >= needed
              ? "all done!"
              : `${taken + 1} / ${needed}`
            : "START"}
        </button>
        <p className="hype" aria-live="polite">
          {phrases[phrase]}
        </p>
        <div
          className="capture-dots"
          aria-label={`${taken} of ${needed} photos taken`}
        >
          {Array.from({ length: needed }, (_, i) => (
            <span key={i} className={i < taken ? "filled" : ""} />
          ))}
        </div>
        <button className="text-button" onClick={prevStep}>
          ← back
        </button>
      </div>
      <Watermark />
    </section>
  );
}
