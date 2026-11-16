import { StripCreditLink } from "./StripCreditLink";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useTranslation } from "../../i18n/useLanguage";

function isAppleTouchDevice() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function DownloadStrip({
  imageUrl,
  photoCount = 1,
}: {
  imageUrl: string | null;
  photoCount?: number;
}) {
  const t = useTranslation();
  const appleTouch = isAppleTouchDevice();
  const [resource, setResource] = useState<{ file: File; url: string } | null>(
    null,
  );
  const [showSaveImage, setShowSaveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const [notice, setNotice] = useState<"started" | "completed" | null>(null);
  // Prepare synchronously before the tap: iPad file sharing requires user activation.
  const file = useMemo(() => {
    if (!imageUrl) return null;
    try {
      const encoded = imageUrl.split(",")[1];
      const bytes = Uint8Array.from(atob(encoded), (character) =>
        character.charCodeAt(0),
      );
      return new File([bytes], "the-photobooth.png", { type: "image/png" });
    } catch {
      return null;
    }
  }, [imageUrl]);
  useEffect(() => {
    setShowSaveImage(false);
    setNotice(null);
    if (!file || typeof URL.createObjectURL !== "function") {
      setResource(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setResource({ file, url });
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const downloadUrl = resource?.file === file ? resource?.url : null;
  const download = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (!imageUrl || busy.current) {
      event.preventDefault();
      return;
    }
    if (!appleTouch) {
      setNotice("started");
      return;
    } // The browser does not expose completion of a native download.
    event.preventDefault();
    setNotice(null);
    let canShare = false;
    try {
      canShare = Boolean(
        file &&
        typeof navigator.share === "function" &&
        navigator.canShare?.({ files: [file] }),
      );
    } catch {
      /* Show the local save fallback. */
    }
    if (!file || !canShare) {
      setShowSaveImage(true);
      return;
    }
    busy.current = true;
    setSaving(true);
    try {
      await navigator.share({ files: [file] });
      setNotice("completed");
    } catch (error) {
      if (!(
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "AbortError"
      ))
        setShowSaveImage(true);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  return (
    <>
      <a
        className={`pill ${!imageUrl || saving ? "disabled" : ""}`}
        id="btn-download"
        href={downloadUrl ?? imageUrl ?? undefined}
        download="the-photobooth.png"
        aria-disabled={!imageUrl || saving}
        onClick={(event) => void download(event)}
      >
        {t(saving ? "Opening save options…" : "DOWNLOAD")}
      </a>
      {notice && (
        <p className="save-confirmation" role="status">
          {t(
            notice === "started"
              ? "Download started! Check Downloads for your photo."
              : "Done! Your photo was saved or shared.",
          )}
        </p>
      )}
      {appleTouch && imageUrl && (
        <p className="save-photo-hint">
          {t("Choose Save Image or Save to Files in the save menu.")}
        </p>
      )}
      {showSaveImage && imageUrl && (
        <div className="save-photo-card">
          <p className="save-photo-hint" role="status">
            {t(
              "Touch and hold the image below to save it, or open it in a new tab.",
            )}
          </p>
          <div className="strip-credit-surface">
            <img
              className="save-photo-preview"
              src={downloadUrl ?? imageUrl}
              alt={t("Your photo strip, ready to save")}
            />
            <StripCreditLink photoCount={photoCount} />
          </div>
          <a
            className="text-button"
            href={downloadUrl ?? imageUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("Open image ↗")}
          </a>
        </div>
      )}
    </>
  );
}
