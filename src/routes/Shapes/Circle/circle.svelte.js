import {BasicShape} from "../shape.svelte.js";

export class Circle extends BasicShape {
  constructor(offset, getShapeArray, canvasScale, properties = {}) {
    super(offset, getShapeArray, canvasScale, properties);
  }
}


