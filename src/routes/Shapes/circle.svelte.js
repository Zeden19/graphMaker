import {colord} from "colord";
import {ShapeText} from "./ShapeText.svelte.js";

const bottomRightAngle = 45 * Math.PI / 180; // 45 degrees
const bottomLeftAngle = 135 * Math.PI / 180; // 135 degrees
const topRightAngle = 315 * Math.PI / 180; // 315 degrees
const topLeftAngle = 225 * Math.PI / 180; // 225 degrees

const DEFAULT_X = 350;
const DEFAULT_Y = 250;
const DEFAULT_RADIUS = 80;
const DEFAULT_COLOR = colord("#FFFFFF");
const DEFAULT_STROKE_COLOR = colord("black");
const DEFAULT_STROKE_WIDTH = 2;

export class Circle {
  constructor(offset, canvasScale) {
    this.x = $state(DEFAULT_X - offset.x);
    this.y = $state(DEFAULT_Y - offset.y);
    this.r = $state(DEFAULT_RADIUS);
    this.color = $state(DEFAULT_COLOR);
    this.strokeColor = $state(DEFAULT_STROKE_COLOR);
    this.strokeWidth = $state(DEFAULT_STROKE_WIDTH);
    this.text = new ShapeText("black");
    this.selected = $state(false);

    this.position = $derived({x: offset.x + this.x, y: offset.y + this.y});
    this.radiusWithScale = $derived(canvasScale() * this.r);


    this.circleRect = $derived(
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

    this.arrowsSnappedIndexes = [];
  }

  // arrow function for "this" value
  // see: https://svelte.dev/docs/svelte/$state#Passing-state-into-functions
  //todo: definately need to figure out a way to combine classes into generic shape object
  delete = () => {
    dispatchEvent(new CustomEvent('deleteShape', {detail: {shape: this, type: "circle"}}));
  }

  #createCornerPos(angle) {
    return {
      x: this.position.x + this.radiusWithScale * Math.cos(angle),
      y: this.position.y + this.radiusWithScale * Math.sin(angle)
    };
  }

  toString() {
    return "Circle"
  }
}


