import {colord} from "colord";
import {Box} from "../Box.svelte.js";

const DEFAULT_SIZE = 200
const DEFAULT_X = 350;
const DEFAULT_Y = 250;

export class Square extends Box {
  constructor(offset, getShapeArray, canvasScale,
              {
                width = DEFAULT_SIZE, height = DEFAULT_Y,
                color = "white", textColor = "black",
                x = DEFAULT_X - offset.x, y = DEFAULT_Y - offset.y,
                strokeColor = "black", strokeWidth = 2
              }) {
    super(offset, getShapeArray, canvasScale, {width, height, color, textColor, x, y});
    this.strokeColor = $state(colord(strokeColor));
    this.strokeWidth = $state(strokeWidth);
  }

  toJSON() {
    return {...super.toJSON(), strokeColor: this.strokeColor.toHex(), strokeWidth: this.strokeWidth};
  }
}