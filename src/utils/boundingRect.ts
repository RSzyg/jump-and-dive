import { BoundingRect } from "../types";

export function translate(rect: BoundingRect, dx: number, dy: number): BoundingRect {
  return {
    minX: rect.minX + dx,
    maxX: rect.maxX + dx,
    minY: rect.minY + dy,
    maxY: rect.maxY + dy,
    width: rect.width,
    height: rect.height
  };
}