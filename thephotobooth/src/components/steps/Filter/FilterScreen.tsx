import { useTranslation } from "../../../i18n/useLanguage";
import { getStripLayout } from "../../../utils/stripLayout";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { FILTER_OPTIONS } from "../../../utils/constants";
import { AppStep, PhotoFilter } from "../../../types/photobooth.types";
import { useCamera } from "../../../hooks/useCamera";
import { useStripPreview } from "../../../hooks/useStripPreview";
import { CameraView } from "../../ui/CameraView";
import { CameraError } from "../../ui/CameraError";
import { Watermark } from "../../ui/Watermark";
import { NavArrows } from "../../ui/NavArrows";

function FilterHeading() {
  const t = useTranslation();
  const filter = usePhotoboothStore((s) => s.filter);
  const setFilter = usePhotoboothStore((s) => s.setFilter);
  return (
    <header className="screen-heading">
      <h1>{t("3. choose a filter")}</h1>
      <label htmlFor="filter" className="sr-only">
        {t("Photo filter")}
      </label>
      <select
        id="filter"
        className="pill pill-select"
        value={filter}
        onChange={(event) => setFilter(event.target.value as PhotoFilter)}
      >
        {FILTER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label).toLowerCase()}
          </option>
        ))}
      </select>
    </header>
  );
}

function CameraFilterScreen() {
  const { nextStep, prevStep } = usePhotoboothStore();
  const camera = useCamera();
  return (
    <section className="screen camera-screen">
      <FilterHeading />
      <CameraView camera={camera} />
      <CameraError
        error={camera.error}
        retry={() => void camera.startCamera()}
      />
      <NavArrows onBack={prevStep} onNext={nextStep} />
      <Watermark />
    </section>
  );
}

function CapturedStripFilterScreen() {
  const t = useTranslation();
  const { capturedPhotos, stripBg, filter, stickers, prevStep, goToStep } =
    usePhotoboothStore();
  const { url, error, retry } = useStripPreview(
    capturedPhotos,
    stripBg,
    filter,
    stickers,
  );
  const layout = getStripLayout(capturedPhotos.length);
  return (
    <section className="screen customize-screen">
      <FilterHeading />
      <div
        className={`printer customize-printer ${capturedPhotos.length === 4 ? "printer-wide" : ""}`}
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
            <img
              className="customize-strip"
              src={url}
              alt={t("Your strip with the selected style and filter")}
            />
          ) : (
            <p className="printing" role="status">
              {error ? t("oops :(") : t("updating strip…")}
            </p>
          )}
        </div>
      </div>
      {error && (
        <div className="camera-error" role="alert">
          <p>{t(error)}</p>
          <button className="pill outline" onClick={retry}>
            {t("retry preview")}
          </button>
        </div>
      )}
      <NavArrows
        onBack={prevStep}
        onNext={() => goToStep(AppStep.Stickers)}
        canProceed={Boolean(url)}
      />
      <Watermark />
    </section>
  );
}

export function FilterScreen() {
  const photos = usePhotoboothStore((s) => s.capturedPhotos);
  const count = usePhotoboothStore((s) => s.photoCount);
  const hasCapturedStrip =
    count !== null && photos.length > 0 && photos.length === count;
  // The camera hook only mounts before capture; customizing never requests a stream.
  return hasCapturedStrip ? (
    <CapturedStripFilterScreen />
  ) : (
    <CameraFilterScreen />
  );
}
