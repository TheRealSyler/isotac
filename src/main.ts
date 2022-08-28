import { Perlin } from './perlin';
import './style.css';

const canvas = document.createElement('canvas')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

document.body.appendChild(canvas)

const ctx = canvas.getContext('2d')!

const s = 500
const width = s
const height = s

// const a = perlin(width, height)



// const awd = PerlinNoise2D(200, 200, 1, 2)

// console.log(PerlinNoise2D(2, 2, 2, 2))
// const noiseGen = (x: number, y: number) => 2
// console.log(noiseGen(0, 0))
// console.log(noiseGen(3, 48))
// console.log(noiseGen(4, 48))


const pg = new Perlin({

})

for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {

    // let frequency = 0.04
    // const octaves = 5
    // let res = 0
    // let amplitude = 1
    // let divider = 0
    // for (let o = 0; o < octaves; o++) {
    //   divider += amplitude
    //   res += perlin(x * frequency, y * frequency) * amplitude
    //   frequency *= 2
    //   amplitude *= 0.5
    // }

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 1, y + 1)
    const v = Math.round(((pg.get(x, y)) + 1) * 128)
    // const v = Math.round((res / divider) * 255)
    ctx.strokeStyle = `rgb(${v},${v},${v})`
    ctx.stroke()



  }
}
// console.log('end')

