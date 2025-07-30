import {colord} from "colord";
import {ShapeText} from "../Text/Text.svelte.js";
import {Box} from "../Box.svelte.js";

const DEFAULT_SIZE = 200

export class Square extends Box {
  constructor(offset, canvasScale, getShapeArray) {
    super(offset, "Square", colord("white"), getShapeArray, canvasScale, DEFAULT_SIZE, DEFAULT_SIZE);
    this.text = new ShapeText("black");
    this.strokeColor = $state(colord("black"));
    this.strokeWidth = $state(2);
  }
}