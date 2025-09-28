import {BasicShape} from "../shape.svelte.js";

const bottomRightAngle = 45 * Math.PI / 180; // 45 degrees
const bottomLeftAngle = 135 * Math.PI / 180; // 135 degrees
const topRightAngle = 315 * Math.PI / 180; // 315 degrees
const topLeftAngle = 225 * Math.PI / 180; // 225 degrees

export class Circle extends BasicShape {
  constructor(offset, getShapeArray, canvasScale, properties = {}) {
    super(offset, getShapeArray, canvasScale, properties);

    // halving strokeWidth because stroke is drawn from center of line, rather than outside
    this.rect = $derived(
      {
        top: {
          x: this.position.x, y: this.position.y - this.heightWithScale - this.strokeWidth / 2,
          changeSizeFnc: (dx, dy, _, sizeBeforeHeight) => {
            this.changeTop(dy, sizeBeforeHeight);
          }
        },
        bottom: {
          x: this.position.x, y: this.position.y + this.heightWithScale + this.strokeWidth / 2,
          changeSizeFnc: (dx, dy, _, sizeBeforeHeight) => {
            this.changeBottom(dy, sizeBeforeHeight);
          }
        },
        left: {
          x: this.position.x - this.widthWithScale - this.strokeWidth / 2, y: this.position.y,
          changeSizeFnc: (dx, dy, sizeBeforeWidth) => {
            this.changeLeft(dx, sizeBeforeWidth);
          }
        },
        right: {
          x: this.position.x + this.widthWithScale + this.strokeWidth / 2, y: this.position.y,
          changeSizeFnc: (dx, dy, sizeBeforeWidth) => {
            this.changeRight(dx, sizeBeforeWidth);
          }
        },

        bottomRight: {
          ...this.#createCornerPos(bottomRightAngle), changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
            this.changeRight(dx, sizeBeforeWidth);
            this.changeBottom(dy, sizeBeforeHeight);
          }
        },
        bottomLeft: {
          ...this.#createCornerPos(bottomLeftAngle), changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
            this.changeLeft(dx, sizeBeforeWidth);
            this.changeBottom(dy, sizeBeforeHeight);
          }
        },
        topLeft: {
          ...this.#createCornerPos(topLeftAngle), changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
            this.changeLeft(dx, sizeBeforeWidth);
            this.changeTop(dy, sizeBeforeHeight);
          }
        },
        topRight: {
          ...this.#createCornerPos(topRightAngle), changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
            this.changeRight(dx, sizeBeforeWidth);
            this.changeTop(dy, sizeBeforeHeight);
          }
        },
      }
    );
  }

  /** Currently, the circle changes from the center when width and height change.
   *  Changing width and height without changing x and y results in the circle expanding
   *  from both directions. The below code fixes that by changing x and y. However
   *  since the circle changes from the center and this code is intended for changes
   *  from the topLeft corner, the change in size is greater than the change in mouse movement.
   *  Thus it is recommended to change this in the future, but not a high priority
   */
  changeRight(dx, sizeBeforeWidth) {
    const oldWidth = this.width;
    this.width = sizeBeforeWidth + dx;
    const changeInWidth = oldWidth - this.width;
    this.x -= changeInWidth;
  }

  changeBottom(dy, sizeBeforeHeight) {
    const oldHeight = this.height;
    this.height = sizeBeforeHeight + dy;
    const changeInHeight = oldHeight - this.height;
    this.y -= changeInHeight;
  }


  #createCornerPos(angle) {
    return {
      x: this.position.x + (this.widthWithScale + this.strokeWidth / 2) * Math.cos(angle),
      y: this.position.y + (this.heightWithScale + this.strokeWidth / 2) * Math.sin(angle)
    };
  }
}


