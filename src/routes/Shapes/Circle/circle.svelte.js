import {colord} from "colord";
import {ShapeText} from "../Text/Text.svelte.js";
import {Shape} from "../shape.svelte.js";

const bottomRightAngle = 45 * Math.PI / 180; // 45 degrees
const bottomLeftAngle = 135 * Math.PI / 180; // 135 degrees
const topRightAngle = 315 * Math.PI / 180; // 315 degrees
const topLeftAngle = 225 * Math.PI / 180; // 225 degrees

const DEFAULT_RADIUS = 80;
const DEFAULT_STROKE_COLOR = colord("black");
const DEFAULT_STROKE_WIDTH = 2;

export class Circle extends Shape {
  constructor(offset, canvasScale, getShapeArray) {
    super(offset, "Circle", colord("white"), getShapeArray);
    this.r = $state(DEFAULT_RADIUS);
    this.strokeColor = $state(DEFAULT_STROKE_COLOR);
    this.strokeWidth = $state(DEFAULT_STROKE_WIDTH);
    this.text = new ShapeText("black");

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

  #createCornerPos(angle) {
    return {
      x: this.position.x + this.radiusWithScale * Math.cos(angle),
      y: this.position.y + this.radiusWithScale * Math.sin(angle)
    };
  }

  delete() {
    // Goku code
    this.arrowsSnappedIndexes.forEach(({index, pos}) => {
      dispatchEvent(new CustomEvent(`circleDelete${index}`, {detail: {pos}}));
    });
    super.delete();
  }
}


