import {Box} from "../Box.svelte.js";
import {colord} from "colord";

const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 20;
const DEFAULT_COLOR = colord("white");
export class GraphText extends Box {
  constructor(offset, getShapeArray, canvasScale) {
    super(offset, getShapeArray, canvasScale, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    this.text.color = DEFAULT_COLOR;
  }
}