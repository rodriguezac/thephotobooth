import { useEffect, useState } from "react";
import type {
  PlacedSticker,
  CapturedPhoto,
  PhotoFilter,
  StripBackground,
} from "../types/photobooth.types";
import { generateStrip } from "../utils/canvasUtils";

const NO_STICKERS: PlacedSticker[] = [];

// Preview, download and QR all use the same generated image.
export function useStripPreview(
  photos: CapturedPhoto[],
  background: StripBackground | null,
  filter: PhotoFilter,
  stickers: PlacedSticker[] = NO_STICKERS,
) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    stickers: PlacedSticker[];
    photos: CapturedPhoto[];
    background: StripBackground | null;
    filter: PhotoFilter;
    attempt: number;
    url: string | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const input = { photos, background, filter, stickers, attempt };
    if (!background || !photos.length) {
      setResult({
        ...input,
        url: null,
        error: "No photos available to create a strip. Please start again.",
      });
      return;
    }
    (stickers.length
      ? generateStrip(photos, background, filter, stickers)
      : generateStrip(photos, background, filter)
    )
      .then((url) => {
        if (!cancelled) setResult({ ...input, url, error: null });
      })
      .catch(() => {
        if (!cancelled)
          setResult({
            ...input,
            url: null,
            error: "Could not create the strip. Please try again.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [photos, background, filter, stickers, attempt]);

  // Never show an older background/filter while a new image is being generated.
  const current =
    result?.photos === photos &&
    result.background === background &&
    result.filter === filter &&
    result.stickers === stickers &&
    result.attempt === attempt;
  return {
    url: current ? result.url : null,
    error: current ? result.error : null,
    retry: () => setAttempt((value) => value + 1),
  };
}
