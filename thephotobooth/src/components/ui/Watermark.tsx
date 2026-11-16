import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "../../utils/branding";
export function Watermark() {
  return (
    <footer className="watermark">
      <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
        {INSTAGRAM_HANDLE}
      </a>
    </footer>
  );
}
