// ============================================================
// UI — StepNav
// Barra inferior de navegación entre pasos.
// Muestra "Back" + "Next" y el número de paso actual.
// ============================================================

import { Button } from "./Button";
import { usePhotoboothStore } from "../../store/usePhotoboothStore";
import { AppStep } from "../../types/photobooth.types";

interface StepNavProps {
  /** Si el botón "Next" está habilitado */
  canProceed?: boolean;
  /** Etiqueta personalizada para el botón Next */
  nextLabel?: string;
  /** Handler personalizado (por defecto usa store.nextStep) */
  onNext?: () => void;
}

const STEP_LABELS: Record<AppStep, string> = {
  [AppStep.Welcome]: "Welcome",
  [AppStep.PhotoCount]: "Photos",
  [AppStep.StripStyle]: "Style",
  [AppStep.Filter]: "Filter",
  [AppStep.Capture]: "Capture",
  [AppStep.Result]: "Result",
};

export function StepNav({
  canProceed = true,
  nextLabel = "Next →",
  onNext,
}: StepNavProps) {
  const { currentStep, nextStep, prevStep } = usePhotoboothStore();

  const isFirst = currentStep === AppStep.Welcome;
  const isLast = currentStep === AppStep.Result;

  const handleNext = onNext ?? nextStep;

  return (
    <div className="w-full border-t-2 border-brand-black bg-white px-4 py-3">
      {/* Indicadores de paso */}
      <div className="flex items-center justify-center gap-1 mb-3">
        {Object.values(AppStep)
          .filter((v) => typeof v === "number")
          .map((step) => (
            <span
              key={step}
              className={`h-2 rounded-full transition-all duration-200 ${
                step === currentStep
                  ? "w-6 bg-brand-pink"
                  : step < currentStep
                    ? "w-2 bg-brand-black"
                    : "w-2 bg-gray-300"
              }`}
            />
          ))}
      </div>

      {/* Label del paso actual */}
      <p className="text-center font-silkscreen text-[10px] text-gray-500 mb-3 uppercase tracking-widest">
        Step {currentStep + 1} · {STEP_LABELS[currentStep as AppStep]}
      </p>

      {/* Botones */}
      <div className="flex gap-3">
        {!isFirst && (
          <Button variant="secondary" onClick={prevStep} className="flex-1">
            ← Back
          </Button>
        )}
        {!isLast && (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex-1 ${!canProceed ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
