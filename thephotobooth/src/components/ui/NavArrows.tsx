import { useTranslation } from "../../i18n/useLanguage";
interface Props {
  onNext?: () => void;
  onBack?: () => void;
  canProceed?: boolean;
  showBack?: boolean;
  showNext?: boolean;
}
export function NavArrows({
  onNext,
  onBack,
  canProceed = true,
  showBack = true,
  showNext = true,
}: Props) {
  const t = useTranslation();
  return (
    <nav className="step-navigation" aria-label={t("Step navigation")}>
      {showBack && onBack && (
        <button className="text-button" onClick={onBack}>
          {t("← back")}
        </button>
      )}
      {showNext && onNext && (
        <button className="pill" onClick={onNext} disabled={!canProceed}>
          {t("next →")}
        </button>
      )}
    </nav>
  );
}
