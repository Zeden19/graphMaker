import {colord} from "colord";
import {Shape} from "../shape.svelte.js";

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
export class GraphText extends Shape {
  constructor(offset, canvasScale, getShapeArray) {
    super(offset, "Text", colord("white"), getShapeArray);
    this.fontSize = $state(12);
    this.bold = $state(false);
    this.italic = $state(false);
    this.underline = $state(false);
    this.width = $state(DEFAULT_WIDTH);
  }
}