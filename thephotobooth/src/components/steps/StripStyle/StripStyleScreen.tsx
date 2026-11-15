import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { PATTERN_OPTIONS, SOLID_OPTIONS } from "../../../utils/constants";
import { AppStep } from "../../../types/photobooth.types";
import { Watermark } from "../../ui/Watermark";
import { NavArrows } from "../../ui/NavArrows";
export function StripStyleScreen() {
  const {
    stripBg,
    activeStyleTab,
    setActiveStyleTab,
    setStripBg,
    nextStep,
    prevStep,
    capturedPhotos,
    photoCount,
    goToStep,
  } = usePhotoboothStore();
  const options =
    activeStyleTab === "patterns" ? PATTERN_OPTIONS : SOLID_OPTIONS;
  return (
    <section className="screen style-screen">
      <header className="screen-heading">
        <h1>2. choose your strip style</h1>
        <label className="sr-only" htmlFor="style-category">
          Style category
        </label>
        <select
          id="style-category"
          className="pill pill-select"
          value={activeStyleTab}
          onChange={(e) =>
            setActiveStyleTab(e.target.value as "patterns" | "solids")
          }
        >
          <option value="patterns">patterns</option>
          <option value="solids">solids</option>
        </select>
      </header>
      <div className="style-grid">
        {options.map((bg) => {
          const key =
            bg.type === "pattern" ? `pattern-${bg.id}` : `solid-${bg.name}`;
          const selected =
            stripBg?.type === bg.type &&
            (bg.type === "pattern"
              ? stripBg.type === "pattern" && stripBg.id === bg.id
              : stripBg.type === "solid" && stripBg.name === bg.name);
          return (
            <button
              key={key}
              id={key}
              className="swatch"
              aria-label={bg.label}
              aria-pressed={selected}
              onClick={() => setStripBg(bg)}
            >
              <span
                style={
                  bg.type === "pattern"
                    ? { backgroundImage: `url("${bg.src}")` }
                    : { backgroundColor: bg.color }
                }
              />
              {selected && (
                <b className="selection-mark" aria-hidden="true">
                  ✓
                </b>
              )}
            </button>
          );
        })}
      </div>
      <NavArrows
        onBack={prevStep}
        onNext={nextStep}
        canProceed={stripBg !== null}
      />
      {capturedPhotos.length === photoCount && (
        <button
          className="text-button"
          onClick={() => goToStep(AppStep.Result)}
        >
          save style →
        </button>
      )}
      <Watermark />
    </section>
  );
}
