import {DraggableShape} from "./DraggableObject.svelte.js";
import {colord} from "colord";
import {ShapeText} from "./Text/Text.svelte.js";

const DEFAULT_X = 350;
const DEFAULT_Y = 250;
const DEFAULT_COLOR = colord("white");
const DEFAULT_TEXT_COLOR =  colord("white");

export default class Shape extends DraggableShape {
  constructor(offset, getShapeArray) {
    super(() => this)
    this.selected = $state(false);
    this.x = $state(DEFAULT_X - offset.x);
    this.y = $state(DEFAULT_Y - offset.y);
    this.color = $state(DEFAULT_COLOR)
    this.text = $state(new ShapeText(DEFAULT_TEXT_COLOR));

    this.position = $derived({x: offset.x + this.x, y: offset.y + this.y});

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