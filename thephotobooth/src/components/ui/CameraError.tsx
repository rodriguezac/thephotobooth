import { useTranslation } from "../../i18n/useLanguage";
export function CameraError({
  error,
  retry,
}: {
  error: string | null;
  retry: () => void;
}) {
  const t = useTranslation();
  if (!error) return null;
  return (
    <div className="camera-error" role="alert">
      <p>{t(error)}</p>
      <button className="pill outline" onClick={retry}>
        {t("retry camera")}
      </button>
    </div>
  );
}
