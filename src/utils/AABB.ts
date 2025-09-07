import { BoundingRect } from '../types'

export function intersectAABBs(
  main: BoundingRect,
  other: BoundingRect,
): boolean {
  return (
    main.minX < other.maxX &&
    main.maxX > other.minX &&
    main.minY < other.maxY &&
    main.maxY > other.minY
  )
}
