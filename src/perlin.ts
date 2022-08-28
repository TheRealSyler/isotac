// from https://en.wikipedia.org/wiki/Perlin_noise

class Vector2 {
  constructor(public x = 0, public y = 0) { }
  dot(v: Vector2) {

    return this.x * v.x + this.y * v.y;

  }

  distanceVec2(v: Vector2) {
    return new Vector2(this.x - v.x, this.y - v.y)
  }
}

function randomVector(a: number) {
  const theta = mulberry32(a) * 2 * Math.PI;
  return new Vector2(Math.cos(theta), Math.sin(theta))
}


export default function perlin(width: number, height: number) {
  const size = width * height

  const grid = Array.from({ length: size }).map((_, i) => randomVector(i))


  return (x: number, y: number) => {
    const xFloor = Math.floor(x)
    const yFloor = Math.floor(y)

    const vector = new Vector2(x / width, y / height)

    const leftUpCornerIndex = getIndex(xFloor, yFloor, width, height);
    const leftDownCornerIndex = getIndex(xFloor, yFloor + 1, width, height);
    const rightUpCornerIndex = getIndex(xFloor + 1, yFloor, width, height);
    const rightDownCornerIndex = getIndex(xFloor + 1, yFloor + 1, width, height);

    const leftUpCornerOffset = vector.distanceVec2(grid[leftUpCornerIndex]);
    const leftDownCornerOffset = vector.distanceVec2(grid[leftDownCornerIndex]);
    const rightUpCornerOffset = vector.distanceVec2(grid[rightUpCornerIndex]);
    const rightDownCornerOffset = vector.distanceVec2(grid[rightDownCornerIndex]);


    const wx = x - xFloor;
    const wy = y - yFloor;

    const leftUpCornerDot = vector.dot(leftUpCornerOffset);
    const leftDownCornerDot = vector.dot(leftDownCornerOffset);

    const rightUpCornerDot = vector.dot(rightUpCornerOffset);
    const rightDownCornerDot = vector.dot(rightDownCornerOffset);

    const i1 = interpolate(leftUpCornerDot, rightUpCornerDot, wx);
    const i2 = interpolate(leftDownCornerDot, rightDownCornerDot, wx);

    return interpolate(i1, i2, wy);


  }

}

function getIndex(x: number, y: number, width: number, height: number) {

  let cx = x
  let cy = y
  // wrap coordinates
  if (cx >= width) cx = 0
  if (cx < 0) cx = width - 1
  if (cy >= height) cy = 0
  if (cy < 0) cy = height - 1

  return cx + width * cy
}

function interpolate(a0: number, a1: number, w: number) {
  /* // You may want clamping by inserting:
   * if (0.0 > w) return a0;
   * if (1.0 < w) return a1;
   */
  // return (a1 - a0) * w + a0;
  /* // Use this cubic interpolation [[Smoothstep]] instead, for a smooth appearance:
   * return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0;
   *
   * // Use [[Smootherstep]] for an even smoother result with a second derivative equal to zero on boundaries:
   *  return (a1 - a0) * ((w * (w * 6.0 - 15.0) + 10.0) * w * w * w) + a0;
   */
  return (a1 - a0) * ((w * (w * 6.0 - 15.0) + 10.0) * w * w * w) + a0;
}
function mulberry32(a: number) {
  var t = a += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}