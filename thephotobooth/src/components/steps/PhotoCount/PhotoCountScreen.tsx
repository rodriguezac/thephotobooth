import { useTranslation } from "../../../i18n/useLanguage";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { PHOTO_COUNT_OPTIONS } from "../../../utils/constants";
import { Watermark } from "../../ui/Watermark";
import { NavArrows } from "../../ui/NavArrows";
export function PhotoCountScreen() {
  const t = useTranslation();
  const { photoCount, setPhotoCount, nextStep, prevStep } =
    usePhotoboothStore();
  return (
    <section className="screen count-screen">
      <header className="screen-heading">
        <h1>{t("1. choose your amount of photos")}</h1>
      </header>
      <div className="count-options">
        {PHOTO_COUNT_OPTIONS.map(({ value }) => (
          <button
            key={value}
            id={`photo-count-${value}`}
            className={`count-card count-${value}`}
            aria-label={t(value === 1 ? "{count} photo" : "{count} photos", {
              count: value,
            })}
            aria-pressed={photoCount === value}
            onClick={() => setPhotoCount(value)}
          >
            <div className="count-frames">
              {Array.from({ length: value }, (_, i) => (
                <span key={i} />
              ))}
            </div>
            <span>{value}</span>
          </button>
        ))}
      </div>
      <NavArrows
        onBack={prevStep}
        onNext={nextStep}
        canProceed={photoCount !== null}
      />
      <Watermark />
    </section>
  );
}
