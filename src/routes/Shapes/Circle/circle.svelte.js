import {BasicShape} from "../shape.svelte.js";
import rotateCords from "$lib/rotateCords.js";

const bottomRightAngle = 45 * Math.PI / 180; // 45 degrees
const bottomLeftAngle = 135 * Math.PI / 180; // 135 degrees
const topRightAngle = 315 * Math.PI / 180; // 315 degrees
const topLeftAngle = 225 * Math.PI / 180; // 225 degrees

export class Circle extends BasicShape {
  constructor(offset, getShapeArray, canvasScale, properties = {}) {
    super(offset, getShapeArray, canvasScale, properties);
    this.center = $derived({x: this.position.x, y: this.position.y});

    // halving strokeWidth because stroke is drawn from center of line, rather than outside
    this.rect = $derived(
      {
        top: {
          ...rotateCords(this.position.x, this.position.y - this.heightWithScale - this.strokeWidth / 2, {
            x: this.position.x,
            y: this.position.y
          }, this.rotation),
          changeSizeFnc: (dx, dy, {height}) => {
            this.changeTop(dy, height);
          }
        },
        bottom: {
          ...rotateCords(this.position.x, this.position.y + this.heightWithScale + this.strokeWidth / 2, {
            x: this.position.x,
            y: this.position.y
          }, this.rotation),
          changeSizeFnc: (dx, dy, {height}) => {
            this.changeBottom(dy, height);
          }
        },
        left: {
          ...rotateCords(this.position.x - this.widthWithScale - this.strokeWidth / 2, this.position.y, {
            x: this.position.x,
            y: this.position.y
          }, this.rotation),
          changeSizeFnc: (dx, dy, {width}) => {
            this.changeLeft(dx, width);
          }
        },
        right: {
          ...rotateCords(this.position.x + this.widthWithScale + this.strokeWidth / 2, this.position.y, {
            x: this.position.x,
            y: this.position.y
          }, this.rotation),
          changeSizeFnc: (dx, dy, {width}) => {
            this.changeRight(dx, width);
          }
        },

        bottomRight: {
          ...this.#createCornerPos(bottomRightAngle), changeSizeFnc: (dx, dy, {width, height}) => {
            this.changeRight(dx, width);
            this.changeBottom(dy, height);
          }
        },
        bottomLeft: {
          ...this.#createCornerPos(bottomLeftAngle), changeSizeFnc: (dx, dy, {width, height}) => {
            this.changeLeft(dx, width);
            this.changeBottom(dy, height);
          }
        },
        topLeft: {
          ...this.#createCornerPos(topLeftAngle), changeSizeFnc: (dx, dy, {width, height}) => {
            this.changeLeft(dx, width);
            this.changeTop(dy, height);
          }
        },
        topRight: {
          ...this.#createCornerPos(topRightAngle), changeSizeFnc: (dx, dy, {width, height}) => {
            this.changeRight(dx, width);
            this.changeTop(dy, height);
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
      ...rotateCords(this.position.x + (this.widthWithScale + this.strokeWidth / 2) * Math.cos(angle),
        this.position.y + (this.heightWithScale + this.strokeWidth / 2) * Math.sin(angle),
        {x: this.position.x, y: this.position.y}, this.rotation),
    };
  }
}


