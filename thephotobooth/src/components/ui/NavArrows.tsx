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
  return (
    <nav className="step-navigation" aria-label="Step navigation">
      {showBack && onBack && (
        <button className="text-button" onClick={onBack}>
          ← back
        </button>
      )}
      {showNext && onNext && (
        <button className="pill" onClick={onNext} disabled={!canProceed}>
          next →
        </button>
      )}
    </nav>
  );
}
