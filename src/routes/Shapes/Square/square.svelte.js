import {colord} from "colord";
import {Box} from "../Box.svelte.js";

const DEFAULT_SIZE = 200

export class Square extends Box {
  constructor(offset, getShapeArray, canvasScale) {
    super(offset, getShapeArray, canvasScale, DEFAULT_SIZE, DEFAULT_SIZE);
    this.strokeColor = $state(colord("black"));
    this.strokeWidth = $state(2);
  }
}