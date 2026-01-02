import {BasicShape} from "../shape.svelte.js";
import rotateCords from "$lib/rotateCords.js";

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
          ...rotateCords(this.position.x, this.position.y - this.heightWithScale - this.strokeWidth / 2, {
            x: this.position.x,
            y: this.position.y
          }, this.rotation)
        },
        bottom: {
          ...rotateCords(this.position.x, this.position.y + this.heightWithScale + this.strokeWidth / 2, {
            x: this.position.x,
            y: this.position.y
          }, this.rotation)
        },
        left: {
          ...rotateCords(this.position.x - this.widthWithScale - this.strokeWidth / 2, this.position.y, {
            x: this.position.x,
            y: this.position.y
          }, this.rotation)
        },
        right: {
          ...rotateCords(this.position.x + this.widthWithScale + this.strokeWidth / 2, this.position.y, {
            x: this.position.x,
            y: this.position.y
          }, this.rotation)
        },

        bottomRight: {
          ...this.#createCornerPos(bottomRightAngle)
        },
        bottomLeft: {
          ...this.#createCornerPos(bottomLeftAngle)
        },
        topLeft: {
          ...this.#createCornerPos(topLeftAngle)
        },
        topRight: {
          ...this.#createCornerPos(topRightAngle)
        },
      }
    );
  }

  #createCornerPos(angle) {
    return {
      ...rotateCords(this.position.x + (this.widthWithScale + this.strokeWidth / 2) * Math.cos(angle),
        this.position.y + (this.heightWithScale + this.strokeWidth / 2) * Math.sin(angle),
        {x: this.position.x, y: this.position.y}, this.rotation),
    };
  }
}


