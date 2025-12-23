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

    this.drag = new DraggableObject(() => {
        this.selected = true;
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
    this.x = $state(properties.x ?? DEFAULT_X - offset.x);
    this.y = $state(properties.y ?? DEFAULT_Y - offset.y);
    this.position = $derived({x: offset.x + this.x, y: offset.y + this.y});

    this.#width = properties.width ?? DEFAULT_SIZE;
    this.#height = properties.height ?? DEFAULT_SIZE;
    this.widthWithScale = $derived((this.#width) * canvasScale());
    this.heightWithScale = $derived((this.#height) * canvasScale());

    this.strokeColor = $state(properties.strokeColor ?? "black");
    this.strokeWidth = $state(properties.strokeWidth ?? 2);

    this.rotation = $state(properties.rotation ?? 0);
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

  changeRight(dx, sizeBeforeWidth) {
    this.width = dx + sizeBeforeWidth;
  }

  changeBottom(dy, sizeBeforeHeight) {
    this.height = dy + sizeBeforeHeight;
  }

  changeLeft(dx, sizeBeforeWidth) {
    const oldWidth = this.width;
    this.width = sizeBeforeWidth - dx;
    const changeInWidth = oldWidth - this.width;
    this.x += changeInWidth;
  }

  changeTop(dy, sizeBeforeHeight) {
    const oldHeight = this.height;
    this.height = sizeBeforeHeight - dy;
    const changeInHeight = oldHeight - this.height;
    this.y += changeInHeight;
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