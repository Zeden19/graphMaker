import {BasicShape} from "../shape.svelte.js";

export class Triangle extends BasicShape {

  constructor(offset, getShapeArray, canvasScale, properties = {strokeWidth: 1, strokeColor: "black"}) {
    super(offset, getShapeArray, canvasScale, properties);
  }
}


export default Triangle;