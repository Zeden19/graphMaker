import {BasicShape} from "./shape.svelte.js";
import rotateCords from "$lib/rotateCords.js";

export class Box extends BasicShape {
  constructor(offset, getShapeArray, canvasScale, properties = {}) {
    super(offset, getShapeArray, canvasScale, properties);

    this.rect = $derived({
      top: {
        ...rotateCords(this.position.x + (this.widthWithScale / 2), this.position.y - this.strokeWidth, this.center, this.rotation)
      },

      left: {
        ...rotateCords(this.position.x - this.strokeWidth, this.position.y + (this.heightWithScale / 2), this.center, this.rotation)
      },

      right: {
        ...rotateCords(this.position.x + this.widthWithScale + this.strokeWidth, this.position.y + (this.heightWithScale / 2), this.center, this.rotation)
      },

      bottom: {
        ...rotateCords(this.position.x + (this.widthWithScale / 2), this.position.y + this.heightWithScale + this.strokeWidth, this.center, this.rotation)
      },

      topLeft: {
        ...rotateCords(this.position.x - this.strokeWidth, this.position.y - this.strokeWidth, this.center, this.rotation),
      },
      topRight: {
        ...rotateCords(this.position.x + this.widthWithScale + this.strokeWidth, this.position.y - this.strokeWidth, this.center, this.rotation),
      },
      bottomLeft: {
        ...rotateCords(this.position.x - this.strokeWidth, this.position.y + this.heightWithScale + this.strokeWidth, this.center, this.rotation),
      },
      bottomRight: {
        ...rotateCords(this.position.x + this.widthWithScale + this.strokeWidth, this.position.y + this.heightWithScale + this.strokeWidth, this.center, this.rotation)
      },
    });
  }

}