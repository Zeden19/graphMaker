import {Shape} from "../shape.svelte.js";
import DraggableObject from "../DraggableObject.svelte.js";
import {colord} from "colord";

const DEFAULT_X1 = 350;
const DEFAULT_X2 = DEFAULT_X1 + 100
const DEFAULT_Y = 250;
const DEFAULT_WIDTH = 5;
const MARKER_SIZE = 4;

export class Arrow extends Shape {
  #color = $state();

  constructor(offset, getShapeArray, canvasScale, properties = {text: {color: "white"}}) {
    super(getShapeArray, properties);
    this.#color = colord(properties.color ?? "white");
    this.x1 = $state(properties.x1 ?? DEFAULT_X1 - offset.x);
    this.x2 = $state(properties.x2 ?? DEFAULT_X2 - offset.x);
    this.y1 = $state(properties.y1 ?? DEFAULT_Y - offset.y);
    this.y2 = $state(properties.y2 ?? DEFAULT_Y - offset.y);
    this.width = $state(properties.width ?? DEFAULT_WIDTH);

    this.start = $state(properties.start ?? `<path fill="${this.#color.toHex()}" d="M 0 0 L 10 5 L 0 10 z"/>`);
    this.end = $state(properties.end ?? "");

    this.movingStart = $state(false);
    this.movingEnd = $state(false);

    this.position = $derived({
      x1: this.x1 + offset.x,
      y1: this.y1 + offset.y,
      x2: this.x2 + offset.x,
      y2: this.y2 + offset.y
    });

    this.widthWithScale = $derived({marker: MARKER_SIZE * canvasScale(), line: this.width * canvasScale()});
    this.middle = $derived({
      x: (this.position.x1 + this.position.x2) / 2,
      y: (this.position.y1 + this.position.y2) / 2
    });
    this.length = $derived(Math.sqrt(((this.position.x2 - this.position.x1) ** 2) + ((this.position.y2 - this.position.y1) ** 2)))
    this.rotation = $derived(Math.atan((this.position.y2 - this.position.y1) / (this.position.x2 - this.position.x1)));

    this.rect = $derived({
      start: {x: this.position.x1, y: this.position.y1},
      end: {x: this.position.x2, y: this.position.y2},
    });

    let arrowPosBefore = {x1: 0, y1: 0, x2: 0, y2: 0};
    const moveCorner = (posString, dx, dy) => {
      const x = posString === "start" ? "x1" : "x2";
      const y = posString === "start" ? "y1" : "y2";
      const cornerSnapped = posString === "start" ? "startSnapped" : "endSnapped";

      this[x] = arrowPosBefore[x] + dx;
      this[y] = arrowPosBefore[y] + dy;

      const index = getShapeArray().findIndex((arrow) => arrow === this);

      dispatchEvent(new CustomEvent("arrowMove", {
        detail: {
          x: this.position[x],
          y: this.position[y],
          index,
          pos: posString,
          cornerSnapped: this[cornerSnapped]
        }
      }));
    }

    this.drag = new DraggableObject(
      () => {
        this.selected = true;
        arrowPosBefore.x1 = this.x1;
        arrowPosBefore.y1 = this.y1;
        arrowPosBefore.x2 = this.x2;
        arrowPosBefore.y2 = this.y2;
      },
      (dx, dy) => {
        if (this.movingStart) {
          moveCorner("start", dx, dy);
        } else if (this.movingEnd) {
          moveCorner("end", dx, dy);
        } else {
          this.x1 = arrowPosBefore.x1 + dx;
          this.y1 = arrowPosBefore.y1 + dy;
          this.x2 = arrowPosBefore.x2 + dx;
          this.y2 = arrowPosBefore.y2 + dy;
          dispatchEvent(new CustomEvent("completelyUnsnapArrow", {
            detail: {
              index: this.index
            }
          }))
        }
      });
  }

  set color(color) {
    this.#color = color;
    this.start = this.start.replace(/#[0-9a-f]{6}/, color.toHex());
    this.end = this.end.replace(/#[0-9a-f]{6}/, color.toHex());
  }

  get color() {
    return this.#color
  }

  setDrag = (event) => {
    this.drag.setDrag(event)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      color: this.color.toHex(),
      width: this.width,
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      start: this.start,
      end: this.end,
    };
  }

}


export default Arrow;