import {BasicShape} from "./shape.svelte.js";
import rotateCords from "$lib/rotateCords.js";

export class Box extends BasicShape {
  constructor(offset, canvasScale, properties = {}, removeShape) {
    super(offset, canvasScale, properties, removeShape);
  }

}