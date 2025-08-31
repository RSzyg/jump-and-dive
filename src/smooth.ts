/**
 * Linear interpolation for smooth transition
 * @param arr - Array of numbers to interpolate
 * @param t - Interpolation factor (0 to arr.length - 1)
 * @returns Interpolated value
 */
export function getLinearSmooth(arr: number[], t: number): number {
  const index = Math.floor(t)
  const nextIndex = index + 1
  if (nextIndex >= arr.length) {
    return arr[arr.length - 1]
  }
  const weight = t - index
  return arr[index] * (1 - weight) + arr[nextIndex] * weight
}