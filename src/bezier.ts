import { Point } from './utils'

// from https://www.desmos.com/calculator/ebdtbxgbq0
export function cubicBezier(t: number, controls: [Point, Point, Point, Point]): Point {

  const { x: c1, y: v1 } = controls[0]
  const { x: c2, y: v2 } = controls[1]
  const { x: c3, y: v3 } = controls[2]
  const { x: c4, y: v4 } = controls[3]

  return { x: bezier(t, c1, c2, c3, c4), y: bezier(t, v1, v2, v3, v4) }
}

export function bezier(t: number, p1: number, p2: number, p3: number, p4: number) {
  return (1 - t) ** 3 * p1 + 3 * t * (1 - t) ** 2 * p2 + 3 * t ** 2 * (1 - t) * p3 + t ** 3 * p4
}