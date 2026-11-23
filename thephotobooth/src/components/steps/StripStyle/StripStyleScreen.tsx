import { useTranslation } from "../../../i18n/useLanguage";
import { useState } from "react";
import { useSwipePagination } from "../../../hooks/useSwipePagination";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { PATTERN_OPTIONS, SOLID_OPTIONS } from "../../../utils/constants";
import { CustomPatternPicker } from "./CustomPatternPicker";
import type {
  StyleTab,
  StripBackground,
} from "../../../types/photobooth.types";
import { AppStep } from "../../../types/photobooth.types";
import { Watermark } from "../../ui/Watermark";
import { NavArrows } from "../../ui/NavArrows";
const PAGE_SIZE = 10;
function sameBackground(a: StripBackground | null, b: StripBackground) {
  if (a?.type !== b.type) return false;
  if (b.type === "pattern") return a.type === "pattern" && a.id === b.id;
  if (b.type === "solid") return a.type === "solid" && a.name === b.name;
  return a.type === "custom" && a.id === b.id;
}
export function StripStyleScreen() {
  const t = useTranslation();
  const {
    stripBg,
    customPattern,
    activeStyleTab,
    setActiveStyleTab,
    setStripBg,
    nextStep,
    prevStep,
    capturedPhotos,
    photoCount,
    goToStep,
  } = usePhotoboothStore();
  const [uploadPending, setUploadPending] = useState(false);
  const canProceed =
    stripBg !== null &&
    !uploadPending &&
    (activeStyleTab !== "custom" || stripBg.type === "custom");
  const [pages, setPages] = useState(() => ({
    patterns: Math.floor(
      Math.max(
        0,
        PATTERN_OPTIONS.findIndex((bg) => sameBackground(stripBg, bg)),
      ) / PAGE_SIZE,
    ),
    solids: Math.floor(
      Math.max(
        0,
        SOLID_OPTIONS.findIndex((bg) => sameBackground(stripBg, bg)),
      ) / PAGE_SIZE,
    ),
  }));
  const options =
    activeStyleTab === "patterns" ? PATTERN_OPTIONS : SOLID_OPTIONS;
  const totalPages = Math.max(1, Math.ceil(options.length / PAGE_SIZE));
  const category = activeStyleTab === "custom" ? "patterns" : activeStyleTab;
  const page = Math.min(pages[category], totalPages - 1);
  const visibleOptions = options.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  );
  const changePage = (direction: number) => {
    setPages((previous) => ({
      ...previous,
      [category]: Math.max(0, Math.min(totalPages - 1, page + direction)),
    }));
  };
  const swipePages = useSwipePagination(changePage);
  return (
    <section className="screen style-screen">
      <header className="screen-heading">
        <h1>{t("2. choose your strip style")}</h1>
        <label className="sr-only" htmlFor="style-category">
          {t("Style category")}
        </label>
        <select
          id="style-category"
          className="pill pill-select"
          value={activeStyleTab}
          onChange={(e) => {
            const tab = e.target.value as StyleTab;
            setActiveStyleTab(tab);
            setUploadPending(false);
            if (tab === "custom" && customPattern) setStripBg(customPattern);
          }}
        >
          <option value="patterns">{t("patterns")}</option>
          <option value="solids">{t("solids")}</option>
          <option value="custom">{t("your image")}</option>
        </select>
      </header>
      {activeStyleTab === "custom" ? (
        <CustomPatternPicker onPendingChange={setUploadPending} />
      ) : (
        <>
          <div
            className="style-grid swipe-pages"
            {...swipePages}
            id="style-options"
            role="group"
            aria-label={t("{category} options", {
              category: t(activeStyleTab),
            })}
          >
            {visibleOptions.map((bg) => {
              const key =
                bg.type === "pattern" ? `pattern-${bg.id}` : `solid-${bg.name}`;
              const selected = sameBackground(stripBg, bg);
              return (
                <button
                  key={key}
                  id={key}
                  className="swatch"
                  aria-label={t(bg.label)}
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
          {totalPages > 1 && (
            <nav className="style-pagination swipe-pages" aria-label={t("Style pages")} {...swipePages}>
              <button
                type="button"
                className="page-arrow"
                aria-label={t("Previous styles page")}
                aria-controls="style-options"
                disabled={page === 0}
                onClick={() => changePage(-1)}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m15 5-7 7 7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <span
                className="page-indicator"
                aria-live="polite"
                aria-atomic="true"
                aria-label={t("Page {page} of {total}", {
                  page: page + 1,
                  total: totalPages,
                })}
              >
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                className="page-arrow"
                aria-label={t("Next styles page")}
                aria-controls="style-options"
                disabled={page === totalPages - 1}
                onClick={() => changePage(1)}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m9 5 7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </nav>
          )}
        </>
      )}
      <NavArrows onBack={prevStep} onNext={nextStep} canProceed={canProceed} />
      {capturedPhotos.length === photoCount && (
        <button
          className="text-button"
          disabled={!canProceed}
          onClick={() => goToStep(AppStep.Result)}
        >
          {t("save style →")}
        </button>
      )}
      <Watermark />
    </section>
  );
}
