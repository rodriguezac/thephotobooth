// ============================================================
// APP — Router de pasos (fullscreen)
// ============================================================

import { useEffect } from "react";
import {
  usePhotoboothStore,
  selectCurrentStep,
} from "./store/usePhotoboothStore";
import { AppStep } from "./types/photobooth.types";

import { WelcomeScreen } from "./components/steps/Welcome/WelcomeScreen";
import { PhotoCountScreen } from "./components/steps/PhotoCount/PhotoCountScreen";
import { StripStyleScreen } from "./components/steps/StripStyle/StripStyleScreen";
import { FilterScreen } from "./components/steps/Filter/FilterScreen";
import { CaptureScreen } from "./components/steps/Capture/CaptureScreen";
import { ResultScreen } from "./components/steps/Result/ResultScreen";

function App() {
  const currentStep = usePhotoboothStore(selectCurrentStep);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const screens: Record<AppStep, JSX.Element> = {
    [AppStep.Welcome]: <WelcomeScreen />,
    [AppStep.PhotoCount]: <PhotoCountScreen />,
    [AppStep.StripStyle]: <StripStyleScreen />,
    [AppStep.Filter]: <FilterScreen />,
    [AppStep.Capture]: <CaptureScreen />,
    [AppStep.Result]: <ResultScreen />,
  };

  return <main className="app">{screens[currentStep]}</main>;
}

export default App;
