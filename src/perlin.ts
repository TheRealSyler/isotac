import { linear } from './interpolation'

export interface PerlinSettings {
  frequency: number,
  frequencyMultiplier: number,
  amplitudeMultiplier: number,
  octaves: number,
  /* Converts value from [-1, 1] t0 [0, 255] */
  rgbConversion: (v: number) => number
}


/** Adapted from https://en.wikipedia.org/wiki/Perlin_noise */
export class Perlin {
  private settings: PerlinSettings = {
    frequency: 0.02,
    octaves: 4,
    frequencyMultiplier: 2,
    amplitudeMultiplier: 0.5,
    rgbConversion: (v) => Math.round(((v + 1) * 0.5) * 255)
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

      res += perlin2DFunc(x * frequency, y * frequency) * amplitude

      divider += amplitude
      frequency *= this.settings.frequencyMultiplier
      amplitude *= this.settings.amplitudeMultiplier
    }

    return res / divider
  }
  /** return range 0 to 255 */
  getRgb(x: number, y: number) {
    const v = this.settings.rgbConversion(this.get(x, y))
    return v
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
    console.log({ max, min, })
    return new ImageData(new Uint8ClampedArray(data), width, height)
  }

  createImageDataColor(width = 300, height = 300) {

    const data = []
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        data.push(this.getRgb(x, y), this.getRgb(x * -1, y), this.getRgb(x, y * -1), 255)
      }
    }

    return new ImageData(new Uint8ClampedArray(data), width, height)
  }

}

// build the perm array to avoid overflow
const p = (() => {
  const permutation = [
    151, 160, 137, 91, 90, 15,
    131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
    190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
    77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
    102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
    135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
    5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
    223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
    129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
    251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
    49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
    138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
  ];

  const p = new Array(512);

  for (let i = 0; i < 256; i++)  p[256 + i] = p[i] = permutation[i]
  return p
})();




// fade: 6t^5-15t^4+10t^3
function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function grad2D(hash: number, x: number, y: number) {

  switch (hash & 3) {
    case 0: return x + y;
    case 1: return -x + y;
    case 2: return x - y;
    case 3: return -x - y;
    default: return 0; // never happens
  }
}

/** from  https://gist.github.com/toja/0e798c8dd54eb53ea0f0aeef414d16c9 */
export const perlin2DFunc = function (x: number, y: number) {

  // find square that contains this point
  const X = Math.floor(x) & 255
  const Y = Math.floor(y) & 255

  // find relative x, y, z of point in square
  x -= Math.floor(x);
  y -= Math.floor(y);

  // compute fade curves for x, y
  const u = fade(x)
  const v = fade(y);

  // hash coordinates of the 4 square corners
  const aa = p[p[X] + Y]
  const ab = p[p[X] + Y + 1]
  const ba = p[p[X + 1] + Y]
  const bb = p[p[X + 1] + Y + 1];

  // add blended results from 4 corners of square
  return linear(
    linear(
      grad2D(aa, x, y),
      grad2D(ba, x - 1, y),
      u
    ),
    linear(
      grad2D(ab, x, y - 1),
      grad2D(bb, x - 1, y - 1),
      u
    ),
    v
  );
}


export default Perlin