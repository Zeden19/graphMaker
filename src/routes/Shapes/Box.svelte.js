import {BasicShape} from "./shape.svelte.js";
import rotateCords from "$lib/rotateCords.js";

export class Box extends BasicShape {
  constructor(offset, getShapeArray, canvasScale, properties = {}) {
    super(offset, getShapeArray, canvasScale, properties);

    this.center = $derived({
      x: this.position.x + (this.widthWithScale / 2),
      y: this.position.y + (this.heightWithScale / 2)
    });

    this.rect = $derived({
      top: {
        ...rotateCords(this.position.x + (this.widthWithScale / 2), this.position.y - this.strokeWidth, this.center, this.rotation),
        changeSizeFnc: (dx, dy, _, sizeBeforeHeight) => {
          this.changeTop(dy, sizeBeforeHeight);
        }
      },

      left: {
        ...rotateCords(this.position.x - this.strokeWidth, this.position.y + (this.heightWithScale / 2), this.center, this.rotation),
        changeSizeFnc: (dx, dy, sizeBeforeWidth) => {
          this.changeLeft(dx, sizeBeforeWidth);
        }
      },

      right: {
        ...rotateCords(this.position.x + this.widthWithScale + this.strokeWidth, this.position.y + (this.heightWithScale / 2), this.center, this.rotation),
        changeSizeFnc: (dx, dy, sizeBeforeWidth) => {
          this.changeRight(dx, sizeBeforeWidth);
        }
      },

      bottom: {
        ...rotateCords(this.position.x + (this.widthWithScale / 2), this.position.y + this.heightWithScale + this.strokeWidth, this.center, this.rotation),
        changeSizeFnc: (dx, dy, _, sizeBeforeHeight) => {
          this.changeBottom(dy, sizeBeforeHeight);
        }
      },

      topLeft: {
        ...rotateCords(this.position.x - this.strokeWidth, this.position.y - this.strokeWidth, this.center, this.rotation),
        changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
          this.changeLeft(dx, sizeBeforeWidth);
          this.changeTop(dy, sizeBeforeHeight);
        },
      },
      topRight: {
        ...rotateCords(this.position.x + this.widthWithScale + this.strokeWidth, this.position.y - this.strokeWidth, this.center, this.rotation),
        changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
          this.changeTop(dy, sizeBeforeHeight);
          this.changeRight(dx, sizeBeforeWidth);
        },
      },
      bottomLeft: {
        ...rotateCords(this.position.x - this.strokeWidth, this.position.y + this.heightWithScale + this.strokeWidth, this.center, this.rotation),
        changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
          this.changeLeft(dx, sizeBeforeWidth);
          this.changeBottom(dy, sizeBeforeHeight);
        },
      },
      bottomRight: {
        ...rotateCords(this.position.x + this.widthWithScale + this.strokeWidth, this.position.y + this.heightWithScale + this.strokeWidth, this.center, this.rotation),
        changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
          this.changeRight(dx, sizeBeforeWidth);
          this.changeBottom(dy, sizeBeforeHeight);
        }
      },
    });
  }

}