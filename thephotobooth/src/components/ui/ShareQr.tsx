import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

import { getSharingConfig, uploadSharedPhoto } from "../../utils/sharePhoto";

export function ShareQr({ imageUrl }: { imageUrl: string | null }) {
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
      if (!config)
        throw new Error("Falta conectar el alojamiento de las fotos.");
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
          cause instanceof Error ? cause.message : "No se pudo generar el QR.",
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
        {loading ? "creating QR…" : open ? "HIDE QR" : "GET QR"}
      </button>
      {!config && (
        <p className="share-note">QR pendiente de conectar el alojamiento.</p>
      )}
      {config && !share && (
        <p className="share-note">
          Al generar el QR, esta tira se sube a Cloudinary. Cualquiera con el
          enlace puede verla.
        </p>
      )}
      {error && (
        <p className="share-error" role="alert">
          {error}
        </p>
      )}
      {open && qr && share && (
        <div className="qr-card">
          <p>scan & save</p>
          <img
            src={qr}
            width="256"
            height="256"
            alt="QR para descargar esta tira de fotos"
          />
          <a href={share} target="_blank" rel="noreferrer">
            abrir foto ↗
          </a>
          <small>
            Escanea con la cámara de tu teléfono. Mantén presionada la foto para
            guardarla.
          </small>
          <small>Cualquiera con el enlace puede verla.</small>
        </div>
      )}
    </div>
  );
}
