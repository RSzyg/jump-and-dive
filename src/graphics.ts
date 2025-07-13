import { Graphics } from "pixi.js";

export const mainCircle = new Graphics()
  .circle(0, 0, 10)
  .fill("#000")

export const miniCircle = new Graphics()
  .circle(0, 0, 2)
  .fill("#fff");

export const groundPiece = new Graphics()
  .rect(0, 0, 50, 50)
  .fill('#415e54')
