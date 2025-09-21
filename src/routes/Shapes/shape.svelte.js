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

export class BasicShape extends Shape {
  constructor(offset, getShapeArray, properties = {}) {
    super(getShapeArray, properties);
    this.x = $state(properties.x ?? DEFAULT_X - offset.x);
    this.y = $state(properties.y ?? DEFAULT_Y - offset.y);
    this.position = $derived({x: offset.x + this.x, y: offset.y + this.y});

    this.drag = new DraggableShape(this);
  }

  toJSON() {
    return {...super.toJSON(), x: this.x, y: this.y};
  }

  setDrag = (event) => {
    this.drag.setDrag(event);
  }
}