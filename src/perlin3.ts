import { mulberry32 } from './random';

class Vector2 {
  constructor(private x: number, private y: number) {
  }
  dot(other: Vector2) {
    return this.x * other.x + this.y * other.y;
  }
}

function MakePermutation() {
  let P: number[] = [];
  for (let i = 0; i < 256; i++) {
    P.push(i);
  }

  const r = mulberry32(2)
  for (let e = 255; e > 0; e--) {
    const index = Math.round(r() * (e - 1))
    let temp = P[e];

    P[e] = P[index];
    P[index] = temp;
  }
  return P;
}
let P = MakePermutation();

function GetConstantVector(v: number) {
  //v is the value from the permutation table
  let h = v & 3;
  if (h == 0)
    return new Vector2(1.0, 1.0);
  else if (h == 1)
    return new Vector2(-1.0, 1.0);
  else if (h == 2)
    return new Vector2(-1.0, -1.0);
  else
    return new Vector2(1.0, -1.0);
}

function Fade(t: number) {
  return ((6 * t - 15) * t + 10) * t * t * t;
}

function Lerp(t: number, a1: number, a2: number) {
  return a1 + t * (a2 - a1);
}

export function Noise2DOriginal(x: number, y: number) {
  let X = Math.floor(x) & 255;
  let Y = Math.floor(y) & 255;

  let xf = x - Math.floor(x);
  let yf = y - Math.floor(y);

  let topRight = new Vector2(xf - 1.0, yf - 1.0);
  let topLeft = new Vector2(xf, yf - 1.0);
  let bottomRight = new Vector2(xf - 1.0, yf);
  let bottomLeft = new Vector2(xf, yf);

  //Select a value in the array for each of the 4 corners
  let valueTopRight = P[P[X + 1] + Y + 1];
  let valueTopLeft = P[P[X] + Y + 1];
  let valueBottomRight = P[P[X + 1] + Y];
  let valueBottomLeft = P[P[X] + Y];

  let dotTopRight = topRight.dot(GetConstantVector(valueTopRight));
  let dotTopLeft = topLeft.dot(GetConstantVector(valueTopLeft));
  let dotBottomRight = bottomRight.dot(GetConstantVector(valueBottomRight));
  let dotBottomLeft = bottomLeft.dot(GetConstantVector(valueBottomLeft));

  let u = Fade(xf);
  let v = Fade(yf);

  return Lerp(u,
    Lerp(v, dotBottomLeft, dotTopLeft),
    Lerp(v, dotBottomRight, dotTopRight)
  );

}