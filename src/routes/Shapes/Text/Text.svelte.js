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

export class GraphText extends Box {
  constructor(offset, canvasScale, getShapeArray) {
    super(offset, "Text", colord("white"), getShapeArray, canvasScale, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    this.fontSize = $state(12);
    this.bold = $state(false);
    this.italic = $state(false);
    this.underline = $state(false);
  }
}