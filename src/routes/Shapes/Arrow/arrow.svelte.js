import {Shape} from "../shape.svelte.js";
import DraggableObject from "../DraggableObject.svelte.js";
import rotateCords from "$lib/rotateCords.js";

const DEFAULT_X1 = 350;
const DEFAULT_X2 = DEFAULT_X1 + 100
const DEFAULT_Y = 250;
const DEFAULT_WIDTH = 5;
const MARKER_SIZE = 4;

export class Arrow extends Shape {
  #color = $state();
  #rotation = $state();

  #isSnappedStart() {
    return !!this.startSnapped?.();
  }

  #isSnappedEnd() {
    return !!this.endSnapped?.();
  }


  constructor(offset, canvasScale, properties = {text: {color: "white"}}, removeShape) {
    super(properties, removeShape);
    this.offset = offset;
    this.#color = properties.color ?? "white";
    this.x1 = $state(properties.x1 ?? DEFAULT_X1 - offset.x);
    this.x2 = $state(properties.x2 ?? DEFAULT_X2 - offset.x);
    this.y1 = $state(properties.y1 ?? DEFAULT_Y - offset.y);
    this.y2 = $state(properties.y2 ?? DEFAULT_Y - offset.y);
    this.width = $state(properties.width ?? DEFAULT_WIDTH);

    this.start = $state(properties.start ?? "←");
    this.end = $state(properties.end ?? "");

    this.movingStart = $state(false);
    this.movingEnd = $state(false);

    this.startSnapped = $state();
    this.startSnappedShape = $state();
    this.endSnapped = $state();
    this.endSnappedShape = $state();

    this.position = $derived({
      x1: this.startSnapped?.().x ?? this.x1 + this.offset.x,
      y1: this.startSnapped?.().y ?? this.y1 + this.offset.y,
      x2: this.endSnapped?.().x ?? this.x2 + this.offset.x,
      y2: this.endSnapped?.().y ?? this.y2 + this.offset.y
    });

    this.widthWithScale = $derived({marker: MARKER_SIZE * canvasScale(), line: this.width * canvasScale()});
    this.middle = $derived({
      x: (this.position.x1 + this.position.x2) / 2,
      y: (this.position.y1 + this.position.y2) / 2
    });
    this.length = $derived(Math.sqrt(((this.position.x2 - this.position.x1) ** 2) + ((this.position.y2 - this.position.y1) ** 2)))

    this.#rotation = properties.rotation ?? 0;

    this.points = $derived({
      start: {x: this.position.x1, y: this.position.y1},
      end: {x: this.position.x2, y: this.position.y2},
    });

    let arrowPosBefore = {x1: 0, y1: 0, x2: 0, y2: 0};
    const moveCorner = (posString, dx, dy) => {
      const x = posString === "start" ? "x1" : "x2";
      const y = posString === "start" ? "y1" : "y2";
      const pointSnapped = posString === "start" ? "startSnapped" : "endSnapped";

      if (this[pointSnapped] !== undefined) {
        // checking whether the new position given no snapping is 20 points further away than the current position.
        // because arrowPosBefore does not include offset, we have to remove offset from point snapped
        if (Math.abs(this[pointSnapped]().x - offset.x - (arrowPosBefore[x] + dx)) > 20 ||
          Math.abs(this[pointSnapped]().y - offset.y - (arrowPosBefore[y] + dy)) > 20) {
          this[x] = this[pointSnapped]().x + dx;
          this[y] = this[pointSnapped]().y + dy;

          this[pointSnapped] = undefined;
          this[pointSnapped + "Shape"] = undefined;
        }
      } else {
        this[x] = arrowPosBefore[x] + dx;
        this[y] = arrowPosBefore[y] + dy;
      }
    }

    this.drag = new DraggableObject(
      () => {
        this.selected = true;
        arrowPosBefore.x1 = this.startSnapped?.().x ? this.startSnapped?.().x - offset.x : this.x1;
        arrowPosBefore.y1 = this.startSnapped?.().y ? this.startSnapped?.().y - offset.y : this.y1;
        arrowPosBefore.x2 = this.endSnapped?.().x ? this.endSnapped?.().x - offset.x : this.x2;
        arrowPosBefore.y2 = this.endSnapped?.().y ? this.endSnapped?.().y - offset.y : this.y2;
      },
      (dx, dy) => {
        if (this.movingStart) {
          moveCorner("start", dx, dy);
        } else if (this.movingEnd) {
          moveCorner("end", dx, dy);
        } else {
          this.x1 = arrowPosBefore.x1 + dx;
          this.y1 = arrowPosBefore.y1 + dy;
          this.x2 = arrowPosBefore.x2 + dx;
          this.y2 = arrowPosBefore.y2 + dy;
        }
      });
  }

  set color(color) {
    this.#color = color;
    this.start = this.start.replace(/#[0-9a-f]{6}/, color);
    this.end = this.end.replace(/#[0-9a-f]{6}/, color);
  }

  get color() {
    return this.#color
  }

  get rotation() {
    return Math.atan2(this.position.y2 - this.position.y1, this.position.x2 - this.position.x1)
      * (180 / Math.PI)
  }

  set rotation(targetRotation) {
  // Capture the middle point at the start
  const fixedMiddleX = this.middle.x;
  const fixedMiddleY = this.middle.y;
  const fixedMiddle = { x: fixedMiddleX, y: fixedMiddleY };

  // Calculate the rotation difference
  const currentRotation = this.rotation;
  const rotationDelta = targetRotation - currentRotation;

  // Rotate both endpoints by the delta
  const newPos1 = rotateCords(this.position.x1, this.position.y1, fixedMiddle, rotationDelta);
  const newPos2 = rotateCords(this.position.x2, this.position.y2, fixedMiddle, rotationDelta);

  // Update the underlying coordinates (accounting for offset)
  this.x1 = newPos1.x - this.offset.x;
  this.y1 = newPos1.y - this.offset.y;
  this.x2 = newPos2.x - this.offset.x;
  this.y2 = newPos2.y - this.offset.y;
}


  toJSON() {
    return {
      ...super.toJSON(),
      color: this.color,
      width: this.width,
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      start: this.start,
      end: this.end,
    };
  }

  isInside(x1, y1, x2, y2) {
    if (x2 < x1) {
      [x1, x2] = [x2, x1];
    }

    if (y2 < y1) {
      [y1, y2] = [y2, y1];
    }

    let arrowX1 = this.points.start.x;
    let arrowY1 = this.points.start.y;
    let arrowX2 = this.points.end.x;
    let arrowY2 = this.points.end.y;
    return (
      // start is inside the box
      (arrowX1 > x1 && arrowY1 > y1 &&
        arrowX1 < x2 && arrowY1 < y2) ||
      // end is inside box
      (arrowX2 > x1 && arrowY2 > y1 &&
        arrowX2 < x2 && arrowY2 > y2)
    );
  }
}


export default Arrow;