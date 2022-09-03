import { smootherstep } from './interpolation';
import { mulberry32 } from './random';



function MakePermutation() {
  const PERMUTATIONS: number[] = [];
  for (let i = 0; i < 256; i++) PERMUTATIONS.push(i)

  const r = mulberry32(2)
  for (let e = PERMUTATIONS.length - 1; e > 0; e--) {
    let index = Math.round(r() * (e - 1)),
      temp = PERMUTATIONS[e];

    PERMUTATIONS[e] = PERMUTATIONS[index];
    PERMUTATIONS[index] = temp;
  }
  return PERMUTATIONS;
}




function Fade(t: number) {
  return ((6 * t - 15) * t + 10) * t * t * t;
}



function GetConstantVector(x: number, y: number, v: number) {
  //v is the value from the permutation table
  const h = v & 3;
  if (h === 0) return dot(x, y, 1, 1)
  else if (h === 1) return dot(x, y, -1, 1)
  else if (h === 2) return dot(x, y, -1, -1)
  else return dot(x, y, 1, -1)

}


function dot(x1: number, y1: number, x2: number, y2: number) {
  return x1 * x2 + y1 * y2
}


const PERMUTATIONS = MakePermutation();

// from https://rtouti.github.io/graphics/perlin-noise-algorithm
export function Noise2D(x: number, y: number) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;

  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);


  const dotTopRight = GetConstantVector(xf - 1, yf - 1, PERMUTATIONS[PERMUTATIONS[X + 1] + Y + 1])
  const dotTopLeft = GetConstantVector(xf, yf - 1, PERMUTATIONS[PERMUTATIONS[X] + Y + 1])
  const dotBottomRight = GetConstantVector(xf - 1, yf, PERMUTATIONS[PERMUTATIONS[X + 1] + Y])
  const dotBottomLeft = GetConstantVector(xf, yf, PERMUTATIONS[PERMUTATIONS[X] + Y])

  const u = xf;
  const v = yf;

  return smootherstep(
    smootherstep(dotBottomLeft, dotTopLeft, v),
    smootherstep(dotBottomRight, dotTopRight, v),
    u
  );

}






