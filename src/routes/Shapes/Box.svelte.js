import {BasicShape} from "./shape.svelte.js";
import rotateCords from "$lib/rotateCords.js";

export class Box extends BasicShape {
  constructor(offset, getShapeArray, canvasScale, properties = {}) {
    super(offset, getShapeArray, canvasScale, properties);
  }

}