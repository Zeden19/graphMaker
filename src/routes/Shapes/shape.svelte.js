import {DraggableShape} from "./DraggableObject.svelte.js";
import {colord, extend} from "colord";
import {ShapeText} from "./Text/ShapeText.svelte.js";
import namesPlugin from "colord/plugins/names";

extend([namesPlugin]);

export class Shape {
  //todo look up way to spread constructor parent arguments onto children?
  constructor(getShapeArray, {color = "white", textColor = "black"}) {
    this.selected = $state(false);
    this.color = $state(colord(color));
    this.text = $state(new ShapeText({color: textColor}));
    this.getShapeArray = getShapeArray;
  }

  toJSON() {
    return {
      color: this.color.toHex(),
      text: JSON.stringify(this.text),
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
  constructor(offset, getShapeArray,
              {
                color = "white",
                textColor = "black",
                x = DEFAULT_X - offset.x,
                y = DEFAULT_Y - offset.y,
              }) {
    super(getShapeArray, {color, textColor});
    this.x = $state(x);
    this.y = $state(y);
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