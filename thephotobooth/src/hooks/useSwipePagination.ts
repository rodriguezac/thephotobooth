import { useRef } from "react";
import type { MouseEvent, TouchEvent } from "react";

// Only the catalog owns this gesture; the strip's drag/pinch controls stay separate.
export function useSwipePagination(changePage: (direction: number) => void) {
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    axis: "horizontal" | "vertical" | null;
  } | null>(null);
  const suppressClickUntil = useRef(0);

  const onTouchStart = (event: TouchEvent<HTMLElement>) => {
    suppressClickUntil.current = 0;
    const touch = event.touches[0];
    gesture.current = event.touches.length === 1
      ? { id: touch.identifier, x: touch.clientX, y: touch.clientY, axis: null }
      : null;
  };
  const onTouchMove = (event: TouchEvent<HTMLElement>) => {
    const start = gesture.current;
    if (event.touches.length !== 1) {
      gesture.current = null;
      return;
    }
    const touch = event.touches[0];
    if (!start || touch.identifier !== start.id) return;
    const dx = Math.abs(touch.clientX - start.x);
    const dy = Math.abs(touch.clientY - start.y);
    if (!start.axis && Math.max(dx, dy) >= 12) {
      start.axis = dx > dy * 1.4 ? "horizontal" : "vertical";
    }
    if (start.axis === "horizontal") suppressClickUntil.current = Date.now() + 500;
  };
  const onTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const start = gesture.current;
    gesture.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch || touch.identifier !== start.id || event.touches.length) return;
    const dx = touch.clientX - start.x;
    const dy = Math.abs(touch.clientY - start.y);
    if (start.axis === "vertical" || Math.abs(dx) < 12 || Math.abs(dx) <= dy * 1.4) return;
    // A swipe must not also select whichever tile ends up under the finger.
    suppressClickUntil.current = Date.now() + 500;
    if (Math.abs(dx) >= 48) changePage(dx < 0 ? 1 : -1);
  };
  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (Date.now() < suppressClickUntil.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel: () => { gesture.current = null; },
    onClickCapture,
  };
}
