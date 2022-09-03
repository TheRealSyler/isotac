import { InterpolationFunction, smootherstep } from './interpolation'
import { perlin2DFast as perlin2DFunc } from './perlinFast'
import { cyrb128, sfc32 } from './random'

export interface PerlinSettings {
  frequency: number,
  frequencyMultiplier: number,
  amplitudeMultiplier: number,
  octaves: number,
  seed: number
  interpolate: InterpolationFunction
  /** should return number between 0 and 1 */
  randomNumber: (x: number, y: number, seed: number) => number
}


/** Adapted from https://en.wikipedia.org/wiki/Perlin_noise */
export class Perlin {
  private settings: PerlinSettings = {
    frequency: 0.02,
    octaves: 4,
    frequencyMultiplier: 2,
    amplitudeMultiplier: 0.5,
    seed: 0,
    interpolate: smootherstep,
    randomNumber: defaultRandomNumber(),
  }
  constructor(settings?: Partial<PerlinSettings>, private a = false) {
    settings && this.setSettings(settings)
  }

  setSettings(settings: Partial<PerlinSettings>) {
    this.settings = { ...this.settings, ...settings }
  }

  /** return range -1 to 1 */
  get(x: number, y: number, seedOffset?: number) {
    let res = 0

    let frequency = this.settings.frequency
    let amplitude = 1
    let divider = 0
    for (let o = 0; o < this.settings.octaves; o++) {

      if (this.a) {
        res += this.perlin(x * frequency, y * frequency, seedOffset) * amplitude

      } else {
        res += perlin2DFunc(x * frequency, y * frequency) * amplitude
        // res += Noise2D(x * frequency, y * frequency) * amplitude

      }

      divider += amplitude
      frequency *= this.settings.frequencyMultiplier
      amplitude *= this.settings.amplitudeMultiplier
    }

    return res / divider
  }
  /** return range 0 to 255 */
  getRgb(x: number, y: number, seedOffset?: number) {
    const v = Math.round(((this.get(x, y, seedOffset) + 0.5)) * 255)
    return v
    // return v < 0 ? 0 : v > 255 ? 255 : v
    // return (this.get(x, y, seedOffset))
  }

  createImageData(width = 300, height = 300) {
    let max = -Infinity
    let min = Infinity
    const data = []
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const value = this.getRgb(x, y)
        if (value < min) min = value
        if (value > max) max = value
        data.push(value, value, value, 255)
      }
    }
    console.log({ max, min, a: this.a ? 'OLD ' : 'NEW' })
    return new ImageData(new Uint8ClampedArray(data), width, height)
  }

  createImageDataColor(width = 300, height = 300) {

    const data = []
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        data.push(this.getRgb(x, y), this.getRgb(x, y, 1), this.getRgb(x, y, 2), 255)
      }
    }

    return new ImageData(new Uint8ClampedArray(data), width, height)
  }

  /** return range -1 to 1 */
  private perlin(x: number, y: number, seedOffset = 0) {
    const x0 = Math.floor(x);
    const x1 = x0 + 1;
    const y0 = Math.floor(y);
    const y1 = y0 + 1;

    const sx = x - x0
    const sy = y - y0

    const seed = this.settings.seed + seedOffset

    const ix0 = this.settings.interpolate(
      this.dotGridGradient(x0, y0, x, y, seed),
      this.dotGridGradient(x1, y0, x, y, seed),
      sx
    );

    const ix1 = this.settings.interpolate(
      this.dotGridGradient(x0, y1, x, y, seed),
      this.dotGridGradient(x1, y1, x, y, seed),
      sx
    );

    return this.settings.interpolate(ix0, ix1, sy);
  }

  private dotGridGradient(ix: number, iy: number, x: number, y: number, seed: number) {
    const random = this.settings.randomNumber(ix, iy, seed) * Math.PI * 2;
    return (x - ix) * Math.cos(random) + (y - iy) * Math.sin(random)
  }
}

export const defaultRandomNumber = (() => {
  const memory = new Map()

  return (x: number, y: number, seed: number) => {

    const key = `${x}-${y}:${seed}`;
    const memorizedRandom = memory.get(key)
    if (memorizedRandom) return memorizedRandom

    const random = (Math.round(sfc32(...cyrb128(key)) * 4) / 4)
    memory.set(key, random)
    return random
  }
})






export default Perlin