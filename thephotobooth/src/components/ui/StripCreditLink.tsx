import { getStripLayout } from "../../utils/stripLayout";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "../../utils/branding";

// The PNG retains its printed credit; the web preview adds a separate link above it.
export function StripCreditLink({ photoCount }: { photoCount: number }) {
  const layout = getStripLayout(photoCount);
  const prefix = "the photobooth · ";
  const charWidth = 22 * 0.6;
  const left =
    layout.width / 2 -
    ((prefix.length + INSTAGRAM_HANDLE.length) * charWidth) / 2 +
    prefix.length * charWidth -
    8;
  return (
    <a
      className="strip-credit-link"
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${INSTAGRAM_HANDLE} — Instagram`}
      title={`Instagram: ${INSTAGRAM_HANDLE}`}
      onPointerDown={(event) => event.stopPropagation()}
      draggable={false}
      style={{
        left: `${(left / layout.width) * 100}%`,
        top: `${((layout.height - layout.footer + 12) / layout.height) * 100}%`,
        width: `${((INSTAGRAM_HANDLE.length * charWidth + 16) / layout.width) * 100}%`,
        height: `${(54 / layout.height) * 100}%`,
      }}
    >
      <span className="sr-only">{INSTAGRAM_HANDLE}</span>
    </a>
  );
}
