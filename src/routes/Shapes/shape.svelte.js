import {DraggableShape} from "./DraggableObject.svelte.js";
import {colord, extend} from "colord";
import {ShapeText} from "./Text/ShapeText.svelte.js";
import namesPlugin from "colord/plugins/names";

extend([namesPlugin]);

export class Shape {
  constructor(getShapeArray, properties = {}) {
    this.selected = $state(false);
    this.color = $state(colord(properties.color ?? "white"));
    this.text = $state(new ShapeText(properties.text ?? {}));
    this.getShapeArray = getShapeArray;
    this.isEditing = $state(false);
  }

  toJSON() {
    return {
      color: this.color.toHex(),
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

    this.strokeColor = $state(colord(properties.strokeColor ?? "black"));
    this.strokeWidth = $state(properties.strokeWidth ?? 2);

    this.rotation = $state(properties.rotation ?? 0);

    this.drag = new DraggableShape(this);
  }

  setDrag = (event) => {
    this.drag.setDrag(event);
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

  rotateRectCords = (x, y, center) => {
    const angleRadians = this.rotation * Math.PI / 180;

    const shifted = {x: x - center.x, y: y - center.y};

    const rotated = {
      x: shifted.x * Math.cos(angleRadians) - shifted.y * Math.sin(angleRadians),
      y: shifted.x * Math.sin(angleRadians) + shifted.y * Math.cos(angleRadians),
    }

    return {
      x: rotated.x + center.x,
      y: rotated.y + center.y,
    }
  }


  toJSON() {
    return {
      ...super.toJSON(),
      width: this.width,
      height: this.height,
      strokeWidth: this.strokeWidth,
      strokeColor: this.strokeColor.toHex(),
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