import { bezier } from './bezier';
import Perlin from './perlin';

const canvas = document.createElement('canvas')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

document.body.appendChild(canvas)

const ctx = canvas.getContext('2d')!

const t0 = performance.now()

ctx.putImageData(new Perlin({ octaves: 1 }).createImageDataColor(300, 300), 0, 0)
// ctx.putImageData(new Perlin({ octaves: 2, randomNumber: defaultRandomNumber2 }).createImageData(300, 300), 305, 0)
// ctx.putImageData(new Perlin({ octaves: 3, randomNumber: defaultRandomNumber2 }).createImageData(300, 300), 0, 305)
ctx.putImageData(new Perlin({ octaves: 4, rgbConversion: (v) => Math.round(((bezier(v, 0, 0.4, 1, 1) + 1) * 0.5) * 255) }).createImageDataColor(300, 300), 305, 305)
const t0Res = performance.now() - t0
const t1 = performance.now()
ctx.putImageData(new Perlin({ octaves: 1 }).createImageData(300, 300), 610 + 0, 0)
// ctx.putImageData(new Perlin({ octaves: 2 }).createImageData(300, 300), 610 + 305, 0)
// ctx.putImageData(new Perlin({ octaves: 3 }).createImageData(300, 300), 610 + 0, 305)
ctx.putImageData(new Perlin({ octaves: 4 }).createImageData(300, 300), 610 + 305, 305)

const t1Res = performance.now() - t1

console.log({ t0Res, t1Res })
