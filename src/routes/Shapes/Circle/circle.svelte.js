import {colord} from "colord";
import {BasicShape} from "../shape.svelte.js";

const bottomRightAngle = 45 * Math.PI / 180; // 45 degrees
const bottomLeftAngle = 135 * Math.PI / 180; // 135 degrees
const topRightAngle = 315 * Math.PI / 180; // 315 degrees
const topLeftAngle = 225 * Math.PI / 180; // 225 degrees

const DEFAULT_X = 350;
const DEFAULT_Y = 250;

export class Circle extends BasicShape {
  constructor(offset, getShapeArray, canvasScale, {
    color = "white",
    textColor = "black",
    x = DEFAULT_X - offset.x,
    y = DEFAULT_Y - offset.y,
    r = 80,
    strokeColor = "black",
    strokeWidth = 2
  }) {
    super(offset, getShapeArray, {color, textColor, x, y});
    this.r = $state(r);
    this.strokeColor = $state(colord(strokeColor));
    this.strokeWidth = $state(strokeWidth);

    this.radiusWithScale = $derived(canvasScale() * this.r);
    this.rect = $derived(
      {
        top: {
          x: this.position.x, y: this.position.y - this.radiusWithScale,
        },
        bottom: {
          x: this.position.x, y: this.position.y + this.radiusWithScale,
        },
        left: {
          x: this.position.x - this.radiusWithScale, y: this.position.y,
        },
        right: {
          x: this.position.x + this.radiusWithScale, y: this.position.y,
        },

        bottomRight: this.#createCornerPos(bottomRightAngle),
        bottomLeft: this.#createCornerPos(bottomLeftAngle),
        topLeft: this.#createCornerPos(topLeftAngle),
        topRight: this.#createCornerPos(topRightAngle),
      }
    );
  }

  #createCornerPos(angle) {
    return {
      x: this.position.x + this.radiusWithScale * Math.cos(angle),
      y: this.position.y + this.radiusWithScale * Math.sin(angle)
    };
  }

  toJSON() {
    return {...super.toJSON(), r: this.r, strokeColor: this.strokeColor.toHex(), strokeWidth: this.strokeWidth};
  }
}


