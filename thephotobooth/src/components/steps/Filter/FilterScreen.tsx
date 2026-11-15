import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { FILTER_OPTIONS } from "../../../utils/constants";
import { AppStep, PhotoFilter } from "../../../types/photobooth.types";
import { useCamera } from "../../../hooks/useCamera";
import { CameraView } from "../../ui/CameraView";
import { CameraError } from "../../ui/CameraError";
import { Watermark } from "../../ui/Watermark";
import { NavArrows } from "../../ui/NavArrows";
export function FilterScreen() {
  const {
    filter,
    setFilter,
    nextStep,
    prevStep,
    capturedPhotos,
    photoCount,
    goToStep,
  } = usePhotoboothStore();
  const camera = useCamera();
  return (
    <section className="screen camera-screen">
      <header className="screen-heading">
        <h1>3. choose a filter</h1>
        <label htmlFor="filter" className="sr-only">
          Photo filter
        </label>
        <select
          id="filter"
          className="pill pill-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value as PhotoFilter)}
        >
          {FILTER_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label.toLowerCase()}
            </option>
          ))}
        </select>
      </header>
      <CameraView camera={camera} />
      <CameraError
        error={camera.error}
        retry={() => void camera.startCamera()}
      />
      <NavArrows
        onBack={prevStep}
        onNext={
          capturedPhotos.length === photoCount
            ? () => goToStep(AppStep.Result)
            : nextStep
        }
      />
      <Watermark />
    </section>
  );
}
