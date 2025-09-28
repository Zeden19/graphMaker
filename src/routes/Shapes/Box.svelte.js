import {BasicShape} from "./shape.svelte.js";

export class Box extends BasicShape {
  constructor(offset, getShapeArray, canvasScale, properties = {}) {
    super(offset, getShapeArray, canvasScale, properties);

    this.rect = $derived({
      top: {
        x: this.position.x + (this.widthWithScale / 2), y: this.position.y - this.strokeWidth,
        changeSizeFnc: (dx, dy, _, sizeBeforeHeight) => {
          this.changeTop(dy, sizeBeforeHeight);
        }
      },

      left: {
        x: this.position.x - this.strokeWidth, y: this.position.y + (this.heightWithScale / 2),
        changeSizeFnc: (dx, dy, sizeBeforeWidth) => {
          this.changeLeft(dx, sizeBeforeWidth);
        }
      },

      right: {
        x: this.position.x + this.widthWithScale + this.strokeWidth,
        y: this.position.y + (this.heightWithScale / 2),
        changeSizeFnc: (dx, dy, sizeBeforeWidth) => {
          this.changeRight(dx, sizeBeforeWidth);
        }
      },

      bottom: {
        x: this.position.x + (this.widthWithScale / 2),
        y: this.position.y + this.heightWithScale + this.strokeWidth,
        changeSizeFnc: (dx, dy, _, sizeBeforeHeight) => {
          this.changeBottom(dy, sizeBeforeHeight);
        }
      },

      topLeft: {
        x: this.position.x - this.strokeWidth, y: this.position.y - this.strokeWidth,
        changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
          this.changeLeft(dx, sizeBeforeWidth);
          this.changeTop(dy, sizeBeforeHeight);
        },
      },
      topRight: {
        x: this.position.x + this.widthWithScale + this.strokeWidth,
        y: this.position.y - this.strokeWidth,
        changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
          this.changeTop(dy, sizeBeforeHeight);
          this.changeRight(dx, sizeBeforeWidth);
        },
      },
      bottomLeft: {
        x: this.position.x - this.strokeWidth,
        y: this.position.y + this.heightWithScale + this.strokeWidth,
        changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
          this.changeLeft(dx, sizeBeforeWidth);
          this.changeBottom(dy, sizeBeforeHeight);
        },
      },
      bottomRight: {
        x: this.position.x + this.widthWithScale + this.strokeWidth,
        y: this.position.y + this.heightWithScale + this.strokeWidth,
        changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
          this.changeRight(dx, sizeBeforeWidth);
          this.changeBottom(dy, sizeBeforeHeight);
        }
      },
    });
  }

}