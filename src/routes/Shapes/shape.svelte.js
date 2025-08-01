import {DraggableShape} from "./DraggableObject.svelte.js";
import {colord, extend} from "colord";
import {ShapeText} from "./Text/ShapeText.svelte.js";
import namesPlugin from "colord/plugins/names";

extend([namesPlugin]);

const DEFAULT_COLOR = colord("white");
const DEFAULT_TEXT_COLOR = colord("black");


export class Shape {
  constructor(getShapeArray) {
    this.selected = $state(false);
    this.color = $state(DEFAULT_COLOR);
    this.text = $state(new ShapeText(DEFAULT_TEXT_COLOR));
    this.getShapeArray = getShapeArray;
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
  constructor(offset, getShapeArray) {
    super(getShapeArray);
    this.x = $state(DEFAULT_X - offset.x);
    this.y = $state(DEFAULT_Y - offset.y);
    this.position = $derived({x: offset.x + this.x, y: offset.y + this.y});

    this.drag = new DraggableShape(this);
  }

  setDrag = (event) => {
    this.drag.setDrag(event);
  }
}