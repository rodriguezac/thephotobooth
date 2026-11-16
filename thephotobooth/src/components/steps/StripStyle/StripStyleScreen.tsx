import { useTranslation } from "../../../i18n/useLanguage";
import { useState } from "react";
import { usePhotoboothStore } from "../../../store/usePhotoboothStore";
import { PATTERN_OPTIONS, SOLID_OPTIONS } from "../../../utils/constants";
import type { StripBackground } from "../../../types/photobooth.types";
import { AppStep } from "../../../types/photobooth.types";
import { Watermark } from "../../ui/Watermark";
import { NavArrows } from "../../ui/NavArrows";
const PAGE_SIZE = 10;
function sameBackground(a: StripBackground | null, b: StripBackground) {
  return (
    a?.type === b.type &&
    (b.type === "pattern"
      ? a.type === "pattern" && a.id === b.id
      : a.type === "solid" && a.name === b.name)
  );
}
export function StripStyleScreen() {
  const t = useTranslation();
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
  const page = Math.min(pages[activeStyleTab], totalPages - 1);
  const visibleOptions = options.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  );
  const changePage = (direction: number) => {
    setPages((previous) => ({
      ...previous,
      [activeStyleTab]: Math.max(0, Math.min(totalPages - 1, page + direction)),
    }));
  };
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
          onChange={(e) =>
            setActiveStyleTab(e.target.value as "patterns" | "solids")
          }
        >
          <option value="patterns">{t("patterns")}</option>
          <option value="solids">{t("solids")}</option>
        </select>
      </header>
      <div
        className="style-grid"
        id="style-options"
        role="group"
        aria-label={t("{category} options", { category: t(activeStyleTab) })}
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
        <nav className="style-pagination" aria-label={t("Style pages")}>
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
          {t("save style →")}
        </button>
      )}
      <Watermark />
    </section>
  );
}
