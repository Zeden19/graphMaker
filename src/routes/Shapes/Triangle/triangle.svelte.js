import {Shape} from "../shape.svelte.js";
import rotateCords from "$lib/rotateCords.js";

const DEFAULT_X1 = 50;
const DEFAULT_X2 = 100
const DEFAULT_X3 = 0
const DEFAULT_Y1 = 15;
const DEFAULT_Y2 = 100;
const DEFAULT_Y3 = 100;

export class Triangle extends Shape {

  constructor(offset, getShapeArray, canvasScale, properties = {strokeWidth: 1, strokeColor: "black"}) {
    super(getShapeArray, properties);
    this.x1 = $state(properties.x1 ?? DEFAULT_X1 - offset.x);
    this.x2 = $state(properties.x2 ?? DEFAULT_X2 - offset.x);
    this.x3 = $state(properties.x2 ?? DEFAULT_X3 - offset.x);
    this.y1 = $state(properties.y1 ?? DEFAULT_Y1 - offset.y);
    this.y2 = $state(properties.y2 ?? DEFAULT_Y2 - offset.y);
    this.y3 = $state(properties.y2 ?? DEFAULT_Y3 - offset.y);

    this.strokeWidth = $state(properties.strokeWidth);
    this.strokeColor = $state(properties.strokeColor);

    this.center = $derived({
      x: (this.position.x1 + this.position.x2 + this.position.x3) / 3,
      y: (this.position.y1 + this.position.y2 + this.position.y3) / 3
    });

    this.width = $derived(Math.max(this.x1, this.x2, this.x3) - Math.min(this.x1, this.x2, this.x3));
    this.height = $derived(Math.max(this.y1, this.y2, this.y3) - Math.min(this.y1, this.y2, this.y3));

    this.rotation = $state(properties.rotation ?? 0);

    this.position = $derived({
      x1: this.x1 + offset.x,
      y1: this.y1 + offset.y,
      x2: this.x2 + offset.x,
      y2: this.y2 + offset.y,
      x3: this.x3 + offset.x,
      y3: this.y3 + offset.y
    });

    // fixme: still gotta add movefnc
    this.rect = $derived({
      point1: {...rotateCords(this.position.x1, this.position.y1, this.center, this.rotation)},
      point2: {...rotateCords(this.position.x2, this.position.y2, this.center, this.rotation)},
      point3: {...rotateCords(this.position.x3, this.position.y3, this.center, this.rotation)},

      point1_2: {
        ...rotateCords(((this.position.x1 + this.position.x2) / 2),
          ((this.position.y1 + this.position.y2) / 2), this.center, this.rotation)
      },
      point1_3: {
        ...rotateCords(((this.position.x1 + this.position.x3) / 2),
          ((this.position.y1 + this.position.y3) / 2), this.center, this.rotation)
      },
      point2_3: {
        ...rotateCords(((this.position.x2 + this.position.x3) / 2),
          ((this.position.y2 + this.position.y3) / 2), this.center, this.rotation)
      }
    });
  }

  toJSON() {
    return {
      ...super.toJSON(),
      color: this.color,
      width: this.width,
      strokeWidth: this.strokeWidth,
      strokeColor: this.strokeColor,
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      x3: this.x3,
      y3: this.y3,
    };
  }

  isInside(x1, y1, x2, y2) {
    if (x2 < x1) {
      [x1, x2] = [x2, x1];
    }

    if (y2 < y1) {
      [y1, y2] = [y2, y1];
    }

    const pointInside = (px, py) => px > x1 && px < x2 && py > y1 && py < y2;

    return (
      pointInside(this.rect.point1.x, this.rect.point1.y) ||
      pointInside(this.rect.point2.x, this.rect.point2.y) ||
      pointInside(this.rect.point3.x, this.rect.point3.y)
    );
  }
}


export default Triangle;