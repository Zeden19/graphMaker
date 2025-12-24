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
        changeSizeFnc: (dx, dy, {height}) => {
          this.changeTop(dy, height);
        }
      },

      left: {
        ...rotateCords(this.position.x - this.strokeWidth, this.position.y + (this.heightWithScale / 2), this.center, this.rotation),
        changeSizeFnc: (dx, dy, {width}) => {
          this.changeLeft(dx, width);
        }
      },

      right: {
        ...rotateCords(this.position.x + this.widthWithScale + this.strokeWidth, this.position.y + (this.heightWithScale / 2), this.center, this.rotation),
        changeSizeFnc: (dx, dy, {width}) => {
          this.changeRight(dx, width);
        }
      },

      bottom: {
        ...rotateCords(this.position.x + (this.widthWithScale / 2), this.position.y + this.heightWithScale + this.strokeWidth, this.center, this.rotation),
        changeSizeFnc: (dx, dy, {height}) => {
          this.changeBottom(dy, height);
        }
      },

      topLeft: {
        ...rotateCords(this.position.x - this.strokeWidth, this.position.y - this.strokeWidth, this.center, this.rotation),
        changeSizeFnc: (dx, dy, {width, height}) => {
          this.changeLeft(dx, width);
          this.changeTop(dy, height);
        },
      },
      topRight: {
        ...rotateCords(this.position.x + this.widthWithScale + this.strokeWidth, this.position.y - this.strokeWidth, this.center, this.rotation),
        changeSizeFnc: (dx, dy, {width, height}) => {
          this.changeTop(dy, height);
          this.changeRight(dx, width);
        },
      },
      bottomLeft: {
        ...rotateCords(this.position.x - this.strokeWidth, this.position.y + this.heightWithScale + this.strokeWidth, this.center, this.rotation),
        changeSizeFnc: (dx, dy, {width, height}) => {
          this.changeLeft(dx, width);
          this.changeBottom(dy, height);
        },
      },
      bottomRight: {
        ...rotateCords(this.position.x + this.widthWithScale + this.strokeWidth, this.position.y + this.heightWithScale + this.strokeWidth, this.center, this.rotation),
        changeSizeFnc: (dx, dy, {width, height}) => {
          this.changeRight(dx, width);
          this.changeBottom(dy, height);
        }
      },
    });
  }

}