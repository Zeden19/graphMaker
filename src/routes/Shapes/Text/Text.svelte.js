import {colord} from "colord";

export class ShapeText {
  constructor(color) {
    this.color = $state(colord(color));
    this.fontSize = $state(12);
    this.bold = $state(false);
    this.italic = $state(false);
    this.underline = $state(false);
  }
}

const DEFAULT_X = 350;
const DEFAULT_Y = 250;
const DEFAULT_WIDTH = 100;

export class GraphText extends ShapeText {
  constructor(offset, canvasScale) {
    super(colord("white"));
    this.x = $state(DEFAULT_X - offset.x);
    this.y = $state(DEFAULT_Y - offset.y);
    this.selected = $state(false);
    this.width = $state(DEFAULT_WIDTH);

    this.position = $derived({x: offset.x + this.x, y: offset.y + this.y});
  }

  delete = () => {
    dispatchEvent(new CustomEvent('deleteShape', {detail: {shape: this, type: 'text'}}))
  }

  toString() {
    return "Text";
  }
}