import { useRef } from "react";
import type { PointerEvent, RefObject } from "react";
import type { PlacedSticker } from "../types/photobooth.types";
import { usePhotoboothStore } from "../store/usePhotoboothStore";
import { transformStickerGesture } from "../utils/stickerGestures";
import type { GesturePoint } from "../utils/stickerGestures";

type Baseline = {
  sticker: PlacedSticker;
  points: GesturePoint[];
  width: number;
  height: number;
};

export function useStickerGestures(
  boardRef: RefObject<HTMLDivElement>,
  selectedId: string | null,
  select: (id: string | null) => void,
) {
  const gesture = useRef({
    id: null as string | null,
    pointers: new Map<number, GesturePoint>(),
    baseline: null as Baseline | null,
  });

  const rebase = () => {
    const board = boardRef.current;
    const active = gesture.current;
    const sticker = usePhotoboothStore
      .getState()
      .stickers.find((item) => item.id === active.id);
    if (!board || !sticker || !active.pointers.size) {
      active.baseline = null;
      return;
    }
    const bounds = board.getBoundingClientRect();
    active.baseline = {
      sticker: { ...sticker },
      points: [...active.pointers.values()].map((point) => ({ ...point })),
      width: bounds.width,
      height: bounds.height,
    };
  };
  const cancelGesture = () => {
    const board = boardRef.current;
    const ids = [...gesture.current.pointers.keys()];
    gesture.current = { id: null, pointers: new Map(), baseline: null };
    ids.forEach((id) => {
      if (board?.hasPointerCapture?.(id)) board.releasePointerCapture(id);
    });
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !boardRef.current) return;
    const active = gesture.current;
    if (active.pointers.size >= 2) {
      event.preventDefault();
      return;
    }
    const piece = (event.target as Element).closest<HTMLElement>(
      "[data-sticker-id]",
    );
    const id =
      active.id ??
      piece?.dataset.stickerId ??
      (event.pointerType === "touch" ? selectedId : null);
    if (!id) {
      cancelGesture();
      select(null);
      return;
    }
    event.preventDefault();
    select(id);
    piece?.focus({ preventScroll: true });
    const bounds = boardRef.current.getBoundingClientRect();
    active.id = id;
    active.pointers.set(event.pointerId, {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
    boardRef.current.setPointerCapture?.(event.pointerId);
    rebase();
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const active = gesture.current;
    if (
      !active.pointers.has(event.pointerId) ||
      !active.id ||
      !active.baseline ||
      !boardRef.current
    )
      return;
    event.preventDefault();
    const bounds = boardRef.current.getBoundingClientRect();
    active.pointers.set(event.pointerId, {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
    usePhotoboothStore
      .getState()
      .updateSticker(
        active.id,
        transformStickerGesture(
          active.baseline.sticker,
          active.baseline.points,
          [...active.pointers.values()],
          active.baseline,
        ),
      );
  };
  const endPointer = (event: PointerEvent<HTMLDivElement>) => {
    const active = gesture.current;
    if (!active.pointers.delete(event.pointerId)) return;
    // Rebase when a finger is lifted so the remaining finger can keep dragging without a jump.
    if (active.pointers.size) rebase();
    else {
      active.id = null;
      active.baseline = null;
    }
    if (event.currentTarget.hasPointerCapture?.(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endPointer,
    onPointerCancel: endPointer,
    onLostPointerCapture: endPointer,
    cancelGesture,
  };
}
