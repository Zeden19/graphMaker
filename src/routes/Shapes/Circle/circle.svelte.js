import {BasicShape} from "../shape.svelte.js";

export class Circle extends BasicShape {
  constructor(offset, canvasScale, properties = {}, removeShape) {
    super(offset, canvasScale, properties, removeShape);
  }
}


