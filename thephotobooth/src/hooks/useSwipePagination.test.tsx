// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSwipePagination } from "./useSwipePagination";

afterEach(cleanup);
const point = (x: number, y = 100, identifier = 1) => ({ clientX: x, clientY: y, identifier });
function setup() {
  const change = vi.fn();
  const select = vi.fn();
  function Catalog() {
    const handlers = useSwipePagination(change);
    return <div data-testid="catalog" {...handlers}><button onClick={select}>Tile</button></div>;
  }
  render(<Catalog />);
  const catalog = screen.getByTestId("catalog");
  const swipe = (from: ReturnType<typeof point>, to: ReturnType<typeof point>) => {
    fireEvent.touchStart(catalog, { touches: [from] });
    fireEvent.touchMove(catalog, { touches: [to] });
    fireEvent.touchEnd(catalog, { touches: [], changedTouches: [to] });
  };
  return { catalog, swipe, change, select };
}
describe("touch pagination", () => {
  it("pages left and right once per gesture and suppresses the synthetic click", () => {
    const { swipe, change, select } = setup();
    swipe(point(220), point(80));
    expect(change.mock.calls).toEqual([[1]]);
    fireEvent.click(screen.getByRole("button"));
    expect(select).not.toHaveBeenCalled();
    swipe(point(80), point(220));
    expect(change.mock.calls).toEqual([[1], [-1]]);
  });
  it("lets a fresh tap select a tile, including immediately after a swipe", () => {
    const { catalog, swipe, select } = setup();
    swipe(point(220), point(80));
    fireEvent.touchStart(catalog, { touches: [point(100)] });
    fireEvent.touchEnd(catalog, { touches: [], changedTouches: [point(100)] });
    fireEvent.click(screen.getByRole("button"));
    expect(select).toHaveBeenCalledOnce();
  });
  it("does not change pages for short movements, vertical scrolls or diagonal gestures", () => {
    const { swipe, change } = setup();
    swipe(point(200), point(170));
    swipe(point(200), point(190, 220));
    swipe(point(200), point(100, 200));
    expect(change).not.toHaveBeenCalled();
  });
  it("keeps a vertical scroll vertical even if the finger later moves sideways", () => {
    const { catalog, change } = setup();
    fireEvent.touchStart(catalog, { touches: [point(200)] });
    fireEvent.touchMove(catalog, { touches: [point(200, 130)] });
    fireEvent.touchEnd(catalog, { touches: [], changedTouches: [point(60, 130)] });
    expect(change).not.toHaveBeenCalled();
  });
  it("cancels on multi-touch and browser cancellation", () => {
    const { catalog, change } = setup();
    fireEvent.touchStart(catalog, { touches: [point(220)] });
    fireEvent.touchMove(catalog, { touches: [point(160), point(220, 200, 2)] });
    fireEvent.touchEnd(catalog, { touches: [], changedTouches: [point(50)] });
    fireEvent.touchStart(catalog, { touches: [point(220)] });
    fireEvent.touchCancel(catalog);
    fireEvent.touchEnd(catalog, { touches: [], changedTouches: [point(50)] });
    expect(change).not.toHaveBeenCalled();
  });
});
