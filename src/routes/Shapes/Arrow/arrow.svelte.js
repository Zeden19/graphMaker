import {colord} from "colord";
import {ShapeText} from "../Text/Text.svelte.js";

const DEFAULT_X1 = 350;
const DEFAULT_X2 = DEFAULT_X1 + 100
const DEFAULT_Y = 250;
const DEFAULT_WIDTH = 5;
const DEFAULT_COLOR = colord("#FFFFFF");
const MARKER_SIZE = 4;

export class Arrow {
  #color = $state(DEFAULT_COLOR);

  constructor(offset, getShapeArray, canvasScale) {
    // consider point object that DraggableShape would use to determine movement
    // can also use to define rect
    this.x1 = $state(DEFAULT_X1 - offset.x);
    this.x2 = $state(DEFAULT_X2 - offset.x);
    this.y1 = $state(DEFAULT_Y - offset.y);
    this.y2 = $state(DEFAULT_Y - offset.y);
    this.width = $state(DEFAULT_WIDTH);

    this.text = new ShapeText("white");
    this.getShapeArray = getShapeArray;

    this.selected = $state(false);

    this.startSnapped = $state(null);
    this.endSnapped = $state(null);

    this.position = $derived.by(() => {
      let start;
      let end;

      if (this.startSnapped) start = {x1: this.startSnapped().x, y1: this.startSnapped().y};
      else start = {x1: this.x1 + offset.x, y1: this.y1 + offset.y};

      if (this.endSnapped) end = {x2: this.endSnapped().x, y2: this.endSnapped().y};
      else end = {x2: this.x2 + offset.x, y2: this.y2 + offset.y};

      return {...start, ...end}
    });

    this.widthWithScale = $derived({marker: MARKER_SIZE * canvasScale(), line: this.width * canvasScale()});
    this.middle = $derived({
      x: (this.position.x1 + this.position.x2) / 2,
      y: (this.position.y1 + this.position.y2) / 2
    });
    this.length = $derived(Math.sqrt(((this.position.x2 - this.position.x1) ** 2) + ((this.position.y2 - this.position.y1) ** 2)))
    this.rotation = $derived(Math.atan((this.position.y2 - this.position.y1) / (this.position.x2 - this.position.x1)));

    this.start = $state(`<path fill="${this.#color.toHex()}" d="M 0 0 L 10 5 L 0 10 z"/>`);
    this.end = $state("");

    this.rect = $derived({
      start: {x: this.position.x1, y: this.position.y1},
      end: {x: this.position.x2, y: this.position.y2},
    })
  }

  set color(color) {
    this.#color = color;
    this.start = this.start.replace(/#[0-9a-f]{6}/, color.toHex());
    this.end = this.end.replace(/#[0-9a-f]{6}/, color.toHex());
  }

  get color() {
    return this.#color;
  }


  delete() {
    const shapeArray = this.getShapeArray();
    setTimeout(() => {
      shapeArray.splice(shapeArray.findIndex((shape) => shape === this), 1)
    });
  }

  toString() {
    return "Arrow"
  }

}


export default Arrow;