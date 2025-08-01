import {colord} from "colord";
import {Box} from "../Box.svelte.js";

export class ShapeText {
  constructor(color) {
    this.color = $state(colord(color));
    this.fontSize = $state(12);
    this.bold = $state(false);
    this.italic = $state(false);
    this.underline = $state(false);
  }
}

const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 20;
const DEFAULT_COLOR = colord("white");
export class GraphText extends Box {
  constructor(offset, getShapeArray, canvasScale) {
    super(offset, getShapeArray, canvasScale, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    this.text.color = DEFAULT_COLOR;
  }
}