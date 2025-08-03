import {Box} from "../Box.svelte.js";

const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 20;
const DEFAULT_X = 350;
const DEFAULT_Y = 250;

export class GraphText extends Box {
  constructor(offset, getShapeArray, canvasScale, {
    width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, color = "white", text = {color: "white"},
    x = DEFAULT_X - offset.x,
    y = DEFAULT_Y - offset.y,
  }) {
    super(offset, getShapeArray, canvasScale, {
      width, height, color, text, x, y,
    });
  }
}