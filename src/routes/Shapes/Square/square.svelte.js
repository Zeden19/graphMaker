import {Shape} from "../shape.svelte.js";
import {colord} from "colord";
import {ShapeText} from "../Text/Text.svelte.js";

const DEFAULT_SIZE = 200
const MAX_SIZE = 10;

export class Square extends Shape {
  #width = $state(DEFAULT_SIZE);
  #height = $state(DEFAULT_SIZE);

  constructor(offset, canvasScale, getShapeArray) {
    super(offset, "Square", colord("white"), getShapeArray);
    this.text = new ShapeText("black");
    this.strokeColor = $state(colord("black"));
    this.strokeWidth = $state(2);

    this.widthWithScale = $derived(this.#width * canvasScale());
    this.heightWithScale = $derived(this.#height * canvasScale());

    this.rect = $derived({
      top: {
        x: this.position.x + (this.widthWithScale / 2), y: this.position.y, cursor: "ns-resize",
        changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
          this.#changeTop(dy, sizeBeforeHeight);
        }
      },

      left: {
        x: this.position.x, y: this.position.y + (this.heightWithScale / 2), cursor: "ew-resize",
        changeSizeFnc: (dx, dy, sizeBeforeWidth, _) => {
          this.#changeLeft(dx, sizeBeforeWidth);
        }
      },

      right: {
        x: this.position.x + this.widthWithScale, y: this.position.y + (this.heightWithScale / 2), cursor: "ew-resize",
        changeSizeFnc: (dx, dy, sizeBeforeWidth, _) => {
          this.#changeRight(dx, sizeBeforeWidth);
        }
      },

      bottom: {
        x: this.position.x + (this.widthWithScale / 2), y: this.position.y + this.heightWithScale, cursor: "ns-resize",
        changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
          this.#changeBottom(dy, sizeBeforeHeight);
        }
      },

      topLeft: {
        x: this.position.x, y: this.position.y, cursor: "nwse-resize",
        changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
          this.#changeLeft(dx, sizeBeforeWidth);
          this.#changeTop(dy, sizeBeforeHeight);
        },
      },
      topRight: {
        x: this.position.x + this.widthWithScale, y: this.position.y, cursor: "nesw-resize",
        changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
          this.#changeTop(dy, sizeBeforeHeight);
          this.#changeRight(dx, sizeBeforeWidth);
        },
      },
      bottomLeft: {
        x: this.position.x, y: this.position.y + this.heightWithScale, cursor: "nesw-resize",
        changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
          this.#changeLeft(dx, sizeBeforeWidth);
          this.#changeBottom(dy, sizeBeforeHeight);
        },
      },
      bottomRight: {
        x: this.position.x + this.widthWithScale, y: this.position.y + this.heightWithScale, cursor: "nwse-resize",
        changeSizeFnc: (dx, dy, sizeBeforeWidth, sizeBeforeHeight) => {
          this.#changeRight(dx, sizeBeforeWidth);
          this.#changeBottom(dy, sizeBeforeHeight);
        }
      },
    });
  }

  #changeRight(dx, sizeBeforeWidth) {
    this.width = dx + sizeBeforeWidth;
  }

  #changeBottom(dy, sizeBeforeHeight) {
    this.height = dy + sizeBeforeHeight;
  }

  #changeLeft(dx, sizeBeforeWidth) {
    const oldWidth = this.#width;
    this.width = sizeBeforeWidth - dx;
    const changeInWidth = oldWidth - this.#width;
    this.x += changeInWidth;
  }

  #changeTop(dy, sizeBeforeHeight) {
    const oldHeight = this.#height;
    this.height = sizeBeforeHeight - dy;
    const changeInHeight = oldHeight - this.#height;
    this.y += changeInHeight;
  }

  set width(width) {
    this.#width = Math.max(width, MAX_SIZE);
  }

  set height(height) {
    this.#height = Math.max(height, MAX_SIZE);
  }

  get height() {
    return this.#height;
  }

  get width() {
    return this.#width;
  }
}