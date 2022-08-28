export interface PerlinSettings {
  frequency: number,
  frequencyMultiplier: number,
  amplitudeMultiplier: number,
  octaves: number,
  interpolate: (a0: number, a1: number, w: number) => number
  /** should return number between 0 and 1 */
  randomNumber: (x: number, y: number) => number
}

/** Adapted from https://en.wikipedia.org/wiki/Perlin_noise */
export class Perlin {
  private settings: PerlinSettings = {
    frequency: 0.02,
    octaves: 4,
    frequencyMultiplier: 2,
    amplitudeMultiplier: 0.5,
    interpolate: interpolateSmootherstep,
    randomNumber: (x, y) => sfc32(...cyrb128(`${x}-${y}`)),
  }
  constructor(settings?: Partial<PerlinSettings>) {
    settings && this.setSettings(settings)
  }

  setSettings(settings: Partial<PerlinSettings>) {
    this.settings = { ...this.settings, ...settings }
  }

  /** return range -1 to 1 */
  get(x: number, y: number) {
    let res = 0

    let frequency = this.settings.frequency
    let amplitude = 1
    let divider = 0
    for (let o = 0; o < this.settings.octaves; o++) {

      res += this.perlin(x * frequency, y * frequency) * amplitude

      divider += amplitude
      frequency *= this.settings.frequencyMultiplier
      amplitude *= this.settings.amplitudeMultiplier
    }

    return res / divider
  }

  /** return range -1 to 1 */
  private perlin(x: number, y: number) {
    const x0 = Math.floor(x);
    const x1 = x0 + 1;
    const y0 = Math.floor(y);
    const y1 = y0 + 1;

    // TODO add order polynomial/s-curve ??
    // Determine interpolation weights
    // Could also use higher order polynomial/s-curve here
    const sx = x - x0;
    const sy = y - y0;

    let n0, n1;

    n0 = this.dotGridGradient(x0, y0, x, y);
    n1 = this.dotGridGradient(x1, y0, x, y);
    const ix0 = this.settings.interpolate(n0, n1, sx);

    n0 = this.dotGridGradient(x0, y1, x, y);
    n1 = this.dotGridGradient(x1, y1, x, y);
    const ix1 = this.settings.interpolate(n0, n1, sx);

    return this.settings.interpolate(ix0, ix1, sy);

  }
  dotGridGradient(ix: number, iy: number, x: number, y: number) {
    const random = this.settings.randomNumber(ix, iy) * Math.PI * 2;
    return (x - ix) * Math.cos(random) + (y - iy) * Math.sin(random);
  }
}

export const interpolateLinear: PerlinSettings['interpolate'] = (a0, a1, w) => {
  return (a1 - a0) * w + a0;
}

export const interpolateSmoothstep: PerlinSettings['interpolate'] = (a0, a1, w) => {
  return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0;
}

export const interpolateSmootherstep: PerlinSettings['interpolate'] = (a0, a1, w) => {
  return (a1 - a0) * ((w * (w * 6.0 - 15.0) + 10.0) * w * w * w) + a0;
}

/** from https://stackoverflow.com/a/47593316 */
function cyrb128(str: string) {
  let h1 = 1779033703, h2 = 3144134277,
    h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0] as const;
}

/** from https://stackoverflow.com/a/47593316 */
function sfc32(a: number, b: number, c: number, d: number) {
  a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
  let t = (a + b) | 0;
  a = b ^ b >>> 9;
  b = c + (c << 3) | 0;
  c = (c << 21 | c >>> 11);
  d = d + 1 | 0;
  t = t + d | 0;
  c = c + t | 0;
  return (t >>> 0) / 4294967296;
}

export default Perlin