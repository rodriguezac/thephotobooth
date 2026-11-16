import { useTranslation } from "../../i18n/useLanguage";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

import { getSharingConfig, uploadSharedPhoto } from "../../utils/sharePhoto";

export function ShareQr({ imageUrl }: { imageUrl: string | null }) {
  const t = useTranslation();
  const [share, setShare] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const config = getSharingConfig();
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);

  const createQr = async () => {
    if (loading || !imageUrl) return;
    if (share) {
      setOpen((value) => !value);
      return;
    }
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      if (!config) throw new Error("Photo hosting has not been connected yet.");
      const result = await uploadSharedPhoto(
        imageUrl,
        config,
        controller.signal,
      );
      const code = await QRCode.toDataURL(result, {
        width: 256,
        margin: 4,
        errorCorrectionLevel: "M",
        color: { dark: "#ff0da2", light: "#ffffff" },
      });
      if (controller.signal.aborted) return;
      setShare(result);
      setQr(code);
      setOpen(true);
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not generate the QR code.",
        );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  return (
    <div className="share-qr">
      <button
        className="pill outline"
        id="btn-share-qr"
        disabled={!imageUrl || loading || !config}
        aria-expanded={open}
        onClick={() => void createQr()}
      >
        {loading ? t("creating QR…") : open ? t("HIDE QR") : t("GET QR")}
      </button>
      {!config && (
        <p className="share-note">
          {t("Connect photo hosting to enable QR sharing.")}
        </p>
      )}
      {config && !share && (
        <p className="share-note">
          {t(
            "Generating a QR code uploads this strip to Cloudinary. Anyone with the link can view it.",
          )}
        </p>
      )}
      {error && (
        <p className="share-error" role="alert">
          {t(error)}
        </p>
      )}
      {open && qr && share && (
        <div className="qr-card">
          <p>{t("scan & save")}</p>
          <img
            src={qr}
            width="256"
            height="256"
            alt={t("QR code to download this photo strip")}
          />
          <a href={share} target="_blank" rel="noreferrer">
            {t("open photo ↗")}
          </a>
          <small>
            {t(
              "Scan with your phone camera. Touch and hold the photo to save it.",
            )}
          </small>
          <small>{t("Anyone with the link can view it.")}</small>
        </div>
      )}
    </div>
  );
}
