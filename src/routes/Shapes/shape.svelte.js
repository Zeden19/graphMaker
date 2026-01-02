import DraggableObject from "./DraggableObject.svelte.js";
import {ShapeText} from "./Text/ShapeText.svelte.js";
import extractCoordinates from "$lib/extractCoordinates.js";

export class Shape {
  constructor(getShapeArray, properties = {}) {
    this.selected = $state(false);
    this.color = $state(properties.color ?? "white");
    this.text = $state(new ShapeText(properties.text ?? {}));
    this.getShapeArray = getShapeArray;
    this.isEditing = $state(false);
    this.shapePosBefore = {};
    this.gRef = $state();

    this.drag = new DraggableObject(() => {
        Object.entries(extractCoordinates(this)).forEach(([key, value]) => {
          this.shapePosBefore[key] = value;
        });
      },
      (dx, dy) => {
        Object.keys(extractCoordinates(this)).forEach((key) => {
          this[key] = (key.includes("x") ? dx : dy) + this.shapePosBefore[key];
        });
      });
  }

  toJSON() {
    return {
      color: this.color,
      text: JSON.parse(JSON.stringify(this.text)),
      toString: this.toString(),
    }
  }

  delete() {
    this.selected = false;
    const shapeArray = this.getShapeArray();
    setTimeout(() => {
      shapeArray.splice(shapeArray.findIndex((shape) => shape === this), 1)
    });
  }

  setDrag = (event) => {
    this.drag.setDrag(event);
  }

  toString() {
    return this.constructor.name;
  }
}

const DEFAULT_X = 350;
const DEFAULT_Y = 250;
const DEFAULT_SIZE = 100;
const MIN_SIZE = 10;

export class BasicShape extends Shape {
  #width = $state();
  #height = $state();
  constructor(offset, getShapeArray, canvasScale, properties = {}) {
    super(getShapeArray, properties);

    this.rotation = $state(properties.rotation ?? 0);
    this.#width = properties.width ?? DEFAULT_SIZE;
    this.#height = properties.height ?? DEFAULT_SIZE;

    // Store center position internally
    this.x = $state((properties.x ?? DEFAULT_X - offset.x) + this.#width / 2);
    this.y = $state((properties.y ?? DEFAULT_Y - offset.y) + this.#height / 2);

    // Derived center in canvas space
    this.center = $derived({
      x: offset.x + this.x,
      y: offset.y + this.y
    });

    // Derive the ROTATED top-left corner
    this.position = $derived(() => {
      const cx = this.center.x;
      const cy = this.center.y;
      const w = this.#width;
      const h = this.#height;
      const rad = (this.rotation * Math.PI) / 180;

      // Vector from center to unrotated top-left
      const dx = -w / 2;
      const dy = -h / 2;

      // Rotate this vector
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const rotatedDx = dx * cos - dy * sin;
      const rotatedDy = dx * sin + dy * cos;

      return {
        x: cx + rotatedDx,
        y: cy + rotatedDy
      };
    });

    this.widthWithScale = $derived((this.#width) * canvasScale());
    this.heightWithScale = $derived((this.#height) * canvasScale());

    this.strokeColor = $state(properties.strokeColor ?? "black");
    this.strokeWidth = $state(properties.strokeWidth ?? 2);
  }

  set width(width) {
    this.#width = Math.max(width, MIN_SIZE);
  }

  set height(height) {
    this.#height = Math.max(height, MIN_SIZE);
  }

  get height() {
    return this.#height;
  }

  get width() {
    return this.#width;
  }

  // Update resize methods to work with center-based positioning
  changeRight(dx, sizeBeforeWidth) {
    const newWidth = Math.max(dx + sizeBeforeWidth, MIN_SIZE);
    const widthDelta = newWidth - this.#width;

    // Moving right edge means center moves right by half the width change
    const rad = (this.rotation * Math.PI) / 180;
    this.x += (widthDelta / 2) * Math.cos(rad);
    this.y += (widthDelta / 2) * Math.sin(rad);

    this.#width = newWidth;
  }

  changeBottom(dy, sizeBeforeHeight) {
    const newHeight = Math.max(dy + sizeBeforeHeight, MIN_SIZE);
    const heightDelta = newHeight - this.#height;

    // Moving bottom edge means center moves down by half the height change
    const rad = (this.rotation * Math.PI) / 180;
    this.x -= (heightDelta / 2) * Math.sin(rad);
    this.y += (heightDelta / 2) * Math.cos(rad);

    this.#height = newHeight;
  }

  changeLeft(dx, sizeBeforeWidth) {
    const newWidth = Math.max(sizeBeforeWidth - dx, MIN_SIZE);
    const widthDelta = this.#width - newWidth;

    // Moving left edge means center moves left by half the width change
    const rad = (this.rotation * Math.PI) / 180;
    this.x += (widthDelta / 2) * Math.cos(rad);
    this.y += (widthDelta / 2) * Math.sin(rad);

    this.#width = newWidth;
  }

  changeTop(dy, sizeBeforeHeight) {
    const newHeight = Math.max(sizeBeforeHeight - dy, MIN_SIZE);
    const heightDelta = this.#height - newHeight;

    // Moving top edge means center moves up by half the height change
    const rad = (this.rotation * Math.PI) / 180;
    this.x -= (heightDelta / 2) * Math.sin(rad);
    this.y += (heightDelta / 2) * Math.cos(rad);

    this.#height = newHeight;
  }

  // Helper method to get the axis-aligned bounding box top-left
  // (useful if you still need the old behavior somewhere)
  getAxisAlignedTopLeft() {
    return {
      x: this.center.x - this.#width / 2,
      y: this.center.y - this.#height / 2
    };
  }

  toJSON() {
    return {
      ...super.toJSON(),
      width: this.width,
      height: this.height,
      strokeWidth: this.strokeWidth,
      strokeColor: this.strokeColor,
      rotation: this.rotation,
      x: this.x,
      y: this.y
    };
  }

  isInside(x1, y1, x2, y2) {
    return (
      // checking if physically inside
      (this.rect.left.x <= x2 && x2 <= this.rect.right.x &&
        this.rect.top.y <= y2 && y2 <= this.rect.bottom.y) ||

      // checking if contains it horizontally
      (this.rect.left.x > x1 && x2 > this.rect.right.x &&
        this.rect.top.y <= y2 && y2 <= this.rect.bottom.y) ||

      // checking if contains it vertically
      (this.rect.left.x <= x2 && x2 <= this.rect.right.x
        && this.rect.top.y > y1 && y2 > this.rect.bottom.y
      ));
  }

}


