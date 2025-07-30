import {DraggableShape} from "./DraggableObject.svelte.js";
import {colord} from "colord";

const DEFAULT_X = 350;
const DEFAULT_Y = 250;

export default class Shape extends DraggableShape {
  constructor(offset, shapeString, color, getShapeArray) {
    super(() => this)
    this.selected = $state(false);
    this.x = $state(DEFAULT_X - offset.x);
    this.y = $state(DEFAULT_Y - offset.y);
    this.color = $state(colord(color))
    this.shapeString = shapeString;

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
    return this.shapeString;
  }
}