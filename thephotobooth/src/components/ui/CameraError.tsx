export function CameraError({
  error,
  retry,
}: {
  error: string | null;
  retry: () => void;
}) {
  if (!error) return null;
  return (
    <div className="camera-error" role="alert">
      <p>{error}</p>
      <button className="pill outline" onClick={retry}>
        retry camera
      </button>
    </div>
  );
}
