import {BasicShape} from "../shape.svelte.js";

export class Triangle extends BasicShape {

  constructor(offset, canvasScale, properties = {strokeWidth: 1, strokeColor: "black"}, removeShape) {
    super(offset, canvasScale, properties, removeShape);
  }
}


export default Triangle;