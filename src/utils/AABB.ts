import { BoundingRect } from '../types'

export function intersectAABBs(
  main: BoundingRect,
  other: BoundingRect,
  options?: {
    mainDelta?: { x: number; y: number; };
    includeEdges?: boolean;
  }
): boolean {
  const { mainDelta = { x: 0, y: 0 }, includeEdges = false } = options || {}
  if (includeEdges) {
    return (
      main.minX + mainDelta.x <= other.maxX &&
      main.maxX + mainDelta.x >= other.minX &&
      main.minY + mainDelta.y <= other.maxY &&
      main.maxY + mainDelta.y >= other.minY
    )
  }
  return (
    main.minX + mainDelta.x < other.maxX &&
    main.maxX + mainDelta.x > other.minX &&
    main.minY + mainDelta.y < other.maxY &&
    main.maxY + mainDelta.y > other.minY
  )
}
