
export type InterpolationFunction = (a0: number, a1: number, w: number) => number

export const linear: InterpolationFunction = (a0, a1, w) => {
  return (a1 - a0) * w + a0;
}

export const smoothstep: InterpolationFunction = (a0, a1, w) => {
  return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0;
}

export const smootherstep: InterpolationFunction = (a0, a1, w) => {
  return (a1 - a0) * ((w * (w * 6.0 - 15.0) + 10.0) * w * w * w) + a0;
}