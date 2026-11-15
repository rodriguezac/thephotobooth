import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { AppStep } from "../../../types/photobooth.types";
export function WelcomeScreen() {
  const goToStep = usePhotoboothStore((s) => s.goToStep);
  return (
    <section className="welcome">
      <div className="paper-note">
        <img src="/extras/paper.png" alt="" />
        <div className="paper-copy">
          <h1>the photobooth</h1>
          <button
            className="pill"
            id="btn-start"
            onClick={() => goToStep(AppStep.PhotoCount)}
          >
            START
          </button>
        </div>
      </div>
    </section>
  );
}
